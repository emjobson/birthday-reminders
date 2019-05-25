const db = require("./db");
const utils = require("../utils");

const MODE = db.MODE_TEST;

db.connect(MODE, function() {
  console.log("connected to db");
});

exports.getUser = async email => {
  const pool = db.get();
  const query =
    "SELECT userID, email, preferences FROM Users WHERE " +
    "email=" +
    utils.quotesOrNULL(email) +
    ";";
  console.log(">>>query:", query);
  return new Promise((resolve, reject) => {
    pool.query(query, (err, result) => {
      if (err) {
        throw err;
      }
      resolve(result[0]);
    });
  });
};

exports.createUser = async (email, preferences) => {
  const pool = db.get();
  const query =
    "INSERT INTO Users (email, preferences) VALUES (" +
    utils.quotesOrNULL(email) +
    ", " +
    utils.quotesOrNULL(preferences) +
    ");";
  console.log(">>>query:", query);

  return new Promise((resolve, reject) => {
    pool.query(query, (err, result) => {
      if (err) {
        throw err;
      }
      console.log("added user " + email + " to Users table");
      resolve();
    });
  });
};

// TO ADD: SETFRIENDS

exports.getFriends = async (email, date) => {
  const pool = db.get();

  return new Promise((resolve, reject) => {
    pool.query(
      "SELECT userID FROM Users WHERE email=" + utils.quotesOrNULL(email),
      (err, result) => {
        if (err) {
          throw err;
        }
        const userID = result[0].userID;
        const query =
          "SELECT name, birthday FROM Friends WHERE userID=" +
          utils.quotesOrNULL(userID) +
          (date ? " AND birthday=" + utils.quotesOrNULL(date) : "") +
          ";";
        console.log(">>>query:", query);
        pool.query(query, (err, result) => {
          if (err) {
            throw err;
          }
          console.log(">>>result:", result);
          resolve(result);
        });
      }
    );
  });
};

exports.updatePreferences = async (email, preferences) => {
  const pool = db.get();
  const query =
    "UPDATE Users SET preferences=" +
    utils.quotesOrNULL(preferences) +
    " WHERE email=" +
    utils.quotesOrNULL(email) +
    ";";
  console.log(">>>query:", query);

  return new Promise((resolve, reject) => {
    pool.query(query, (err, result) => {
      if (err) {
        throw err;
      }
      console.log("updated Users table with preferences for " + email);
      resolve();
    });
  });
};

exports.getPreferences = async email => {
  const pool = db.get();
  const query =
    "SELECT preferences FROM Users WHERE " +
    "email=" +
    utils.quotesOrNULL(email) +
    ";";
  console.log(">>>query:", query);
  return new Promise((resolve, reject) => {
    pool.query(query, (err, result) => {
      if (err) {
        throw err;
      }
      console.log("queried Users for preferences for " + email);
      console.log(">>>preferences:", result[0].preferences);
      resolve(result[0].preferences);
    });
  });
};
