const toolRouter = require("express").Router();
const middleware = require("../utils/middleware");
const Tool = require("../models/tool");
const upload = require("../utils/image-upload");
const User = require("../models/user");

toolRouter.post(
  "/",
  [upload.array("toolImages", 5), middleware.userExtractor],
  async (req, res, next) => {
    try {
      if (req.loggedUser.role === "supplier") {
        const data = req.body;
        const urls = req.files.map((f) => `/uploads/${f.filename}`);
        const user = req.loggedUser;
        const tool = new Tool({
          name: data.name,
          category: data.category,
          brand: data.brand,
          price: data.price,
          state: "available",
          description: data.description,
          supplier: user._id,
          imageUrls: urls,
        });
        const createdTool = await tool.save();
        user.tools = user.tools.concat(tool._id);
        user.save();
        res.status(201).json(createdTool);
      } else {
        res.status(401).end("needs to be a supplier");
      }
    } catch (exception) {
      next(exception);
    }
  }
);

toolRouter.get("/:id", async (req, res, next) => {
  try {
    const tool = await Tool.findById(req.params.id).populate("supplier");
    res.json(tool);
  } catch (exception) {
    next(exception);
  }
});

toolRouter.get("/", async (req, res, next) => {
  try {
    if (!req.query.category) {
      const tools = await Tool.find({});
      return res.json(tools);
    }
    const tools = await Tool.find({ category: req.query.category });
    res.json(tools);
  } catch (exception) {
    next(exception);
  }
});

toolRouter.delete("/:id", middleware.userExtractor, async (req, res, next) => {
  try {
    const tool = await Tool.findById(req.params.id);
    if (tool.supplier.toString() === req.loggedUser._id.toString()) {
      const supplier = await User.findById(req.loggedUser._id);
      supplier.tools = supplier.tools.filter(
        (t) => t.toString() !== req.params.id.toString()
      );
      supplier.save();
      await tool.remove();
      res.status(204).end();
    } else {
      res.status(401).end();
    }
  } catch (exception) {
    next(exception);
  }
});

toolRouter.put("/rent", middleware.userExtractor, async (req, res, next) => {
  try {
    if (req.loggedUser.role !== "client") {
      return res.status(401).send("needs to be a client");
    }
    const toolsToRent = req.body;

    const ids = toolsToRent.map((t) => t.id);
    const toolList = await Tool.find({ _id: { $in: ids } });
    const invalid = toolList.map((tool) => tool.state).includes("rented");

    if (!invalid) {
      for (let tool of toolList) {
        await Tool.findByIdAndUpdate(tool.id, {
          $set: {
            state: "rented",
            rentDetails: {
              from: new Date(),
              to: toolsToRent.find(
                (t) => t.id.toString() === tool._id.toString()
              ).to,
              client: req.loggedUser._id,
            },
          },
        });
      }
      res.send("tools rented successfully");
    } else {
      res.status(400).send("some tools are unavailable");
    }
  } catch (exception) {
    //in the middleware we have error handleer
    next(exception);
  }
});

module.exports = toolRouter;
