const db = require('./db');
const utils = require('../utils');

const MODE = db.MODE_TEST;

db.connect(MODE, function() {
  console.log('connected to db');
});

exports.getUser = async email => {
  const pool = db.get();
  const query =
    'SELECT userID, email, preferences FROM Users WHERE ' +
    'email=' +
    utils.quotesOrNULL(email) +
    ';';
  return new Promise((resolve, reject) => {
    pool.query(query, (err, result) => {
      if (err) {
        reject();
      }
      resolve(result[0]);
    });
  });
};

exports.createUser = async (email, preferences) => {
  const pool = db.get();
  const query =
    'INSERT INTO Users (email, preferences) VALUES (' +
    utils.quotesOrNULL(email) +
    ', ' +
    utils.quotesOrNULL(preferences) +
    ');';

  return new Promise((resolve, reject) => {
    pool.query(query, (err, result) => {
      if (err) {
        reject();
      }
      resolve();
    });
  });
};

exports.addAndUpdateFriends = async (userID, editedBirthdays) => {
  return new Promise((resolve, reject) => {
    if (Object.keys(editedBirthdays).length === 1) {
      // nothing to add or update, only key was "deleted"
      resolve();
    } else {
      const pool = db.get();
      let values = '';
      const friendIDs = Object.keys(editedBirthdays);

      for (let i = 0; i < friendIDs.length; i++) {
        if (friendIDs[i] === 'deleted') continue;
        values +=
          '(' +
          utils.quotesOrNULL(friendIDs[i]) +
          ', ' +
          utils.quotesOrNULL(editedBirthdays[friendIDs[i]].name) +
          ', ' +
          utils.quotesOrNULL(editedBirthdays[friendIDs[i]].birthday) +
          ', ' +
          userID +
          (i < friendIDs.length - 2 ? '), ' : ')'); // deleted comes last
      }
      const query =
        'INSERT INTO Friends(friendID, name, birthday, userID) VALUES ' +
        values +
        ' ON DUPLICATE KEY UPDATE name=VALUES(name), birthday=VALUES(birthday);';
      pool.query(query, (err, result) => {
        if (err) {
          reject();
        }
        resolve();
      });
    }
  });
};

exports.deleteFriends = async deleted => {
  return new Promise((resolve, reject) => {
    if (deleted.length === 0) {
      resolve();
    } else {
      const pool = db.get();
      let deleteValues = '(';
      deleted.forEach((friendID, idx) => {
        deleteValues += friendID + (idx < deleted.length - 1 ? ',' : '');
      });
      deleteValues += ')';
      const deleteQuery =
        'DELETE FROM Friends WHERE friendID IN ' + deleteValues + ';';

      pool.query(deleteQuery, (err, result) => {
        if (err) {
          reject();
        }
        resolve();
      });
    }
  });
};

exports.updatePreferences = async (userID, preferences) => {
  const pool = db.get();
  const query =
    'UPDATE Users SET preferences=' +
    utils.quotesOrNULL(preferences) +
    ' WHERE userID=' +
    utils.quotesOrNULL(userID) +
    ';';
  return new Promise((resolve, reject) => {
    pool.query(query, (err, result) => {
      if (err) {
        reject();
      }
      resolve();
    });
  });
};

exports.getFriends = async (userID, date) => {
  const pool = db.get();
  return new Promise((resolve, reject) => {
    const query =
      'SELECT name, birthday, friendID FROM Friends WHERE userID=' +
      utils.quotesOrNULL(userID) +
      (date ? ' AND birthday=' + utils.quotesOrNULL(date) : '') +
      ';';
    pool.query(query, (err, result) => {
      if (err) {
        reject();
      }
      resolve(result);
    });
  });
};

exports.getPreferences = async userID => {
  const pool = db.get();
  const query =
    'SELECT preferences FROM Users WHERE ' +
    'userID=' +
    utils.quotesOrNULL(userID) +
    ';';
  return new Promise((resolve, reject) => {
    pool.query(query, (err, result) => {
      if (err) {
        reject();
      }
      resolve(result[0].preferences);
    });
  });
};
