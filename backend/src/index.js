const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const jwt = require("express-jwt");
const jwksRsa = require("jwks-rsa");

const app = express();

const tempBirthdayDB = {}; // user id -> string for testing

app.use(helmet());

app.use(bodyParser.json());

app.use(cors());

app.use(morgan("combined"));

// retrieve all birthdays
app.get("/", (req, res) => {
  const bdays = Object.keys(tempBirthdayDB).map(user => tempBirthdayDB[user]);
  res.send(bdays);
});

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

// add a new user and birthday
app.post("/", checkJwt, (req, res) => {
  // checkJwt an express middleware that validates ID tokens
  const { id, bday } = req.body;
  tempBirthdayDB[id] = bday;
  res.status(200).send();
});

/*
// get birthdays for a specific user
app.get("/:id", (req, res) => {
  const userID = parseInt(req.params.id);
  const bdays = tempBirthdayDB[userID] || "no birthday string";
  res.send(bdays);
});

// set birthday string for a specific user
app.post("/:id", (req, res) => {
  const { bday } = req.body;
  const userID = parseInt(req.params.id);
  tempBirthdayDB[userID] = bday;

  res.status(200).send();
});
*/

// start server
app.listen(8081, () => {
  console.log("listening on port 8081");
});
