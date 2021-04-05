const CronJob = require("cron").CronJob;
const Tool = require("../models/tool");
//tool availability
//execute everyminute
const job = new CronJob("0 */1 * * * *", async () => {
  await Tool.updateMany(
    { state: "rented", "rentDetails.to": { $lt: new Date() } },
    { $set: { state: "available", rentDetails: null } }
  );
  console.log("updated rented tools", new Date());
});

module.exports = job;
