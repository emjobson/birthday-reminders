import auth0 from 'auth0-js';
import { BASE_SITE_URL } from './constants';

class Auth {
  constructor() {
    this.auth0 = new auth0.WebAuth({
      domain: 'dev-ztfv3x1b.auth0.com',
      audience: 'https://dev-ztfv3x1b.auth0.com/userinfo',
      clientID: '8tEnAcZ7XdMQFb2NWTI6KcC27W90qVOL',
      //    redirectUri: "http://localhost:3000/callback",
      redirectUri: BASE_SITE_URL + '/callback',
      responseType: 'id_token',
      scope: 'openid profile'
    });

    this.getProfile = this.getProfile.bind(this);
    this.handleAuthentication = this.handleAuthentication.bind(this);
    this.isAuthenticated = this.isAuthenticated.bind(this);
    this.signIn = this.signIn.bind(this);
    this.signOut = this.signOut.bind(this);
  }

  getProfile() {
    return this.profile;
  }

  getIdToken() {
    return this.idToken;
  }

  isAuthenticated() {
    return new Date().getTime() < this.expiresAt;
  }

  signIn() {
    this.auth0.authorize();
  }

  handleAuthentication() {
    return new Promise((resolve, reject) => {
      this.auth0.parseHash((err, authResult) => {
        if (err) return reject(err);
        if (!authResult || !authResult.idToken) {
          return reject(err);
        }
        this.setSession(authResult);
        /*
        this.idToken = authResult.idToken;
        this.profile = authResult.idTokenPayload;
        // set time id token will expire at
        this.expiresAt = authResult.idTokenPayload.exp * 1000;
        */
        resolve();
      });
    });
  }

  setSession(authResult) {
    this.idToken = authResult.idToken;
    this.profile = authResult.idTokenPayload;
    // set time id token will expire at
    this.expiresAt = authResult.idTokenPayload.exp * 1000;
  }

  signOut() {
    this.auth0.logout({
      //  returnTo: 'http://localhost:3000',
      returnTo: BASE_SITE_URL,

      clientID: '8tEnAcZ7XdMQFb2NWTI6KcC27W90qVOL'
    });
    /*
    this.idToken = null;
    this.profile = null;
    this.expiresAt = null;
    */
  }

  silentAuth() {
    return new Promise((resolve, reject) => {
      this.auth0.checkSession({}, (err, authResult) => {
        if (err) return reject(err);
        this.setSession(authResult);
        resolve();
      });
    });
  }
}

const auth0Client = new Auth();

export default auth0Client;
