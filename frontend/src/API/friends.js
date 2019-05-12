import axios from "axios";
import { BASE_SERVER_URL } from "../constants";

export async function addFriends(user, friends) {
  return await axios.post(
    BASE_SERVER_URL + "/users/" + user + "/friends",
    escapeSingleQuotes({ friends: friends })
  );
}

export async function getFriends(user, date) {
  const data = await axios.get(
    // use "return await" if I want to handle error here, otherwise there's little diff between this and "return"
    BASE_SERVER_URL + "/users/" + user + "/friends",
    { date: date }
  );
  if (data.data) {
    return unpackServerBirthdays(data.data);
  }
  return null;
}

export async function updatePreferences(user, preferences) {
  return await axios.put(BASE_SERVER_URL + "/users/" + user + "/preferences", {
    preferences: JSON.stringify(preferences)
  });
}

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
