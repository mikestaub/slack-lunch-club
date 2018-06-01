import React from "react";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import stickybits from "stickybits";

import UserMenu from "../UserMenu";
import { Container, Logo, Title, Background } from "./styles";

class Navbar extends React.Component {
  componentDidMount() {
    stickybits("#navbar-bg");
  }

  render() {
    return (
      <Background id="navbar-bg">
        <Container>
          <Logo>
            <Link to="/">
              <img
                src={this.props.logo}
                alt="home"
                width="100%"
                height="100%"
              />
            </Link>
          </Logo>
          <Title>Slack Lunch Club</Title>
          <UserMenu
            profileImg={this.props.profileImg}
            logOut={this.props.logOut}
            deleteAccount={this.props.deleteAccount}
          />
        </Container>
      </Background>
    );
  }
}

Navbar.propTypes = {
  logo: PropTypes.string.isRequired,
  profileImg: PropTypes.string,
  logOut: PropTypes.func.isRequired,
  deleteAccount: PropTypes.func.isRequired,
};

export default Navbar;
