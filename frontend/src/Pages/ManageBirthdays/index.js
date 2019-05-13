import React, { Component } from "react";
import { parseICal } from "../../utils";
import Section from "../../Components/Section";
import styles from "./styles.css";
import auth0Client from "../../Auth";
import {
  addFriends,
  getFriends,
  updatePreferences,
  getPreferences,
  sendNotification
} from "../../API/api";
import * as _ from "lodash";

export default class ManageBirthdays extends Component {
  constructor(props) {
    super(props);
    this.state = {
      birthdayFile: null,
      stagedBirthdays: {},
      uploadedBirthdays: {},
      stagedPreferences: { phoneNumber: "" },
      uploadedPreferences: { phoneNumber: "" }
    };
  }

  componentDidMount() {
    this.syncUser();
  }

  syncUser = async () => {
    const uploadedPreferences = await getPreferences(
      auth0Client.getProfile().name
    );
    const uploadedBirthdays = await getFriends(auth0Client.getProfile().name);
    this.setState({
      uploadedPreferences: uploadedPreferences,
      uploadedBirthdays: uploadedBirthdays,
      stagedPreferences: { phoneNumber: uploadedPreferences.phoneNumber || "" }
    });
  };

  readFileAsText = async file => {
    const reader = new FileReader();
    return new Promise((resolve, reject) => {
      reader.onerror = () => {
        reader.abort();
        reject(new DOMException("Problem parsing file."));
      };
      reader.onload = () => {
        resolve(reader.result);
      };
      reader.readAsText(file);
    });
  };

  handleSubmit = async () => {
    // TODO: handle upload errors
    const email = auth0Client.getProfile().name;
    await updatePreferences(email, this.state.stagedPreferences);

    const newFriends = _.reduce(
      this.state.stagedBirthdays,
      (result, bday, name) => {
        if (!(name in this.state.uploadedBirthdays)) {
          result[name] = bday;
        }
        return result;
      },
      {}
    );
    if (!_.isEmpty(newFriends)) {
      await addFriends(email, newFriends);
    }
    this.syncUser();
  };

  render() {
    const email = auth0Client.getProfile().name;
    return (
      <div>
        <Section title="Instructions" id="instructions">
          <div>instructions go here</div>
          <div>instructions go here</div>
          <div>instructions go here</div>
          <div>instructions go here</div>
          <div>instructions go here</div>
          <div>instructions go here</div>
          <div>instructions go here</div>
          <div>instructions go here</div>
          <div>instructions go here</div>
          <div>instructions go here</div>
          <div>instructions go here</div>
        </Section>
        <Section title="Getting Started" id="getting-started">
          <div style={{ marginBottom: "2em" }}>
            Never forget a friend's birthday again! Grab the .ics file of your
            friends' birthdays from Facebook, upload it below, and we'll handle
            the rest.
          </div>
          <div>
            Your saved phone number:{" "}
            {(this.state.uploadedPreferences &&
              this.state.uploadedPreferences.phoneNumber) ||
              "None stored on server."}
          </div>
          <div>
            Click the submit button to save your number and the following
            birthdays:
          </div>
          <div>
            <span className={styles.uploadedBirthdays}>
              {Array.from(
                new Set([
                  ...Object.keys(this.state.stagedBirthdays),
                  ...Object.keys(this.state.uploadedBirthdays)
                ])
              )
                .sort()
                .map((name, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: "block",
                      marginLeft: ".5em",
                      color:
                        name in this.state.stagedBirthdays &&
                        !(name in this.state.uploadedBirthdays)
                          ? "green"
                          : "black"
                    }}
                  >{`${name}: ${convertedBdayString(
                    this.state.stagedBirthdays[name] ||
                      this.state.uploadedBirthdays[name]
                  )}`}</div>
                ))}
            </span>
            <span
              style={{
                border: "1px solid black",
                display: "inline-block",
                width: "200px"
              }}
            >
              <div style={{ marginLeft: ".25em" }}>Key:</div>
              <ul style={{ marginBottom: ".25em" }}>
                <li style={{ color: "green" }}>birthday to add</li>
                <li style={{ color: "red" }}>birthday to delete</li>
                <li style={{ color: "black" }}>no change</li>
              </ul>
            </span>
          </div>

