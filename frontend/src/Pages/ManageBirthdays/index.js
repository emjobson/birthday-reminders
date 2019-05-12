import React, { Component } from "react";
import { parseICal } from "../../utils";
import Section from "../../Components/Section";
import styles from "./styles.css";
import auth0Client from "../../Auth";
import { addFriends, getFriends } from "../../API/friends";

export default class ManageBirthdays extends Component {
  constructor(props) {
    super(props);
    this.state = {
      phoneNumber: "",
      birthdayFile: null,
      stagedBirthdays: {},
      uploadedBirthdays: {}
    };
  }

  async componentDidMount() {
    const uploadedBirthdays = await getFriends(auth0Client.getProfile().name);
    if (uploadedBirthdays.data) {
      this.setState({
        uploadedBirthdays: unpackServerBirthdays(uploadedBirthdays.data)
      });
    }
  }

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

  render() {
    console.log(">>>uploadedBirthdays", this.state.uploadedBirthdays);
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
          <div>
            Never forget a friend's birthday again! Grab the .ics file of your
            friends' birthdays from Facebook, upload it below, and we'll handle
            the rest.
          </div>
          <div>
            <span
              style={{
                color: this.state.phoneNumber.length === 10 ? "green" : "red"
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
                  evt.target.value.length > this.state.phoneNumber.length &&
                  (ch < "0" || ch > "9")
                ) {
                  return;
                }
                this.setState({ phoneNumber: evt.target.value });
              }}
              value={this.state.phoneNumber || ""}
              className="form-control"
              placeholder="Phone #"
              aria-label="phone_number"
            />
          </div>

          <div className="input-group mb-3">
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
          <div style={{ width: "400px", margin: "1em" }}>
            <button
              style={{ borderRadius: ".25rem" }}
              disabled={
                !this.state.birthdayFile || this.state.phoneNumber.length !== 10
              } // TODO: enabled if valid phone number and valid birthday file in form
              onClick={async () => {
                // TODO: send to server if validation was successful
                const resp = await addFriends(
                  auth0Client.getProfile().name,
                  this.state.stagedBirthdays
                ); // TODO: indicate success
                console.log(">>>resp", resp);
              }}
            >
              Submit
            </button>
            <button
              style={{ borderRadius: ".25rem" }}
              onClick={() => {
                this.setState({ phoneNumber: "", birthdayFile: null });
              }}
            >
              Clear
            </button>
          </div>
          <div>
            Your phone number: {this.state.phoneNumber || "Not entered."}
          </div>
          <div>
            Click the submit button to save your number and the following
            birthdays:
          </div>
          <div className={styles.uploadedBirthdays}>
            {[
              ...Object.keys(this.state.stagedBirthdays),
              ...Object.keys(this.state.uploadedBirthdays)
            ]
              .sort()
              .map((name, idx) => (
                <div
                  key={idx}
                  style={{ marginLeft: ".5em" }}
                  style={{
                    color:
                      name in this.state.stagedBirthdays &&
                      name in this.state.uploadedBirthdays
                        ? "black" // no change
                        : name in this.state.stagedBirthdays
                        ? "green" // added
                        : "red" // removed
                  }}
                >{`${name}: ${convertedBdayString(
                  this.state.stagedBirthdays[name] ||
                    this.state.uploadedBirthdays[name]
                )}`}</div>
              ))}
          </div>
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

/*
 * str 'YYYYMMDD' --> str <month> DD
 * E.g: '20200220' --> 'February 20'
 */
function convertedBdayString(str) {
  const month = str.slice(0, 2);
  const day = parseInt(str.slice(2)).toString(10); // remove leading zeros, e.g: '01' --> '1'
  return months[month] + " " + day;
}

function unpackServerBirthdays(obj) {
  const keys = Object.keys(obj);
  const ret = keys.reduce((acc, key) => {
    acc[obj[key].name] = obj[key].birthday;
    return acc;
  }, {});
  console.log(">>>unpacked", ret);
  return ret;
}
