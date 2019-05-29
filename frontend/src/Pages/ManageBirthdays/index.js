import React, { Component } from "react";
import { parseICal } from "../../utils";
import Section from "../../Components/Section";
import styles from "./styles.css";
import auth0Client from "../../Auth";
import { BirthdayEditor } from "../../Components/BirthdayEditor";
import {
  addFriends,
  getFriends,
  updatePreferences,
  sendNotification,
  getUser
} from "../../API";
import { GradientButton } from "../../Components/GradientButton";
import * as _ from "lodash";

export default class ManageBirthdays extends Component {
  constructor(props) {
    super(props);
    this.state = {
      birthdayFile: null,
      stagedBirthdays: {}, // this will go away soon
      referenceBirthdays: {},
      editedBirthdays: { deleted: new Set() },
      stagedPreferences: { phoneNumber: "" },
      uploadedPreferences: { phoneNumber: "" },
      userID: null
    };
  }

  componentDidMount() {
    this.syncUser();
  }

  syncUser = async () => {
    const userData = await getUser(auth0Client.getProfile().name);
    const { userID, preferences } = userData;
    const { referenceBirthdays, maxReferenceFriendID } = await getFriends(
      userID
    );
    this.setState({
      uploadedPreferences: preferences || { phoneNumber: "" },
      referenceBirthdays: referenceBirthdays,
      stagedPreferences: preferences || { phoneNumber: "" },
      userID: userID,
      maxReferenceFriendID
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
    /*
    const { userID } = this.state;
    const email = auth0Client.getProfile().name;
    await updatePreferences(userID, this.state.stagedPreferences);

    const newFriends = _.reduce(
      this.state.stagedBirthdays,
      (result, bday, name) => {
        if (!(name in this.state.referenceBirthdays)) {
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
    */
  };

  // adding margin on Section caused parent/background div to move down -- see below for how to escape
  // https://css-tricks.com/forums/topic/why-is-margin-top-causing-the-background-of-a-parent-div-to-move-down/
  render() {
    const {
      userID,
      referenceBirthdays,
      editedBirthdays,
      maxReferenceFriendID
    } = this.state;

    console.log(">>>editedBirthdays", editedBirthdays);
    return (
      <div style={{ color: "#787e9e" }}>
        <Section
          title="Instructions"
          id="instructions"
          style={{ marginTop: "70px" }}
        >
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
            <span>Your saved phone number: </span>
            <span style={{ color: "#5f92ce" }}>
              {this.state.uploadedPreferences.phoneNumber ||
                "None stored on server."}
            </span>
          </div>
          <div>
            Click the submit button to save your number and the following
            birthdays:
          </div>
          <BirthdayEditor
            referenceBirthdays={referenceBirthdays}
            editedBirthdays={editedBirthdays}
            onEdit={editedBirthdays => {
              this.setState({ editedBirthdays });
            }}
            maxReferenceFriendID={maxReferenceFriendID}
          />
          <div style={{ display: "inline-block" }}>
            <span style={{ marginLeft: ".5em" }}>
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
                  display: "inline-block",
                  color: "#5f92ce",
                  backgroundColor: "transparent"
                }}
                type="tel"
                pattern="[0-9]{3}-[0-9]{3}-[0-9]{4}"
                required
                onChange={evt => {
                  const ch = evt.target.value.charAt(
                    evt.target.value.length - 1
                  );
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
            </span>
            <span
              style={{
                marginLeft: ".5em",
                position: "relative",
                display: "flex",
                alignItems: "stretch"
              }}
            >
              <span
                style={{ color: this.state.birthdayFile ? "green" : "red" }}
              >
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
                        //  this.setState({ stagedBirthdays: bdays });
                        const usedNames = new Set(
                          Object.keys(referenceBirthdays).map(
                            friendID => referenceBirthdays[friendID].name
                          )
                        );
                        const newBirthdays = {};
                        let friendID = maxReferenceFriendID + 1;
                        Object.keys(bdays).forEach(name => {
                          //    bdays[name] = bdays[name].slice(4, 8);
                          if (!(name in usedNames)) {
                            newBirthdays[friendID.toString()] = {
                              name,
                              birthday: bdays[name].slice(4, 8)
                            };
                            friendID++;
                          }
                        });
                        /*
                        const filteredBirthdays = _.pick(
                          // new names only (if you want duplicate name, can add it manually in editor)
                          bdays,
                          Object.keys(bdays).filter(
                            name => !(name in usedNames)
                          )
                        );
                        */
                        this.setState({
                          editedBirthdays: {
                            ...editedBirthdays,
                            ...newBirthdays
                          }
                        });
                      } catch (e) {
                        console.warn(e.message);
                      }
                    }}
                  />
                  <label
                    className="custom-file-label"
                    htmlFor="inputGroupFile02"
                    style={{
                      borderRadius: ".25rem",
                      color: "grey",
                      backgroundColor: "transparent"
                    }}
                  >
                    {(this.state.birthdayFile &&
                      this.state.birthdayFile.name) ||
                      "Choose File"}
                  </label>
                </div>
              </div>
            </span>
            <div
              style={{
                margin: ".5em",
                display: "flex",
                justifyContent: "flex-start"
              }}
            >
              <GradientButton
                style={{ marginLeft: "1.0em" }}
                text="SUBMIT"
                /*
                disabled={
                  !areValid(
                    this.state.stagedPreferences.phoneNumber,
                    this.state.stagedBirthdays
                  )
                } // TODO: enabled if valid phone number and valid birthday file in form
                */
                onClick={() => this.handleSubmit()}
              />
              <GradientButton
                text="CLEAR"
                onClick={() => {
                  this.setState({
                    stagedPreferences: { phoneNumber: "" },
                    birthdayFile: null
                  });
                }}
              />
            </div>
          </div>

          <div>
            Try it! Click below to send yourself a reminder of today's
            birthdays.
          </div>
          <button
            /*
            disabled={
              !areValid(
                this.state.uploadedPreferences.phoneNumber,
                this.state.referenceBirthdays
              )
            }
            */
            onClick={() => {
              sendNotification(userID);
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

// stateless functions

// TODO: this is currently broken, given new changes
function areValid(phone, birthdays) {
  return phone.length === 10 && !_.isEmpty(birthdays);
}
