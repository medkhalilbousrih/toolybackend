const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");

//uniqueValidator add unique validation to the schema , unique input

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: "email required",
      unique: "email already used",
      match: [
        /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
        "invalid email address",
      ],
    },
    username: {
      type: String,
      required: "username required",
      unique: "username exists",
      minlength: 3,
      trim: true,
    },
    passwordHash: {
      type: String,
    },
    phoneNumber: {
      type: String,
      required: "phone number required",
      trim: true,
    },
    role: {
      type: String,
      required: "no user role",
      enum: ["client", "supplier", "admin"],
    },
    imageUrl: {
      type: String,
      default: "/uploads/avatar.png",
    },
    firstName: {
      type: String,
      trim: true,
    },
    lastName: {
      type: String,
      trim: true,
    },
    tools: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Tool",
      },
    ],
    rented: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Tool",
      },
    ],
    history: [{}],
  },
  {
    //toJSON for the fron to decide what to return and what not; not returning the password, and the v of mongoose
    toJSON: {
      transform: (obj, newObj) => {
        newObj.id = obj._id;
        delete newObj._id;
        delete newObj.__v;
        delete newObj.passwordHash;
      },
    },
  }
);
userSchema.plugin(uniqueValidator);

//Pointing on user if there is, if not creating new user 
const User = mongoose.model("User", userSchema);
module.exports = User;
