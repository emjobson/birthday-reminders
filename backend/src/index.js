const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const jwt = require("express-jwt");
const jwksRsa = require("jwks-rsa");
const db = require("./data/db");
const notifications = require("./notifications");
const utils = require("./utils");
const scheduler = require("./schedulerFactory");
const dataAccess = require("./data/data_access");

const MODE = db.MODE_TEST;

const app = express();

app.use(helmet());
app.use(bodyParser.json());
app.use(cors());
app.use(morgan("combined"));

db.connect(MODE, function() {
  console.log("connected to db");
});

scheduler.start(); // TEMP for testing cron scheduler --> should send me a text every minute

const checkJwt = jwt({
  secret: jwksRsa.expressJwtSecret({
    cache: true,
    rateLimit: true,
    jwksRequestsPerMinute: 5,
    jwksUri: `https://dev-ztfv3x1b.auth0.com
    /.well-known/jwks.json`
  }),

  // Validate the audience and the issuer.
  audience: "8tEnAcZ7XdMQFb2NWTI6KcC27W90qVOL", // my auth0 client id
  issuer: `https://dev-ztfv3x1b.auth0.com
  /`, // my auth0 domain
  algorithms: ["RS256"]
});

// HOW TO USE checkJwt
app.post("/", checkJwt, (req, res) => {
  // checkJwt an express middleware that validates ID tokens
  const { id, bday } = req.body;
  tempBirthdayDB[id] = bday;
  res.status(200).send();
});

// API endpoints

/*
 * Create User
 *
 * Updates database User table by adding a user (string email) with specified preferences.
 *
 * Body:
 *  email: string
 *  preferences: stringified preferences object
 */

app.post("/users", async (req, res) => {
  // TODO: checkJwt makes endpoint only available to authenticated users --> do I want it here?
  const { email, preferences } = req.body;
  try {
    await dataAccess.createUser(email, preferences);
    res.status(200).send();
  } catch (err) {
    res.status(500).send();
  }
});

/*
 * Get User
 *
 * Looks up and returns friends and preferences for the given user.
 *
 */

app.get("/users/:email", async (req, res) => {
  const uriParsed = req.path.split("/");
  const email = uriParsed[uriParsed.length - 1];
  try {
    const result = await dataAccess.getUser(email);
    console.log("queried Users table for friends and preferences for " + email);
    res.send(result);
  } catch (err) {
    res.status(500).send(); // internal server error
  }
});

/*
 * Get Preferences
 *
 * Looks up and returns preferences for the given user.
 */

app.get("/users/:email/preferences", async (req, res) => {
  const uriParsed = req.path.split("/");
  const email = uriParsed[uriParsed.length - 2];
  try {
    const result = await dataAccess.getPreferences(email);
    res.send(result);
  } catch (err) {
    res.status(500).send();
  }
});

/*
 * Update Preferences
 *
 * Takes in a user and a JSON object of the user's preferences, updating the User
 * table by replacing the old preferences with the new preferences for the given user.
 *
 * Body:
 *  preferences: JSON stringified preferences object
 */

app.put("/users/:email/preferences", async (req, res) => {
  const { preferences } = req.body;
  const uriParsed = req.path.split("/");
  const email = uriParsed[uriParsed.length - 2];
  try {
    await dataAccess.updatePreferences(email, preferences);
    res.status(200).send();
  } catch (err) {
    res.status(500).send();
  }
});

/*
 * Delete User
 *
 * Removes the given user from the User table, and removes all of user's entries
 * from the Friends table.
 */

app.delete("/users/:email", (req, res) => {
  const uriParsed = req.path.split("/");
  const email = uriParsed[uriParsed.length - 1];
  const pool = db.get();

  // look up userID
  pool.query(
    "SELECT userID FROM Users WHERE email=" + utils.quotesOrNULL(email) + ";",
    (err, result) => {
      if (err) {
        res.status(500).send();
        throw err;
      }
      const userID = result[0].userID;
      console.log(">>>userID:", userID);
      // delete entry in User table
      let query =
        "DELETE FROM Users WHERE email=" + utils.quotesOrNULL(email) + ";";
      console.log(">>>query:", query);
      pool.query(query, (err, result) => {
        if (err) {
          res.status(500).send();
          throw err;
        }
        // delete from Friends table
        query =
          "DELETE FROM Friends WHERE userID=" +
          utils.quotesOrNULL(userID) +
          ";";
        console.log(">>>query:", query);
        pool.query(query, (err, result) => {
          if (err) {
            res.status(500).send();
            throw err;
          }
          res.status(200).send();
        });
      });
    }
  );
});

