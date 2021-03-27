const Account = require("../models/account");
const Supplier = require("../models/supplier");
const Client = require("../models/client");
const accountRouter = require("express").Router();
const bcrypt = require("bcrypt");

accountRouter.post("/", async (req, res, next) => {
  try {
    const data = req.body;

    if (!data || data.password.length < 7) {
      return res.status(403).send("password is too short");
    }
    if (data.role !== "supplier" || data.role !== "client") {
      return res.status(401).send("invalid role");
    }

    const passwordHash = await bcrypt.hash(req.body.password, 10);
    const account = await new Account({
      email: data.email,
      role: data.role,
      phoneNumber: data.phoneNumber,
      passwordHash,
    });
    if (data.role === "client") {
      const client = await new Client({
        firstName: data.firstName,
        lastName: data.lastName,
        _account: account._id,
      });
      await client.save();
      account._client = client._id;

      const createdAccount = await account.save();
      const returnedData = await Account.findById(createdAccount._id).populate(
        "_client"
      );
      res.status(201).json(returnedData);
    } else if (data.role === "supplier") {
      const supplier = await new Supplier({
        name: data.name,
        _account: account._id,
      });
      await supplier.save();
      account._supplier = supplier._id;

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
