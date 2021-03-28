const toolRouter = require("express").Router();
const middleware = require("../utils/middleware");
const Tool = require("../models/tool");
const Supplier = require("../models/supplier");

toolRouter.post("/", middleware.userExtractor, async (req, res, next) => {
  try {
    if (!req.loggedUser || req.loggedUser.role !== "supplier") {
      return res.status(401).end();
    }
    const loggedSupplier = await Supplier.findById(req.loggedUser._supplier);

    const tool = new Tool({
      ...req.body,
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
});

toolRouter.get("/", async (req, res, next) => {
  try {
    const tools = await Tool.find({}).populate("_supplier", {
      _id: 0,
    });
    res.json(tools);
  } catch (exception) {
    next(exception);
  }
});

module.exports = toolRouter;
