import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import auth0Client from '../Auth';
import { getUser, createUser } from '../API';

class Callback extends Component {
  async componentDidMount() {
    await auth0Client.handleAuthentication();
    const user = await getUser(auth0Client.getProfile().name);
    if (!user) {
      await createUser(auth0Client.getProfile().name);
    }
    this.props.history.replace('/manage');
  }

  render() {
    return <p>Loading profile...</p>;
  }
}

export default withRouter(Callback);
