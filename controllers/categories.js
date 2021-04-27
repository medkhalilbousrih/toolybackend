const categoryRouter = require("express").Router();
const Category = require("../models/category");

categoryRouter.get("/", async (req, res, next) => {
  try {
    const categories = await Category.find({});
    res.json(categories.map((cat) => cat.name));
  } catch (exception) {
    next(exception);
  }
});

module.exports = categoryRouter;