          <div style={{ marginLeft: ".5em" }}>
            <span
              style={{
                color:
                  this.state.stagedPreferences.phoneNumber.length === 10
                    ? "green"
                    : "red"
              }}
            >
              *
            </span>
            <input
              style={{
                width: "400px",
                margin: ".5em",
                display: "inline-block"
              }}
              type="tel"
              pattern="[0-9]{3}-[0-9]{3}-[0-9]{4}"
              required
              onChange={evt => {
                const ch = evt.target.value.charAt(evt.target.value.length - 1);
                if (
                  evt.target.value.length >
                    this.state.stagedPreferences.phoneNumber.length &&
                  (ch < "0" || ch > "9")
                ) {
                  return;
                }
                this.setState({
                  stagedPreferences: { phoneNumber: evt.target.value }
                });
              }}
              value={this.state.stagedPreferences.phoneNumber}
              className="form-control"
              placeholder="Phone #"
              aria-label="phone_number"
            />
          </div>
          <div className="input-group" style={{ marginLeft: ".5em" }}>
            <span style={{ color: this.state.birthdayFile ? "green" : "red" }}>
              *
            </span>
            <div
              style={{ width: "400px", display: "flex", marginLeft: ".5em" }}
            >
              <div className="custom-file">
                <input
                  style={{ cursor: "pointer" }}
                  type="file"
                  className="custom-file-input"
                  id="inputGroupFile02"
                  accept=".ics"
                  onChange={async evt => {
                    this.setState({ birthdayFile: evt.target.files[0] });
                    try {
                      const fileTxt = await this.readFileAsText(
                        evt.target.files[0]
                      );
                      const bdays = parseICal(fileTxt);
                      Object.keys(bdays).forEach(name => {
                        bdays[name] = bdays[name].slice(4, 8);
                      });
                      this.setState({ stagedBirthdays: bdays });
                    } catch (e) {
                      console.warn(e.message);
                    }
                  }}
                />
                <label
                  className="custom-file-label"
                  htmlFor="inputGroupFile02"
                  style={{ borderRadius: ".25rem", color: "grey" }}
                  //     aria-describedby="inputGroupFileAddon02"
                >
                  {(this.state.birthdayFile && this.state.birthdayFile.name) ||
                    "Choose File"}
                </label>
              </div>
            </div>
          </div>
          <div style={{ width: "400px", margin: ".5em", marginLeft: "1.5em" }}>
            <button
              style={{ borderRadius: ".25rem" }}
              disabled={
                !areValid(
                  this.state.stagedPreferences.phoneNumber,
                  this.state.stagedBirthdays
                )
              } // TODO: enabled if valid phone number and valid birthday file in form
              onClick={() => {
                this.handleSubmit();
              }}
            >
              Submit
            </button>
            <button
              style={{ borderRadius: ".25rem" }}
              onClick={() => {
                this.setState({
                  stagedPreferences: { phoneNumber: "" },
                  birthdayFile: null
                });
              }}
            >
              Clear
            </button>
          </div>
          <div>
            Try it! Click below to send yourself a reminder of today's
            birthdays.
          </div>
          <button
            disabled={
              !areValid(
                this.state.uploadedPreferences.phoneNumber,
                this.state.uploadedBirthdays
              )
            }
            onClick={() => {
              sendNotification(email);
            }}
          >
            Send today's birthday reminder
          </button>
        </Section>
        <Section title="Preferences" id="preferences">
          preference config here
        </Section>
      </div>
    );
  }
}

const months = {
  "01": "January",
  "02": "February",
  "03": "March",
  "04": "April",
  "05": "May",
  "06": "June",
  "07": "July",
  "08": "August",
  "09": "September",
  "10": "October",
  "11": "November",
  "12": "December"
};

// stateless functions

function areValid(phone, birthdays) {
  return phone.length === 10 && !_.isEmpty(birthdays);
}

/*
 * str 'YYYYMMDD' --> str <month> DD
 * E.g: '20200220' --> 'February 20'
 */
function convertedBdayString(str) {
  const month = str.slice(0, 2);
  const day = parseInt(str.slice(2)).toString(10); // remove leading zeros, e.g: '01' --> '1'
  return months[month] + " " + day;
}
