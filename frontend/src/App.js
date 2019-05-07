import React, { Component } from "react";
import NavBar from "./NavBar";
import { Route, withRouter } from "react-router-dom";
import Callback from "./Pages/Callback";
import Home from "./Pages/Home";
import auth0Client from "./Auth";
import SecuredRoute from "./SecuredRoute";
import ManageBirthdays from "./Pages/ManageBirthdays";

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      checkingSession: true
    };
  }

  async componentDidMount() {
    if (this.props.location.pathname === "/callback") {
      this.setState({ checkingSession: false });
      return;
    }
    try {
      await auth0Client.silentAuth();
      this.forceUpdate();
    } catch (err) {
      if (err.error !== "login_required") console.log(err.error);
    }
    this.setState({ checkingSession: false });
  }

  render() {
    return (
      <div>
        <NavBar />
        <Route exact path="/" component={Home} />
        <Route exact path="/callback" component={Callback} />
        <SecuredRoute
          path="/manage"
          component={ManageBirthdays}
          checkingSession={this.state.checkingSession}
        />
      </div>
    );
  }
}

export default withRouter(App);
