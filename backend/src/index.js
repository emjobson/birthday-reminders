const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const jwt = require("express-jwt");
const jwksRsa = require("jwks-rsa");
const db = require("./db");

const MODE = db.MODE_TEST;

const app = express();

app.use(helmet());
app.use(bodyParser.json());
app.use(cors());
app.use(morgan("combined"));

/*
// retrieve all birthdays
app.get("/", (req, res) => {
  const bdays = Object.keys(tempBirthdayDB).map(user => tempBirthdayDB[user]);
  res.send(bdays);
});
*/

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

/*
// add a new user and birthday
app.post("/", checkJwt, (req, res) => {
  // checkJwt an express middleware that validates ID tokens
  const { id, bday } = req.body;
  tempBirthdayDB[id] = bday;
  res.status(200).send();
});
*/

// API endpoints

/*
 * Create User
 *
 * Updates database User table by adding a user (string email) with specified preferences.
 */

app.post("/users", (req, res) => {
  // TODO: checkJwt makes endpoint only available to authenticated users --> do I want it here?
  const { email, preferences } = req.body;
  const pool = db.connect(MODE, () => {});
  const query =
    "INSERT INTO Users (email, preferences) VALUES (" +
    email +
    ", " +
    preferences +
    ");";
  pool.query(query, (err, result) => {
    if (err) {
      res.status(500).send(); // 500: internal server error
      throw err; // TODO: do I want to throw an error?
    }
    console.log("added user " + email + " to Users table");
    res.status(200).send();
  });
});

/*
 * Get Preferences
 *
 * Looks up and returns preferences for the given user.
 */

app.get("/users/:email/preferences", (req, res) => {
  const uriParsed = req.path.split("/");
  const email = uriParsed[uriParsed.length - 2];
  const pool = db.connect(MODE, () => {});
  const query = "SELECT preferences FROM Users WHERE " + "email=" + email + ";";

  pool.query(query, (err, result) => {
    if (err) {
      res.status(500).send(); // 500: internal server error
      throw err;
    }
    console.log("queried Users for preferences for " + email);
    res.send(result);
  });
});

/*
 * Update Preferences
 *
 * Takes in a user and a JSON object of the user's preferences, updating the User
 * table by replacing the old preferences with the new preferences for the given user.
 */

app.put("/users/:email/preferences", (req, res) => {
  const { preferences } = req.body;
  const uriParsed = req.path.split("/");
  const email = uriParsed[uriParsed.length - 2];
  const pool = db.connect(MODE, () => {});
  const query =
    "UPDATE Users SET preferences=" +
    preferences +
    " WHERE email=" +
    email +
    ";";
  pool.query(query, (err, result) => {
    if (err) {
      res.status(500).send(); // 500: internal server error
      throw err;
    }
    console.log("updated Users table with preferences for " + email);
    res.status(200).send(); // TODO: send different response upon failure?
  });
});

/*
 * Delete User
 *
 * Removes the given user from the User table, and removes all of user's entries
 * from the Friends table.
 */

app.delete("/users/:email", (req, res) => {
  const uriParsed = req.path.split("/");
  const email = uriParsed[uriParsed.length - 2];
  const pool = db.connect(MODE, () => {});

  // look up userID
  pool.query(
    "SELECT userID FROM Users WHERE email=" + email + ";",
    (err, result) => {
      if (err) {
        res.status(500).send();
        throw err;
      }
      const userID = result;
      // delete entry in User table
      let query = "DELETE FROM Users WHERE email=" + email + ";";
      pool.query(query, (err, result) => {
        if (err) {
          res.status(500).send();
          throw err;
        }
        // delete from Friends table
        query = "DELETE FROM Friends WHERE userID=" + userID + ";";
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
 */

app.post("/users/:email/friends", (req, res) => {
  const { friends } = req.body;
  const uriParsed = req.path.split("/");
  const email = uriParsed[uriParsed.length - 2];
  const pool = db.connect(MODE, () => {});

  pool.query(
    "SELECT userID FROM Users WHERE email=" + email + ";",
    (err, result) => {
      if (err) {
        res.status(500).send();
        throw err;
      }
      const names = Object.keys(friends);
      let values = "";
      for (let i = 0; i < names.length; i++) {
        values +=
          "(" +
          names[i] +
          ", " +
          friends[names[i]] +
          ", " +
          result +
          (i < names.length - 1 ? "), " : ")");
      }
      const query =
        "INSERT INTO Friends(name, birthday, userID) VALUES " + values + ";";
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
 * Get Friends
 *
 * For the given user, perform lookup in the Friends table to get all friends or friends for a specific date.
 */

app.get("/users/:email/friends", (req, res) => {
  const { date } = req.body; // if unspecified, return all friends
  const uriParsed = req.path.split("/");
  const email = uriParsed[uriParsed.length - 2];
  const pool = db.connect(MODE, () => {});

  pool.query("SELECT userID FROM Users WHERE email=" + email, (err, result) => {
    if (err) {
      res.status(500).send();
      throw err;
    }
    const userID = result;
    const query =
      "SELECT name, birthday FROM Friends WHERE userID=" +
      userID +
      (date && " AND birthday=" + date) +
      ";";
    pool.query(query, (err, result) => {
      if (err) {
        res.status(500).send();
        throw err;
      }
      res.send(result);
    });
  });
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
  const pool = db.connect(MODE, () => {});
});

/*
 * Delete Friends
 *
 * For the given user, remove entries in Friends specified by the array of friend names.
 */

app.delete("/users/:email/friends", (req, res) => {
  const { names } = req.body;
  const uriParsed = req.path.split("/");
  const email = uriParsed[uriParsed.length - 2];
  const pool = db.connect(MODE, () => {});

  pool.query("SELECT userID FROM Users WHERE email=" + email, (err, result) => {
    if (err) {
      res.status(500).send();
      throw err;
    }
    const userID = result;
    const namesStr = "(" + names.slice(1, names.length - 1) + ")";
    const query = // TODO: is this too slow?
      "DELETE FROM Friends WHERE userID=" +
      userID +
      " AND name IN" +
      namesStr +
      ";";

    pool.query(query, (err, result) => {
      if (err) {
        res.status(500).send();
        throw err;
      }
      res.status(200).send();
    });
  });
});

// start server
app.listen(8081, () => {
  console.log("listening on port 8081");
});

/*
 * NOTES:
 *
 * pool.query() shorthand for pool.getConnection() + connection.query() + connection.release()
 */
