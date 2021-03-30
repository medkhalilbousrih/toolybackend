const toolRouter = require("express").Router();
const middleware = require("../utils/middleware");
const Tool = require("../models/tool");
const Supplier = require("../models/supplier");
const upload = require("../utils/image-upload");
const Client = require("../models/client");

toolRouter.post(
  "/",
  [upload.single("toolImage"), middleware.userExtractor],
  async (req, res, next) => {
    try {
      if (!req.loggedUser || req.loggedUser.role !== "supplier") {
        return res.status(401).end();
      }
      console.log(req.file);
      const loggedSupplier = await Supplier.findById(req.loggedUser._supplier);
      const tool = new Tool({
        ...req.body,
        imageUrl: `/uploads/${req.file.filename}`,
        state: "available",
        _supplier: loggedSupplier._id,
      });
      const createdTool = await tool.save();
      res.status(201).json(createdTool);

      //adding tool to supplier list
      loggedSupplier.tools = loggedSupplier.tools.concat(createdTool._id);
      await loggedSupplier.save();
    } catch (exception) {
      next(exception);
    }
  }
);

toolRouter.get("/", async (req, res, next) => {
  try {
    const tools = await Tool.find({}).populate("_supplier", {
      _id: 0,
      tools: 0,
    });
    res.json(tools);
  } catch (exception) {
    next(exception);
  }
});

toolRouter.get("/:id", async (req, res, next) => {
  try {
    const tool = await Tool.findById(req.params.id).populate("_supplier", {
      _id: 0,
      tools: 0,
    });
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
