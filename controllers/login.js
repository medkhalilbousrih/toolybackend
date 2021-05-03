const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const axios = require("axios");

const loginRouter = require("express").Router();
const User = require("../models/user");

loginRouter.post("/fb", async (req, res, next) => {
  try {
    const { accessToken, userID } = req.body;
    const fbUser = await axios.get(
      `https://graph.facebook.com/v2.3/me?access_token=${accessToken}&method=get&pretty=0&sdk=joey&suppress_http_code=1`
    );
    if (userID === fbUser.data.id) {
      let user = await User.findOne({ fbId: userID });
      if (!user) {
        user = new User({
          email: req.body.email || "noemailaddres@noemail.com",
          name: req.body.name,
          role: req.body.role,
          fbId: userID,
          verified: true,
          imageUrl: req.body.picture.data.url,
        });
        await user.save();
      }
      user.imageUrl = req.body.picture.data.url;
      await user.save();
      const tokenData = {
        id: user._id,
        email: user.email,
      };

      const genToken = jwt.sign(tokenData, process.env.SECRET);
      res.json({
        id: user._id,
        name: user.name,
        role: user.role,
        token: genToken,
        avatar: user.imageUrl,
        cart: user.cart,
      });
    }
  } catch (exception) {
    next(exception);
  }
});

loginRouter.post("/", async (req, res, next) => {
  try {
    const data = req.body;
    const user = await User.findOne({ email: data.email });
    if (!user) {
      return res.status(401).send("wrong email or password");
    }
    const verifiedPassword = await bcrypt.compare(
      data.password,
      user.passwordHash
    );
    if (!user || !verifiedPassword) {
      return res.status(401).send("wrong email or password");
    } else if (!user.verified) {
      return res.status(401).send("Account not verified");
    }
    const tokenData = {
      id: user._id,
      email: user.email,
    };

    const genToken = jwt.sign(tokenData, process.env.SECRET);
    res.json({
      id: user._id,
      name: user.name,
      role: user.role,
      token: genToken,
      avatar: user.imageUrl,
      cart: user.cart,
    });
  } catch (exception) {
    next(exception);
  }
});

module.exports = loginRouter;
