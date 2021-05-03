const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");

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
    name: {
      type: String,
      required: "name required",
      minlength: 3,
      trim: true,
    },
    passwordHash: {
      type: String,
    },
    fbId: {
      type: String,
      unique: true,
    },
    phoneNumber: {
      type: String,
      trim: true,
    },
    role: {
      type: String,
      required: "no user role",
      enum: ["client", "supplier", "admin"],
    },
    address: {
      state: {
        type: String,
        default: "unknown",
      },
      city: {
        type: String,
        default: "unknown",
      },
      street: {
        type: String,
        default: "unknown",
      },
    },
    birthday: {
      type: Date,
    },
    imageUrl: {
      type: String,
      default: "/uploads/avatar.jpg",
    },
    verified: {
      type: Boolean,
      default: false,
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
    cart: [],
  },
  {
    toJSON: {
      transform: (obj, newObj) => {
        newObj.id = obj._id;
        delete newObj._id;
        delete newObj.__v;
        delete newObj.passwordHash;
        delete newObj.verified;
      },
    },
  }
);
userSchema.plugin(uniqueValidator);

const User = mongoose.model("User", userSchema);
module.exports = User;
