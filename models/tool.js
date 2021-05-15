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
      trim: true,
      validate: async function (nameVal) {
        //to check that it exist in category : validate gonan take a promise to find the catergory true ken shih sinon false
        const cat = await Category.findOne({ name: nameVal });
        if (cat) {
          return true;
        }
        return false;
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
    address: {
      state: {
        type: String,
        default: "unknown",
      },
      city: {
        type: String,
        default: "unknown",
      },
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
    tags: [
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
    rating: {
      value: {
        type: Number,
        default: 0,
      },
      total: {
        type: Number,
        default: 0,
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
