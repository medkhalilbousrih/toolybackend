const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");

const toolSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: "tool name required",
    },
    category: {
      type: String,
      required: "category required",
    },
    brand: {
      type: String,
      required: "category required",
    },
    price: {
      type: Number,
      required: "price required",
    },
    state: {
      type: String,
      required: "state required",
      enum: ["rented", "available"],
    },
    description: {
      type: String,
      required: "description",
      minlength: 10,
    },
    _supplier: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Supplier",
    },
    rentDetails: {
      from: {
        type: Date,
      },
      to: {
        type: Date,
      },
      client: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Client",
      },
    },
  },
  {
    toJSON: {
      transform: (obj, newObj) => {
        newObj.id = obj._id;
        delete newObj._id;
        delete newObj.__v;
      },
    },
  }
);
toolSchema.plugin(uniqueValidator);

const Tool = mongoose.model("Tool", toolSchema);
module.exports = Tool;
