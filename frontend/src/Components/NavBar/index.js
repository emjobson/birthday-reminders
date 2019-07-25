import React from 'react';
import { withRouter } from 'react-router-dom';
import auth0Client from '../../Auth';
import { Link as ScrollLink } from 'react-scroll';
import styles from './styles.css';
import { GradientButton } from '../GradientButton';

// functional component
function NavBar(props) {
  const signOut = () => {
    auth0Client.signOut();
    props.history.replace('/');
  };
  // "btn btn-dark"
  return (
    <nav className={styles.nav}>
      <span
        className={styles.navLinkPrimary}
        onClick={() => {
          props.history.replace('/');
        }}
      >
        Birthday Reminders
      </span>

      {!auth0Client.isAuthenticated() && (
        <GradientButton
          text='SIGN IN / REGISTER'
          onClick={auth0Client.signIn}
        />
      )}
      {auth0Client.isAuthenticated() && props.location.pathname === '/' && (
        <div>
          <span
            className={styles.navLinkSecondary}
            onClick={() => {
              props.history.replace('/manage');
            }}
          >
            Manage Birthdays
          </span>
          <GradientButton text='SIGN OUT' onClick={() => signOut()} />
        </div>
      )}
      {auth0Client.isAuthenticated() && props.location.pathname === '/manage' && (
        <div>
          <label className='mr-2' style={{ color: '#5f92ce' }}>
            {auth0Client.getProfile().name}
          </label>
          <span className={styles.navLinkSecondary}>
            <ScrollLink to='intro' smooth={true} offset={-60} duration={500}>
              Introduction
            </ScrollLink>
          </span>
          <span className={styles.navLinkSecondary}>
            <ScrollLink
              to='birthdays'
              smooth={true}
              offset={-60}
              duration={500}
            >
              Birthdays
            </ScrollLink>
          </span>
          <span className={styles.navLinkSecondary}>
            <ScrollLink
              to='preferences'
              smooth={true}
              offset={-60}
              duration={500}
            >
              Preferences
            </ScrollLink>
          </span>
          <GradientButton text='SIGN OUT' onClick={() => signOut()} />
        </div>
      )}
    </nav>
  );
}

export default withRouter(NavBar);
