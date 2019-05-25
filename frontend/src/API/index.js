import axios from "axios";
import { BASE_SERVER_URL } from "../constants";

// tested
export async function getUser(user) {
  const data = await axios.get(BASE_SERVER_URL + "/users/" + user);
  return data.data ? data.data : null;
}

// tested
export async function createUser(user) {
  return await axios.post(BASE_SERVER_URL + "/users", {
    email: user
  });
}

// done (no dataAccess function needed)
export async function sendNotification(user, date) {
  return await axios.put(
    BASE_SERVER_URL + "/users/" + user + "/sendNotification",
    { date: date }
  );
}

// will do this later bc I'm changing it to setFriends (allowing for create/update/delete all at once)
export async function addFriends(user, friends) {
  return await axios.post(
    BASE_SERVER_URL + "/users/" + user + "/friends",
    escapeSingleQuotes({ friends: friends })
  );
}

// done
export async function getFriends(user, date) {
  const data = await axios.get(
    // use "return await" if I want to handle error here, otherwise there's little diff between this and "return"
    BASE_SERVER_URL + "/users/" + user + "/friends",
    { date: date }
  );
  console.log(">>>getFriends result from front-end API", data);
  if (data.data) {
    return unpackServerBirthdays(data.data);
  }
  return null;
}

// done
export async function updatePreferences(user, preferences) {
  return await axios.put(BASE_SERVER_URL + "/users/" + user + "/preferences", {
    preferences: JSON.stringify(preferences)
  });
}

// done
export async function getPreferences(user) {
  const data = await axios.get(
    BASE_SERVER_URL + "/users/" + user + "/preferences"
  );
  return data.data ? data.data : null;
}

function escapeSingleQuotes(friends) {
  return JSON.parse(JSON.stringify(friends).replace(/'/g, "''"));
}

function unpackServerBirthdays(obj) {
  const keys = Object.keys(obj);
  const ret = keys.reduce((acc, key) => {
    acc[obj[key].name] = obj[key].birthday;
    return acc;
  }, {});
  return ret;
}
