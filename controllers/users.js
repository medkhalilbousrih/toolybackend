const User = require("../models/user");
const userRouter = require("express").Router();
const bcrypt = require("bcrypt");
const middleware = require("../utils/middleware");
const upload = require("../utils/image-upload");
const fs = require("fs");

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
  } catch (exception) {
    next(exception);
  }
});

userRouter.get("/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id).populate("tools rented");
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

      if (req.file && user.imageUrl !== "/uploads/avatar.png") {
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

module.exports = userRouter;
