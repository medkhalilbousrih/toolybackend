const Account = require("../models/user");
const jwt = require("jsonwebtoken");

const errorHandler = (err, req, res, next) => {
  console.log(err.message);
  res.status(500).end(err.message);
};
const unknownEndpoint = (req, res) => {
  res.status(404).end();
};

const userExtractor = async (req, res, next) => {
  try {
    let token = req.get("authorization");
    // checking valid token
    if (token && token.startsWith("Bearer ")) {
      token = token.substring(7);
      decodedToken = jwt.verify(token, process.env.SECRET);
      //addding logged user to request data
      req.loggedUser = await Account.findById(decodedToken.id);
      next();
    } else {
      return res.status(500).send("invalid token");
    }
  } catch (exception) {
    next(exception);
  }
};

module.exports = { errorHandler, unknownEndpoint, userExtractor };