/*
 * Add Friends
 *
 * Updates the Friends table by adding all the entries in the friends object (friendName -> bday)
 * for the given user.
 *
 * Body:
 *  friends: JSON obj mapping name --> birthday (4 char string, MMDD)
 */

app.post("/users/:email/friends", (req, res) => {
  const { friends } = req.body;
  console.log(">>>friends:", friends);
  const uriParsed = req.path.split("/");
  const email = uriParsed[uriParsed.length - 2];
  const pool = db.get();

  pool.query(
    "SELECT userID FROM Users WHERE email=" + utils.quotesOrNULL(email) + ";",
    (err, result) => {
      if (err) {
        res.status(500).send();
        throw err;
      }
      const userID = result[0].userID;
      const names = Object.keys(friends);
      let values = "";
      for (let i = 0; i < names.length; i++) {
        values +=
          "(" +
          utils.quotesOrNULL(names[i]) +
          ", " +
          utils.quotesOrNULL(friends[names[i]]) +
          ", " +
          userID +
          (i < names.length - 1 ? "), " : ")");
      }
      const query =
        "INSERT INTO Friends(name, birthday, userID) VALUES " + values + ";";
      console.log(">>>query:", query);
      pool.query(query, (err, result) => {
        if (err) {
          console.log(">>>addFriends err", err);
          res.status(500).send();
          throw err;
        }
        res.status(200).send();
      });
    }
  );
});

/*
 * Get Friends
 *
 * For the given user, perform lookup in the Friends table to get all friends or friends for a specific date.
 *
 * Body:
 *  date: string date, can be null or undefined if no date desired
 */

app.get("/users/:email/friends", async (req, res) => {
  const { date } = req.body; // if unspecified, return all friends
  const uriParsed = req.path.split("/");
  const email = uriParsed[uriParsed.length - 2];
  try {
    const result = await dataAccess.getFriends(email, date);
    res.send(result);
  } catch (err) {
    res.status(500).send();
  }
});

/*
 * WIP: Modify Friends
 * TODO: do I need this?
 *
 * For the given user, iterates through update object (oldFriendName -> [newName/null, newBday/null]),
 * updating the Friends table for each user/oldFriendName entry.
 */

app.put("/users/:email/friends", (req, res) => {
  const uriParsed = req.path.split("/");
  const email = uriParsed[uriParsed.length - 2];
  const pool = db.get();
});

/*
 * Delete Friends
 *
 * For the given user, remove entries in Friends specified by the array of friend names.
 *
 * Body:
 *  names: array of string names
 */

app.delete("/users/:email/friends", (req, res) => {
  const { names } = req.body; // assuming "names" arr in body is non-empty
  const uriParsed = req.path.split("/");
  const email = uriParsed[uriParsed.length - 2];
  const pool = db.get();

  pool.query(
    "SELECT userID FROM Users WHERE email=" + utils.quotesOrNULL(email),
    (err, result) => {
      if (err) {
        res.status(500).send();
        throw err;
      }
      const userID = result[0].userID;
      const namesStringified = JSON.stringify(names);
      const namesStr =
        "(" + namesStringified.slice(1, namesStringified.length - 1) + ")";
      const query = // TODO: is this too slow?
        "DELETE FROM Friends WHERE userID=" +
        utils.quotesOrNULL(userID) +
        " AND name IN" +
        namesStr +
        ";";
      console.log(">>>query:", query);
      pool.query(query, (err, result) => {
        if (err) {
          res.status(500).send();
          throw err;
        }

        res.status(200).send();
      });
    }
  );
});

/*
 * Send notification for date
 *
 * Body:
 *  date: string representing date of user's birthdays to send (if null or undefined, send today's)
 *
 * Note: not purely RESTful
 */

app.put("/users/:email/sendNotification", (req, res) => {
  const uriParsed = req.path.split("/");
  const email = uriParsed[uriParsed.length - 2];
  const errorCallback = () => {
    res.status(500).send();
  };
  const successCallback = () => {
    res.status(200).send();
  };
  notifications.gatherAndSendNotifications(
    email,
    errorCallback,
    successCallback
  );
});

// start server
app.listen(8081, () => {
  console.log("listening on port 8081");
});

function constructReminderText(result) {
  if (result.length === 0) {
    return "None of your friends have birthdays today!";
  }
  return (
    "Don't forget to wish these friends a happy birthday!\n" +
    result.map(entry => entry.name).join("\n")
  );
}

/*
 * ASSUMPTIONS:
 * 1. browser protects db from duplicate emails
 * 2. names array in delete friends is non-empty
 *
 * NOTES:
 *
 * pool.query() shorthand for pool.getConnection() + connection.query() + connection.release()
 */
