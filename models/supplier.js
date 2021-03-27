const mongoose = require("mongoose");
var uniqueValidator = require("mongoose-unique-validator");

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
        delete newObj.passwordHash;
      },
    },
  }
);

supplierSchema.plugin(uniqueValidator);

const Supplier = mongoose.model("Supplier", supplierSchema);
module.exports = Supplier;
