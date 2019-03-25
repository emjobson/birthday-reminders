import React, { Component } from "react";

export default class Home extends Component {
  constructor(props) {
    super(props);
    this.state = { phoneNumber: "" };
  }

  handleInput(evt) {
    this.setState({ phoneNumber: evt.target.value });
  }

  render() {
    //  debugger;
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
          //  onChange={evt => this.handleInput(evt)} // arrow function binds "this" in handleInput to Home's context, same as above
          //  onChange={this.handleInput} // this will fail (cannot read property setState of undefined, context of callback is input)
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
      </div>
    );
  }
}
