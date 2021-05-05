const Category = require("../models/category");
const adminRouter = require("express").Router();
const middleware = require("../utils/middleware");
const User = require("../models/user");
const bcrypt = require("bcrypt");

adminRouter.post("/category", middleware.userExtractor, async (req, res) => {
  if (req.loggedUser.role === "admin") {
    const data = req.body;
    console.log(data);
    const category = new Category({
      name: data.name,
    });
    const createdCategory = await category.save();
    res.status(201).json(createdCategory);
  }
});

adminRouter.post("/", middleware.userExtractor, async (req, res, next) => {
  try {
    if (req.loggedUser.role === "admin") {
      const data = req.body;
      const passwordHash = await bcrypt.hash(data.password, 10);
      const admin = new User({
        email: data.email,
        name: data.name,
        role: "admin",
        phoneNumber: data.phoneNumber,
        passwordHash,
      });
      const createdAdmin = await admin.save();
      res.status(201).json(createdAdmin);
    }
  } catch (exception) {
    next(exception);
  }
});

adminRouter.delete("/:id", middleware.userExtractor, async (req, res) => {
  await User.findByIdAndRemove(req.params.id);
  res.status(204).send("user deleted");
});

module.exports = adminRouter;
