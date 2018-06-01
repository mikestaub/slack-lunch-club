import React from "react";
import styled from "styled-components";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";

import { getCurrentUser, updateUser, deleteUser } from "./graphql";
import auth from "./auth";
import LandingPage from "../LandingPage";
import Navbar from "../Navbar";
import MainForm from "../MainForm";
import About from "../About";
import NotFound from "../NotFound";
import Snackbar from "../Snackbar";
import logo from "./logo.svg";

const AppContainer = styled.div`
  height: 100%;
`;

class App extends React.Component {
  constructor() {
    super();
    this.state = {
      isLoggedIn: false,
      user: {},
      snackbarVisible: false,
      snackbarText: "",
      requestPending: false,
      userLoading: true,
    };
  }

  componentWillMount() {
    this.setState({
      isLoggedIn: auth.isLoggedIn(),
    });
  }

  componentDidMount = async () => {
    if (this.state.isLoggedIn) {
      try {
        this.serverRequest = getCurrentUser();
        const user = await this.serverRequest;
        this.setState({
          user,
          userLoading: false,
        });
      } catch (err) {
        this.showSnackbar(`Failed to fetch user, ${err}`);
      }
    }
  };

  componentWillUnmount() {
    // TODO: abort fetch
    // https://github.com/github/fetch/pull/592
    // if (this.serverRequest) {
    //   this.serverRequest.abort();
    // }
  }

  logInWithSlack() {
    auth.slackLogin();
  }

  showSnackbar = text => {
    console.error(text);
    this.setState({
      snackbarText: text,
      snackbarVisible: true,
    });
  };

  updateUser = async () => {
    this.setState({ requestPending: true });
    const input = {
      ...this.state.user,
      matchedConnection: undefined,
    };
    try {
      this.serverRequest = updateUser(input);
      const user = await this.serverRequest;
      this.setState({
        user,
      });
    } catch (err) {
      this.showSnackbar(`Failed to update user, ${err}`);
    }
    this.setState({ requestPending: false });
  };

  deleteUser = async () => {
    this.setState({ requestPending: true });
    try {
      this.serverRequest = deleteUser({ id: this.state.user.id });
      auth.logOut();
      this.setState({ requestPending: false });
    } catch (err) {
      this.showSnackbar(`Failed to delete user, ${err}`);
    }
  };

  handleSnackbarClosed = () => {
    this.setState({ snackbarVisible: !this.state.snackbarVisible });
  };

  handleDayToggled = availableDays => {
    const currentUser = this.state.user;
    const user = {
      ...currentUser,
      availableDays,
    };
    this.setState({ user });
  };

  handleCheckBoxChanged = isChecked => {
    const user = {
      ...this.state.user,
      matchEveryWeek: isChecked,
    };
    this.setState({ user });
  };

  handleLocationPicked = place => {
    const user = {
      ...this.state.user,
      location: {
        lat: place.geometry.location.lat(),
        lng: place.geometry.location.lng(),
        key: place.name,
        formattedAddress: place.formatted_address,
      },
    };
    this.setState({ user });
  };

  handleSubmitForm = event => {
    event.preventDefault();
    this.updateUser();
  };

  render() {
    return (
      <Router>
        <AppContainer>
          {this.state.isLoggedIn && (
            <Navbar
              logo={logo}
              profileImg={this.state.user.profilePhoto}
              logOut={auth.logOut}
              deleteAccount={this.deleteUser}
            />
          )}
          <Switch>
            <Route
              exact
              path="/"
              render={props =>
                this.state.isLoggedIn ? (
                  <div>
                    <MainForm
                      {...props}
                      userLoading={this.state.userLoading}
                      matchEveryWeek={this.state.user.matchEveryWeek}
                      availableDays={this.state.user.availableDays}
                      userLocation={this.state.user.location}
                      handleDayToggled={this.handleDayToggled}
                      handleCheckBoxChanged={this.handleCheckBoxChanged}
                      handleLocationPicked={this.handleLocationPicked}
                      handleSubmitForm={this.handleSubmitForm}
                      requestPending={this.state.requestPending}
                    />
                  </div>
                ) : (
                  <LandingPage
                    {...props}
                    logo={logo}
                    slackLogin={this.logInWithSlack}
                  />
                )
              }
            />
            <Route path="/about" component={About} />
            <Route path="/*" component={NotFound} />
          </Switch>
          <Snackbar
            onClose={this.handleSnackbarClosed}
            visible={this.state.snackbarVisible}
            text={this.state.snackbarText}
          />
        </AppContainer>
      </Router>
    );
  }
}

export default App;
