const CronJob = require("cron").CronJob;
const Tool = require("../models/tool");
//tool availability
const job = new CronJob("0 */1 * * * *", async () => {
  //fixing date offset
  const date = new Date();
  date.setHours(date.getHours() + 1);

  await Tool.updateMany(
    { state: "rented", "rentDetails.to": { $lt: date } },
    { $set: { state: "available", rentDetails: null } }
  );
  console.log("updated rented tools", date);
});

module.exports = job;
