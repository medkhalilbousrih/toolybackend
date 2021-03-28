const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");

const supplierSchema = new mongoose.Schema(
  {
    tools: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Tool",
      },
    ],
    _account: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Account",
    },
    history: [{}],
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

supplierSchema.plugin(uniqueValidator);

const Supplier = mongoose.model("Supplier", supplierSchema);
module.exports = Supplier;
