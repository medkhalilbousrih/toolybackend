const express = require("express");
const morgan = require("morgan");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
const userRouter = require("./controllers/users");
const loginRouter = require("./controllers/login");
const middleware = require("./utils/middleware");
const toolRouter = require("./controllers/tools");
const adminRouter = require("./controllers/admins");
const categoryRouter = require("./controllers/categories");

app.use(cors());
app.use(express.static("build"));
app.use(express.json());
app.use(morgan("tiny"));
//test
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
app.use("/api/admin", adminRouter);
app.use("/api/categories", categoryRouter);

app.use(middleware.unknownEndpoint);
app.use(middleware.errorHandler);

module.exports = app;
