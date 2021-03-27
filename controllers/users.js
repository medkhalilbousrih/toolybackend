const Account = require("../models/account");
const Supplier = require("../models/supplier");
const Client = require("../models/client");
const accountRouter = require("express").Router();
const bcrypt = require("bcrypt");

accountRouter.post("/", async (req, res, next) => {
  try {
    const data = req.body;
    if (data.password.length < 7) {
      return res.status(400).send("password is too short");
    }
    const passwordHash = await bcrypt.hash(data.password, 10);
    const account = await new Account({
      email: data.email,
      username: data.username,
      role: data.role,
      phoneNumber: data.phoneNumber,
      passwordHash,
    });
    await account.validate();
    if (data.role === "client") {
      const client = await new Client({
        firstName: data.firstName,
        lastName: data.lastName,
        _account: account._id,
      });
      account._client = client._id;
      await client.save();
      const createdAccount = await account.save();
      const returnedData = await Account.findById(createdAccount._id).populate(
        "_client"
      );
      res.status(201).json(returnedData);
    } else {
      const supplier = await new Supplier({
        _account: account._id,
      });
      account._supplier = supplier._id;
      await supplier.save();
      const createdAccount = await account.save();
      const returnedData = await Account.findById(createdAccount._id).populate(
        "_supplier"
      );
      res.status(201).json(returnedData);
    }
  } catch (exception) {
    next(exception);
  }
});

module.exports = accountRouter;
