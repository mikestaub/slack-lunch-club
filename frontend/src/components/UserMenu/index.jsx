import React from "react";
import PropTypes from "prop-types";
import FaSignOut from "react-icons/lib/fa/sign-out";
import FaTimesCircle from "react-icons/lib/fa/times-circle";
import FaQuestionCircle from "react-icons/lib/fa/question-circle";
import { confirmAlert } from "react-confirm-alert";
import "react-confirm-alert/src/react-confirm-alert.css";

import {
  Container,
  MenuContainer,
  ProfileImage,
  DropdownMenu,
  MenuItem,
  MenuText,
  StyledLink,
} from "./styles";

class UserMenu extends React.Component {
  constructor() {
    super();
    this.state = {
      dropdownVisible: false,
    };
    this.handleMouseOver = this.handleMouseOver.bind(this);
    this.handleMouseLeave = this.handleMouseLeave.bind(this);
    this.handleMouseClick = this.handleMouseClick.bind(this);
  }

  handleMouseOver() {
    this.setDropdownVisible(true);
  }

  handleMouseLeave() {
    this.setDropdownVisible(false);
  }

  handleMouseClick() {
    this.setDropdownVisible(true);
  }

  setDropdownVisible(visible) {
    this.setState({ dropdownVisible: visible });
  }

  showConfirmationDialog = () => {
    confirmAlert({
      title: "Delete Account",
      message: "Are you sure?",
      buttons: [
        {
          label: "Yes",
          onClick: this.props.deleteAccount,
        },
        {
          label: "No",
          onClick: () => {},
        },
      ],
    });
  };

  render() {
    return (
      <Container
        onMouseOver={this.handleMouseOver}
        onMouseLeave={this.handleMouseLeave}
        onClick={this.handleMouseClick}
      >
        <ProfileImage
          src={this.props.profileImg}
          highlight={this.state.dropdownVisible}
        />
        {this.state.dropdownVisible && (
          <MenuContainer onMouseLeave={this.handleMouseLeave}>
            <DropdownMenu>
              <MenuItem>
                <FaQuestionCircle />
                <StyledLink to="/about">
                  <MenuText>About</MenuText>
                </StyledLink>
              </MenuItem>
              <MenuItem onClick={this.showConfirmationDialog}>
                <FaTimesCircle />
                <MenuText>Delete Account</MenuText>
              </MenuItem>
              <MenuItem onClick={this.props.logOut}>
                <FaSignOut />
                <MenuText>Log Out</MenuText>
              </MenuItem>
            </DropdownMenu>
          </MenuContainer>
        )}
      </Container>
    );
  }
}

UserMenu.propTypes = {
  profileImg: PropTypes.string,
  deleteAccount: PropTypes.func.isRequired,
  logOut: PropTypes.func.isRequired,
};

export default UserMenu;
