const bcrypt = require("bcrypt");
const fs = require("fs");
const jwt = require("jsonwebtoken");

const User = require("../models/user");
const userRouter = require("express").Router();
const middleware = require("../utils/middleware");
const upload = require("../utils/image-upload");
const Tool = require("../models/tool");
const sendVerif = require("../utils/email-verification");

userRouter.post("/", async (req, res, next) => {
  try {
    const data = req.body;
    //checking password length
    if (data.role === "admin") {
      return res.status(401).end();
    }
    if (!data.password || data.password.length < 7) {
      return res.status(400).send("password is too short");
    } else if (data.password !== data.passwordVerification) {
      return res
        .status(400)
        .send("password and password verification dont match");
    }
    //password hashing with bycript / await asynchrone
    const passwordHash = await bcrypt.hash(data.password, 10);
    const user = new User({
      email: data.email,
      username: data.username,
      role: data.role,
      phoneNumber: data.phoneNumber,
      firstName: data.firstName || "",
      lastName: data.lastName || "",
      passwordHash,
    });

    const createdUser = await user.save();
    res.status(201).json(createdUser);
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
    const info = await User.findById(req.loggedUser._id).populate("tools");
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
        fs.unlinkSync(`build${user.imageUrl}`);
      }

      user.phoneNumber = data.phoneNumber || user.phoneNumber;
      user.imageUrl = imgUrl;
      user.firstName = data.firstName || user.firstName;
      user.lastName = data.lastName || user.lastName;

      const updatedUser = await user.save();
      res.json(updatedUser);
    } catch (exception) {
      fs.unlinkSync(req.file.path);
      next(exception);
    }
  }
);

userRouter.delete("/:id", middleware.userExtractor, async (req, res, next) => {
  try {
    if (req.params.id.toString() === req.loggedUser._id.toString()) {
      if (req.loggedUser.role === "supplier") {
        await Tool.deleteMany({ _id: { $in: req.loggedUser.tools } });
      }
      await User.findByIdAndRemove(req.params.id);
      res.status(204).end();
    } else {
      res.status(401).end();
    }
  } catch (exception) {
    next(exception);
  }
});

module.exports = userRouter;
