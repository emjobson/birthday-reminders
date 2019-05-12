import axios from "axios";

export async function addFriends(user, friends) {
  return await axios.post(
    "http://localhost:8081" + "/users/" + user + "/friends",
    escapeSingleQuotes({friends: friends})
  );
}

export async function getFriends(user, date) {
  return await axios.get( // use "return await" if I want to handle error here, otherwise there's little diff between this and "return"
    "http://localhost:8081" + "/users/" + user + "/friends",
    {date: date}
  );
}

function escapeSingleQuotes(friends) {
  return JSON.parse(JSON.stringify(friends).replace(/'/g, "''"));
}