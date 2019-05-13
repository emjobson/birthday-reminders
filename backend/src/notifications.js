const Twilio = require("twilio");
const dotenv = require("dotenv");
dotenv.config();

/*
 * @param {array} notifications: array of objects
 *    {
 *      phoneNumber: {string} <10 digit number>
 *      text: {string} <text message to send>
 *    }
 */
exports.sendNotifications = function(notifications) {
  const client = new Twilio(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_AUTH_TOKEN
  );
  notifications.forEach(notification => {
    const options = {
      to: `+ ${notification.phoneNumber}`,
      from: process.env.TWILIO_PHONE_NUMBER,
      body: notification.text
    };
    // send message
    client.messages.create(options, (err, resp) => {
      if (err) {
        console.log(err);
      } else {
        const masked =
          notification.phoneNumber.substr(
            0,
            notification.phoneNumber.length - 5
          ) + "*****";
        console.log(`Message sent to ${masked}`);
      }
    });
  });
  console.log("Messages have been queued for delivery.");
};
