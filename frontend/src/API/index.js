import axios from 'axios';
import { BASE_SERVER_URL } from '../constants';

export async function createUser(email) {
  return await axios.post(BASE_SERVER_URL + '/users', {
    email: email
  });
}

// tested (ONLY getUser and createUser should occur by email --> rest will be tagged with userID)
export async function getUser(email) {
  const data = await axios.get(BASE_SERVER_URL + '/users/' + email);
  return data.data
    ? { ...data.data, preferences: JSON.parse(data.data.preferences) }
    : null;
}

// https://github.com/axios/axios/issues/1195, see Legym's comment --> examined request and this endpoint looks fine
export async function setFriends(userID, editedBirthdays) {
  const toSend = JSON.stringify(
    escapeSingleQuotes({
      ...editedBirthdays,
      deleted: Array.from(editedBirthdays.deleted)
    })
  );
  return await axios.post(
    BASE_SERVER_URL + '/users/' + userID + '/friends',
    toSend,
    {
      headers: {
        'content-type': 'application/json'
      }
    }
  );
}

export async function getFriends(userID, date) {
  const data = await axios.get(
    // use "return await" if I want to handle error here, otherwise there's little diff between this and "return"
    BASE_SERVER_URL + '/users/' + userID + '/friends',
    { date: date }
  );
  if (data.data) {
    return unpackServerBirthdays(data.data);
  }
  return null;
}

// done (no dataAccess function needed)
export async function sendNotification(userID, date) {
  return await axios.put(
    BASE_SERVER_URL + '/users/' + userID + '/sendNotification',
    { date: date }
  );
}

// done
export async function updatePreferences(userID, preferences) {
  return await axios.put(
    BASE_SERVER_URL + '/users/' + userID + '/preferences',
    {
      preferences: JSON.stringify(preferences)
    }
  );
}

function escapeSingleQuotes(friends) {
  return JSON.parse(JSON.stringify(friends).replace(/'/g, "''"));

  //  return JSON.parse(JSON.stringify(friends).replace(/'/g, "''"));
}

function unpackServerBirthdays(obj) {
  const keys = Object.keys(obj);
  let maxReferenceFriendID = -1;
  const referenceBirthdays = keys.reduce((acc, key) => {
    //  acc[obj[key].name] = obj[key].birthday;
    if (obj[key].friendID > maxReferenceFriendID) {
      maxReferenceFriendID = obj[key].friendID;
    }
    acc[obj[key].friendID] = {
      name: obj[key].name,
      birthday: obj[key].birthday
    };
    return acc;
  }, {});
  return { referenceBirthdays, maxReferenceFriendID };
}
