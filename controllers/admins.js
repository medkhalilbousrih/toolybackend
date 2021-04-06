const Category = require("../models/category");
const adminRouter = require("express").Router();
const middleware = require("../utils/middleware");
const User = require("../models/user");

adminRouter.post("/category", middleware.userExtractor, async (req, res) => {
  if (req.loggedUser === "admin") {
    const data = req.body;
    const category = new Category({
      name: data.name,
    });
    const createdCategory = await category.save();
    res.status(201).json(createdCategory);
  }
});

adminRouter.post("/admin", middleware.userExtractor, async (req, res) => {
  try {
    if (req.loggedUser.role === "admin") {
      const data = req.body;
      const admin = new User({
        data,
      });
      await admin.save();
      res.status(401).end();
    }
  } catch (exception) {
    next(exception);
  }
});

adminRouter.delete("/:id", middleware.userExtractor, async (req, res) => {
  if (req.loggedUser === "admin") {
    await User.findByIdAndRemove(req.params.id);
    res.status(204).send("user deleted");
  }
});
