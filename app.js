const express = require("express");
const app = express();
const morgan = require("morgan");
const mongoose = require("mongoose");
const userRouter = require("./controllers/users");
const loginRouter = require("./controllers/login");
const middleware = require("./utils/middleware");
const toolRouter = require("./controllers/tools");

//app.use(express.static("build"));

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

app.use("/api/users", userRouter);
app.use("/api/login", loginRouter);
app.use("/api/tools", toolRouter);

app.use(middleware.unknownEndpoint);
app.use(middleware.errorHandler);

module.exports = app;
