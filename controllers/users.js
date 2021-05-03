const bcrypt = require("bcrypt");
const fs = require("fs");
const jwt = require("jsonwebtoken");
//aa
const User = require("../models/user");
const Tool = require("../models/tool");
const userRouter = require("express").Router();

const middleware = require("../utils/middleware");
const upload = require("../utils/image-upload");
const sendVerif = require("../utils/email-verification");

userRouter.post("/", async (req, res, next) => {
  try {
    const data = req.body;
    //checking role
    if (data.role === "admin") {
      return res.status(401).end();
    }
    //password length and verification
    if (!data.password || data.password.length < 6) {
      return res.status(400).send("password is too short");
    } else if (data.password !== data.passwordVerification) {
      return res
        .status(400)
        .send("password and password verification dont match");
    }
    //hashing passwod with bcrypt using 10 salt rounds
    const passwordHash = await bcrypt.hash(data.password, 10);

    const user = new User({
      email: data.email,
      name: data.name,
      role: data.role,
      phoneNumber: data.phoneNumber,
      passwordHash,
    });

    const createdUser = await user.save();
    res.status(201).json(createdUser);
    //sending verification email
    await sendVerif(createdUser._id, createdUser.email);
  } catch (exception) {
    next(exception);
  }
});

userRouter.get("/confirmation/:token", async (req, res, next) => {
  try {
    const token = req.params.token;
    const id = jwt.verify(token, process.env.SECRET).id;
    await User.findByIdAndUpdate(id, { $set: { verified: true } });
    res.status(200).end("Account Verified");
  } catch (exception) {
    next(exception);
  }
});

userRouter.get("/mydata", middleware.userExtractor, async (req, res, next) => {
  try {
    const info = await User.findById(req.loggedUser._id).populate(
      "tools rented"
    );
    res.json(info);
  } catch (exception) {
    next(exception);
  }
});

userRouter.get("/:id", async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).populate("tools");
    if (user.role !== "admin") {
      res.json(user);
    } else {
      res.status(401).end();
    }
  } catch (exception) {
    next(exception);
  }
});

userRouter.put("/cart", middleware.userExtractor, async (req, res, next) => {
  try {
    const user = await User.findById(req.loggedUser._id);
    if (user.role === "client") {
      user.cart = req.body;
      await user.save();
      res.json("added to cart");
    }
    res.status(200).end();
  } catch (exception) {
    next(exception);
  }
});

userRouter.put(
  "/",
  middleware.userExtractor,
  upload.single("imageUrl"),
  //go to image upload file
  async (req, res, next) => {
    try {
      const data = req.body;
      const user = req.loggedUser;

      const imgUrl = req.file ? `/uploads/${req.file.filename}` : user.imageUrl;

      if (req.file && user.imageUrl !== "/uploads/avatar.jpg") {
        try {
          fs.unlinkSync(`build${user.imageUrl}`);
        } catch (error) {
          console.log(error);
        }
      }

      user.name = data.name || user.name;
      user.phoneNumber = data.phoneNumber || user.phoneNumber;
      user.imageUrl = imgUrl;

      user.address.state = data.state || user.address.state;
      user.address.city = data.city || user.address.city;
      user.address.street = data.street || user.address.street;

      user.role === "client" &&
        (user.birthday = data.birthday || user.birthday);

      if (
        data.password &&
        data.password.length > 6 &&
        data.password === data.passwordVerification
      ) {
        const passwordHash = await bcrypt.hash(data.password, 10);
        user.passwordHash = passwordHash;
      }

      const updatedUser = await user.save();
      res.json(updatedUser);
    } catch (exception) {
      next(exception);
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }
    }
  }
);

userRouter.delete(
  "/delete",
  middleware.userExtractor,
  async (req, res, next) => {
    try {
      if (req.loggedUser.role === "supplier") {
        await Tool.deleteMany({ _id: { $in: req.loggedUser.tools } });
      }
      await User.findByIdAndRemove(req.loggedUser._id);
      res.status(204).end();
    } catch (exception) {
      next(exception);
    }
  }
);

module.exports = userRouter;
