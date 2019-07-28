const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const jwt = require('express-jwt');
const jwksRsa = require('jwks-rsa');
const db = require('./data/db');
const notifications = require('./notifications');
const utils = require('./utils');
const scheduler = require('./schedulerFactory');
const dataAccess = require('./data/data_access');

const dotenv = require('dotenv');
dotenv.config({ path: require('find-config')('.env') }); // to fix issue with pm2 not finding env variables

const app = express();

app.use(helmet());
app.use(bodyParser.json());
app.use(cors());
app.use(morgan('combined'));

db.connect(process.env.DB_MODE, function() {
  console.log('connected to db');
});

scheduler.start(); // TEMP for testing cron scheduler --> should send me a text every minute TODO: figure out where scheduler.start() should actually go...seems to be here?

const checkJwt = jwt({
  secret: jwksRsa.expressJwtSecret({
    cache: true,
    rateLimit: true,
    jwksRequestsPerMinute: 5,
    jwksUri: `https://dev-ztfv3x1b.auth0.com
    /.well-known/jwks.json`
  }),

  // Validate the audience and the issuer.
  audience: '8tEnAcZ7XdMQFb2NWTI6KcC27W90qVOL', // my auth0 client id
  issuer: `https://dev-ztfv3x1b.auth0.com
  /`, // my auth0 domain
  algorithms: ['RS256']
});

// HOW TO USE checkJwt
app.post('/', checkJwt, (req, res) => {
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

app.post('/api/users', async (req, res) => {
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
 * Note: Express sets content-type as 'application/json', since result is an object.
 */

app.get('/users/:email', async (req, res) => {
  const uriParsed = req.path.split('/');
  const email = uriParsed[uriParsed.length - 1];
  try {
    const result = await dataAccess.getUser(email);
    res.send(result);
  } catch (err) {
    res.status(500).send(); // internal server error
  }
});

/*
 * Get Preferences
 *
 * Looks up and returns preferences for the given user.
 * Note: Express sets content-type as 'text/html', since result is a string.
 */

app.get('/users/:userID/preferences', async (req, res) => {
  const uriParsed = req.path.split('/');
  const userID = uriParsed[uriParsed.length - 2];
  try {
    const result = await dataAccess.getPreferences(userID);
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

app.put('/users/:userID/preferences', async (req, res) => {
  const { preferences } = req.body;
  const uriParsed = req.path.split('/');
  const userID = uriParsed[uriParsed.length - 2];
  try {
    await dataAccess.updatePreferences(userID, preferences);
    res.status(200).send();
  } catch (err) {
    res.status(500).send();
  }
});

/*
 * Delete User
 *
 * (this is currently unused)
 *
 * Removes the given user from the User table, and removes all of user's entries
 * from the Friends table.
 */

app.delete('/users/:email', (req, res) => {
  const uriParsed = req.path.split('/');
  const email = uriParsed[uriParsed.length - 1];
  const pool = db.get();

  // look up userID
  pool.query(
    'SELECT userID FROM Users WHERE email=' + utils.quotesOrNULL(email) + ';',
    (err, result) => {
      if (err) {
        res.status(500).send();
      }
      const userID = result[0].userID;
      // delete entry in User table
      let query =
        'DELETE FROM Users WHERE email=' + utils.quotesOrNULL(email) + ';';
      pool.query(query, (err, result) => {
        if (err) {
          res.status(500).send();
        }
        // delete from Friends table
        query =
          'DELETE FROM Friends WHERE userID=' +
          utils.quotesOrNULL(userID) +
          ';';
        pool.query(query, (err, result) => {
          if (err) {
            res.status(500).send();
          }
          res.status(200).send();
        });
      });
    }
  );
});

/*
 * set friends
 */
app.post('/users/:userID/friends', async (req, res) => {
  const editedBirthdays = req.body;
  const uriParsed = req.path.split('/');
  const userID = uriParsed[uriParsed.length - 2];

  try {
    await dataAccess.addAndUpdateFriends(userID, editedBirthdays);
    await dataAccess.deleteFriends(editedBirthdays.deleted);
    res.status(200).send();
  } catch (err) {
    res.status(500).send();
  }
});

/*
 * Get Friends
 *
 * For the given user, perform lookup in the Friends table to get all friends or friends for a specific date.
 *
 * Body:
 *  date: string date, can be null or undefined if no date desired
 */

app.get('/users/:userID/friends', async (req, res) => {
  const { date } = req.body; // if unspecified, return all friends
  const uriParsed = req.path.split('/');
  const userID = uriParsed[uriParsed.length - 2];
  try {
    const result = await dataAccess.getFriends(userID, date);
    res.send(result);
  } catch (err) {
    res.status(500).send();
  }
});

/*
 * Send notification for date
 *
 * Note: not purely RESTful
 */

app.put('/users/:userID/sendNotification', (req, res) => {
  const uriParsed = req.path.split('/');
  const userID = uriParsed[uriParsed.length - 2];
  const errorCallback = () => {
    res.status(500).send();
  };
  const successCallback = () => {
    res.status(200).send();
  };
  notifications.gatherAndSendNotifications(
    userID,
    errorCallback,
    successCallback
  );
});

// start server
app.listen(8081, () => {
  console.log('listening on port 8081');
});

/*
 * ASSUMPTIONS:
 * 1. browser protects db from duplicate emails
 *
 * NOTES:
 *
 * pool.query() shorthand for pool.getConnection() + connection.query() + connection.release()
 */
