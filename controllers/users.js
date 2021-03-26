const User = require("../models/account");
const userRouter = require("express").Router();
const bcrypt = require("bcrypt");

userRouter.post("/", async (req, res) => {
  try {
    const data = req.body;
    if (req.body.password.length < 7) {
      return res.status(403).send("password is too short");
    }
    const passwordHash = await bcrypt.hash(req.body.password, 10);
    const user = await new User({
      email: data.email,
      type: data.type,
      passwordHash,
    });
    const createdUser = await user.save();
    res.status(201).json(createdUser);
  } catch (exception) {
    res.status(500).send(exception.message);
  }
});

module.exports = userRouter;
