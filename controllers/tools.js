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

toolRouter.put(
  "/rent/:id",
  middleware.userExtractor,
  async (req, res, next) => {
    try {
      if (!req.loggedUser || req.loggedUser.role !== "client") {
        return res.status(401).end();
      }
      const data = req.body;
      const rentedTool = await Tool.findById(req.params.id);
      const client = await Client.findById(req.loggedUser._client);

      if (rentedTool.state !== "available") {
        return res.status(401).end();
      }

      rentedTool.state = "rented";

      //fixing date offset
      const dateFrom = new Date();
      dateFrom.setHours(dateFrom.getHours() + 1);

      const dateTo = new Date(data.to);
      dateTo.setHours(dateTo.getHours() + 2);

      rentedTool.rentDetails = {
        from: dateFrom,
        to: dateTo,
        client: client._id,
      };

      await rentedTool.save();
      res.json(rentedTool);

      client.rented = client.rented.concat(rentedTool._id);
      await client.save();
    } catch (exception) {
      next(exception);
    }
  }
);

module.exports = toolRouter;
