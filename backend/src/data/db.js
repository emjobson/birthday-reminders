const mysql = require('mysql');

const dotenv = require('dotenv');
dotenv.config({ path: require('find-config')('.env') }); // to fix issue with pm2 not finding env variables

// Referenced https://www.terlici.com/2015/08/13/mysql-node-express.html

const PRODUCTION_DB = 'app_prod_database';
const TEST_DB = 'app_test_database';

exports.MODE_TEST = 'mode_test';
exports.MODE_PRODUCTION = 'mode_production';

const state = {
  pool: null,
  mode: null
};

exports.connect = function(mode, done) {
  state.pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: mode === exports.MODE_PRODUCTION ? PRODUCTION_DB : TEST_DB
  });
  state.mode = mode;

  //  const conn = state.pool.getConnection();
  state.pool.query(
    //conn.query(
    'CREATE TABLE IF NOT EXISTS Users(' +
      'userID int not null AUTO_INCREMENT,' +
      'email varchar(255) not null,' +
      'preferences varchar(255),' +
      'PRIMARY KEY (userID));',
    function(err, result) {
      if (err) {
        throw err;
      }
    }
  );
  state.pool.query(
    //  conn.query(
    'CREATE TABLE IF NOT EXISTS Friends(' +
      'friendID int not null AUTO_INCREMENT,' +
      'name varchar(255) not null,' +
      'birthday char(4),' +
      'userID int not null,' +
      'foreign key (userID) references Users (userID),' +
      'PRIMARY KEY (friendID));',
    function(err, result) {
      if (err) {
        throw err;
      }
    }
  );
  done();
};

exports.get = function() {
  return state.pool;
};
