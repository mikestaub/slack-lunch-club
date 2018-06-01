import React from "react";
import PropTypes from "prop-types";
import Ink from "react-ink";

import { LoadingIcon } from "../SharedStyles";
import { StyledButton } from "./styles";

class SubmitButton extends React.Component {
  handleClick = () => {
    this.elem.blur();
  };

  render() {
    return (
      <StyledButton
        innerRef={elem => (this.elem = elem)}
        onClick={this.handleClick}
        loading={this.props.isLoading}
        type="submit"
        value="Submit"
        id="main-form-submit"
      >
        <Ink />
        {this.props.isLoading ? <LoadingIcon /> : "Submit"}
      </StyledButton>
    );
  }
}

SubmitButton.propTypes = {
  isLoading: PropTypes.bool,
};

export default SubmitButton;
