const CronJob = require("cron").CronJob;
const notificationsWorker = require("./workers/notificationsWorker");
const moment = require("moment");

const schedulerFactory = function() {
  return {
    start: function() {
      new CronJob(
        "00 6 * * *", // 6am PST
        function() {
          console.log(
            "Running Send Notifications Worker for " + moment().format()
          );
          notificationsWorker.run();
        },
        null,
        true,
        "America/Los_Angeles"
      );
    }
  };
};

module.exports = schedulerFactory();
