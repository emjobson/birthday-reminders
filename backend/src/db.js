const mysql = require("mysql");

// Referenced https://www.terlici.com/2015/08/13/mysql-node-express.html

const PRODUCTION_DB = "app_prod_database";
const TEST_DB = "app_test_database";

exports.MODE_TEST = "mode_test";
exports.MODE_PRODUCTION = "mode_production";

var state = {
  pool: null,
  mode: null
};

exports.connect = function(mode, done) {
  state.pool = mysql.createPool({
    host: "localhost",
    user: "user_placeholder",
    password: "password",
    database: mode === exports.MODE_PRODUCTION ? PRODUCTION_DB : TEST_DB
  });
  state.mode = mode;

  //  const conn = state.pool.getConnection();
  state.pool.query(
    //conn.query(
    "CREATE TABLE IF NOT EXISTS Users(" +
      "userID int not null auto_increment primary key," +
      "email varchar not null," +
      "preferences varchar)",
    function(err, result) {
      if (err) {
        throw err;
      }
      console.log("created Users table");
    }
  );
  state.pool.query(
    //  conn.query(
    "CREATE TABLE IF NOT EXISTS Friends(" +
      "friendID int not null auto_increment primary key," +
      "name varchar," +
      "birthday char(4)," +
      "foreign key (userID) references Users (userID))",
    function(err, result) {
      if (err) {
        throw err;
      }
      console.log("created Friends table");
    }
  );
  done();
};

exports.get = function() {
  return state.pool;
};
