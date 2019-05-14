import React from "react";
import { Link, withRouter } from "react-router-dom";
import auth0Client from "../../Auth";
import { Link as ScrollLink } from "react-scroll";
import styles from "./styles.css";

// functional component
function NavBar(props) {
  const signOut = () => {
    auth0Client.signOut();
    props.history.replace("/");
  };

  return (
    <nav className="navbar navbar-dark bg-primary fixed-top">
      <Link className="navbar-brand" to="/">
        Birthday Reminder App
      </Link>
      {!auth0Client.isAuthenticated() && (
        <button className="btn btn-dark" onClick={auth0Client.signIn}>
          Sign In
        </button>
      )}
      {auth0Client.isAuthenticated() && props.location.pathname === "/" && (
        <div>
          <label className="mr-2 text-white">
            {auth0Client.getProfile().name}
          </label>
          <span
            className={styles.newPageLink}
            onClick={() => {
              props.history.replace("/manage");
            }}
          >
            Manage Birthdays
          </span>
          <button
            className="btn btn-dark"
            onClick={() => {
              signOut();
            }}
          >
            Sign Out
          </button>
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

          <button
            className="btn btn-dark"
            onClick={() => {
              signOut();
            }}
          >
            Sign Out
          </button>
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
