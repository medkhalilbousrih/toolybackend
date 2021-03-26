const express = require("express");
const app = express();
const morgan = require("morgan");
const mongoose = require("mongoose");
const userRouter = require("./controllers/users");

app.use(express.json());
app.use(morgan("tiny"));

mongoose
  .connect(process.env.MONGOURL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
    useCreateIndex: true,
  })
  .then((res) => console.log("connected to database"))
  .catch((err) => console.log(err));

app.use("/users", userRouter);

module.exports = app;
