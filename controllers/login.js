const loginRouter = require("express").Router();
const User = require("../models/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

loginRouter.post("/", async (req, res, next) => {
  try {
    const data = req.body;
    const user = await User.findOne({ username: data.username });
    const verifiedPassword = await bcrypt.compare(
      data.password,
      user.passwordHash
    );
    if (!user || !verifiedPassword) {
      return res.status(401).send("wrong username or password");
    }
    const tokenData = {
      id: user._id,
      username: user.username,
    };
    const genToken = jwt.sign(tokenData, process.env.SECRET);
    res.json({ username: user.username, role: user.role, token: genToken });
  } catch (exception) {
    next(exception);
  }
});

module.exports = loginRouter;
