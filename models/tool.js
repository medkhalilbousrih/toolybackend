const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");
const Category = require("./category");

const toolSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: "tool name required",
      trim: true,
    },
    category: {
      type: String,
      required: "category required",
      enum: [],
      trim: true,
      validate: function (nameVal) {
        return new Promise(function (resolve, reject) {
          Category.findOne({ name: nameVal }, (err, cat) =>
            resolve(cat ? true : false)
          );
        });
      },
    },
    brand: {
      type: String,
      required: "brand required",
      trim: true,
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
      trim: true,
    },
    supplier: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    imageUrls: [
      {
        type: String,
      },
    ],
    rentDetails: {
      from: {
        type: Date,
      },
      to: {
        type: Date,
      },
      client: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
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
