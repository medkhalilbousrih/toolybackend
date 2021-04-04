const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: "category required",
      unique: "category already exist",
      minlength: 3,
    },
    tools: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Tool",
      },
    ],
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
categorySchema.plugin(uniqueValidator);

const Category = mongoose.model("Category", categorySchema);
module.exports = Category;
