const toolRouter = require("express").Router();
const middleware = require("../utils/middleware");
const Tool = require("../models/tool");
const upload = require("../utils/image-upload");

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
        res.status(401).end();
      }
    } catch (exception) {
      next(exception);
    }
  }
);

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

toolRouter.get("/:id", async (req, res, next) => {
  try {
    const tool = await Tool.findById(req.params.id);
    res.json(tool);
  } catch (exception) {
    next(exception);
  }
});

toolRouter.put("/rent", middleware.userExtractor, async (req, res, next) => {
  try {
    if (req.loggedUser !== "client") {
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
              to: tool.to,
              client: req.loggedUser._id,
            },
          },
        });
      }
      res.status(401).send("tools rented successfully");
    } else {
      res.send("some tools are unavailable");
    }
  } catch (exception) {
    next(exception);
  }
});

module.exports = toolRouter;
