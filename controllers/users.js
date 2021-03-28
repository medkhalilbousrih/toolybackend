const Account = require("../models/account");
const Supplier = require("../models/supplier");
const Client = require("../models/client");
const accountRouter = require("express").Router();
const bcrypt = require("bcrypt");

accountRouter.post("/", async (req, res, next) => {
  try {
    const data = req.body;
    //checking password length
    if (data.password.length < 7) {
      return res.status(400).send("password is too short");
    }
    //password hashing
    const passwordHash = await bcrypt.hash(data.password, 10);
    const account = new Account({
      email: data.email,
      username: data.username,
      role: data.role,
      phoneNumber: data.phoneNumber,
      passwordHash,
    });
    //validating account before saving so its throws an exception before saving either supplier or client
    await account.validate();
    if (data.role === "client") {
      const client = new Client({
        firstName: data.firstName,
        lastName: data.lastName,
        _account: account._id,
      });
      account._client = client._id;
      await client.save();
    } else if (data.role === "supplier") {
      const supplier = new Supplier({
        _account: account._id,
      });
      account._supplier = supplier._id;
      await supplier.save();
    }
    await account.save();
    res.status(201).end();
  } catch (exception) {
    next(exception);
  }
});

module.exports = accountRouter;
