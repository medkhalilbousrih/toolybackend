const CronJob = require("cron").CronJob;
const Tool = require("../models/tool");
const User = require("../models/user");
//tool availability
//execute everyminute
const job = new CronJob("0 */1 * * * *", async () => {
  const tools = await Tool.find({
    state: "rented",
    "rentDetails.to": { $lt: new Date() },
  });
  for (tool of tools) {
    const user = await User.findById(tool.rentDetails.client);
    tool.state = "available";
    user.rented = user.rented.filter(
      (t) => t.toString() !== tool._id.toString()
    );
    tool.rentDetails = null;
    await tool.save();
    await user.save();
  }

  console.log("updated rented tools", new Date());
});

module.exports = job;
