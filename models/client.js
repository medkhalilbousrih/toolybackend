const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");

const clientSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: "firstname required",
    },
    lastName: {
      type: String,
      required: "lastname required",
    },
    rented: [
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

clientSchema.plugin(uniqueValidator);

const Client = mongoose.model("Client", clientSchema);
module.exports = Client;
