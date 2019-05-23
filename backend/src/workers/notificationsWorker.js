const notifications = require("../notifications");

const notificationWorkerFactory = function() {
  return {
    run: function() {
      notifications.gatherAndSendNotifications();
    }
  };
};

module.exports = notificationWorkerFactory();
