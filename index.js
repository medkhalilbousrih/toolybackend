const http = require("http");
require("dotenv").config();
const app = require("./app");
//const job = require("./utils/updater");

const server = http.createServer(app);

//job.start();

server.listen(process.env.PORT, () => {
  console.log(`server listening on port ${process.env.PORT}`);
});
