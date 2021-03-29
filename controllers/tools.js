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
      tools: 0,
    });
    res.json(tools);
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
        client: req.loggedUser._id,
      };
      await rentedTool.save();
      res.json(rentedTool);
    } catch (exception) {
      next(exception);
    }
  }
);

module.exports = toolRouter;
