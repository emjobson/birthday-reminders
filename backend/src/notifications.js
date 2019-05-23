const Twilio = require("twilio");
const dotenv = require("dotenv");
const db = require("./db");
const utils = require("./utils");
dotenv.config();

/*
 * Function queries the database and sends relevant notifications to all users (if no user specified),
 * or a single user (if user specified).
 *
 * @param {string} user: optional string of user email -- entered if we want to send notification to specific user
 * @param {function} errorCallback: optional error callback -- entered if sending notification to specific user
 * @param {function} successCallback: optional success callback, called when all messages queued  -- entered if sending notification to specific user
 */

exports.gatherAndSendNotifications = function(
  user,
  errorCallback,
  successCallback
) {
  const pool = db.get();
  const usersQuery =
    "SELECT userID, preferences from Users" +
    (user ? " WHERE email='" + user + "'" : "") +
    ";";
  pool.query(usersQuery, (err, result) => {
    if (err) {
      if (errorCallback) {
        // provided when sendNotifications accessed via html method, as opposed to cron scheduler
        errorCallback();
      }
      console.log("error querying Users db to send notifications");
      throw err; // TODO: get rid of these, don't want to crash in prod --> will need to return instead so we don't send multiple error codes
    }
    let promises = [];
    for (let i = 0; i < result.length; i++) {
      const phoneNumber = JSON.parse(result[i].preferences).phoneNumber;
      const date = utils.dateString(new Date()); // will later look at preferences to determine correct date
      const friendsQuery =
        "SELECT name FROM Friends WHERE userID='" +
        result[i].userID +
        "' AND birthday='" +
        date +
        "';";
      const promise = new Promise((resolve, reject) => {
        pool.query(friendsQuery, (err, result) => {
          if (err) {
            if (errorCallback) {
              errorCallback();
            }
            console.log("error querying Friends db to send notifications");
            throw err;
          }
          const textMessage = utils.constructReminderText(result);
          resolve({
            phoneNumber: "+1" + phoneNumber,
            text: textMessage
          });
        });
      });
      promises.push(promise);
    }
    Promise.all(promises).then(notifications => {
      sendNotifications(notifications, successCallback);
    });
  });
};

/*
 * @param {array} notifications: array of objects
 *    {
 *      phoneNumber: {string} <11 digit number> (e.g. 14088874577)
 *      text: {string} <text message to send>
 *    }
 */
function sendNotifications(notifications, successCallback) {
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
  if (successCallback) {
    // for sending status 200 if messages were QUEUED
    successCallback();
  }
  console.log("Messages have been queued for delivery.");
}
