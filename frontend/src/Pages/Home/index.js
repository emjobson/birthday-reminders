import React, { Component } from "react";
import styles from "./styles.css";

export default class Home extends Component {
  // TODO: figure out how to make div with background image fill up to the size of the user's screen
  // in manage page --> will be width of screen, and height will be height of all content
  // make navbar opaque, darken it so that it reaches the color it's at now (with the image behind it)

  render() {
    return (
      <div className={styles.background}>
        <div style={{ marginTop: "100px", color: "white" }}>
          Home page placeholder. Description of site, why you should use it, and
          example video go here.
        </div>
      </div>
    );
  }
}
