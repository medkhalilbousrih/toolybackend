const mongoose = require("mongoose");
var uniqueValidator = require("mongoose-unique-validator");

const accountSchema = new mongoose.Schema(
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
    passwordHash: {
      type: String,
    },
    phoneNumber: {
      type: String,
      required: "phone number required",
    },
    role: {
      type: String,
      required: "no user role",
      enum: ["client", "supplier"],
    },
    _client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Client",
    },
    _supplier: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Supplier",
    },
  },
  {
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
accountSchema.plugin(uniqueValidator);
const Account = mongoose.model("Account", accountSchema);
module.exports = Account;
