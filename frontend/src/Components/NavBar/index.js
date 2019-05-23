import React from "react";
import { withRouter } from "react-router-dom";
import auth0Client from "../../Auth";
import { Link as ScrollLink } from "react-scroll";
import styles from "./styles.css";

// functional component
function NavBar(props) {
  const signOut = () => {
    auth0Client.signOut();
    props.history.replace("/");
  };
  // "btn btn-dark"
  return (
    <nav className={styles.nav}>
      <span
        className={styles.navLinkPrimary}
        onClick={() => {
          props.history.replace("/");
        }}
      >
        Birthday Reminders
      </span>

      {!auth0Client.isAuthenticated() && (
        <span className={styles.buttonBorder} onClick={auth0Client.signIn}>
          <span className={styles.buttonText}>SIGN IN / REGISTER</span>
        </span>
      )}
      {auth0Client.isAuthenticated() && props.location.pathname === "/" && (
        <div>
          {/* email was here */}
          <span
            className={styles.newPageLink}
            onClick={() => {
              props.history.replace("/manage");
            }}
          >
            Manage Birthdays
          </span>
          <span
            className={styles.buttonBorder}
            onClick={() => {
              signOut();
            }}
          >
            <span className={styles.buttonText}>SIGN OUT</span>
          </span>
        </div>
      )}
      {auth0Client.isAuthenticated() && props.location.pathname === "/manage" && (
        <div>
          <label className="mr-2 text-white">
            {auth0Client.getProfile().name}
          </label>
          <span className={styles.scrollLink}>
            <ScrollLink
              to="instructions"
              smooth={true}
              offset={-60}
              duration={500}
            >
              Instructions
            </ScrollLink>
          </span>
          <span className={styles.scrollLink}>
            <ScrollLink
              to="getting-started"
              smooth={true}
              offset={-60}
              duration={500}
            >
              Get Started
            </ScrollLink>
          </span>
          <span className={styles.scrollLink}>
            <ScrollLink
              to="preferences"
              smooth={true}
              offset={-60}
              duration={500}
            >
              Preferences
            </ScrollLink>
          </span>
          <span
            className={styles.buttonBorder}
            onClick={() => {
              signOut();
            }}
          >
            <span className={styles.buttonText}>SIGN OUT</span>
          </span>
        </div>
      )}
    </nav>
  );
}

export default withRouter(NavBar);

/*
          <button
            className="btn btn-light"
            onClick={() => {
              props.history.replace("/manage");
            }}
          >
            Manage Birthday Reminders
          </button>
*/

/*

      <Link className={styles.navLinkPrimary} to="/">
        Birthday Reminder App
      </Link>


                <button
            className="btn btn-dark"
            onClick={() => {
              signOut();
            }}
          >
            Sign Out
          </button>
*/
