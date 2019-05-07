import React, { Component } from "react";
import { parseICal } from "../../utils";

export default class ManageBirthdays extends Component {
  constructor(props) {
    super(props);
    this.state = { phoneNumber: "", birthdayFile: null, birthdays: {} };
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
    return (
      <div>
        <div>
          Never forget a friend's birthday again! Grab the .ics file of your
          friends' birthdays from Facebook, upload it below, and we'll handle
          the rest.
        </div>
        <input
          type="text"
          onChange={evt => this.setState({ phoneNumber: evt.target.value })}
          value={this.state.phoneNumber || ""}
          className="form-control"
          placeholder="Phone #"
          aria-label="phone_number"
        />
        <div className="input-group mb-3">
          <div className="custom-file">
            <input
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
                  this.setState({ birthdays: bdays });
                  console.log(">>>birthdays", bdays);
                } catch (e) {
                  console.warn(e.message);
                }
              }}
            />
            <label
              className="custom-file-label"
              htmlFor="inputGroupFile02"
              //     aria-describedby="inputGroupFileAddon02"
            >
              Choose file
            </label>
          </div>
          <div className="input-group-append">
            <button className="input-group-text" id="inputGroupFileAddon02">
              Upload
            </button>
          </div>
        </div>
        <div>
          Your files: {this.state.birthdayFile && this.state.birthdayFile.name}
        </div>
      </div>
    );
  }
}
