import React from "react";
import PropTypes from "prop-types";
import CheckedIcon from "react-icons/lib/fa/check-square-o";
import UncheckedIcon from "react-icons/lib/fa/square-o";

import { CheckboxWrapper, StyledLabel } from "./styles";

class CheckBox extends React.Component {
  handleClick = event => {
    event.preventDefault();
    event.stopPropagation();
    this.props.onCheckBoxChanged(!this.props.isChecked);
    this.elem.blur();
  };

  handleKeyDown = event => {
    const code = event.keyCode;
    if (code === 32 || code === 13) {
      // space or enter
      this.props.onCheckBoxChanged(!this.props.isChecked);
    }
  };

  render() {
    return (
      <StyledLabel
        fontSize={this.props.fontSize}
        onClick={this.props.handleClick}
        color={this.props.labelColor}
      >
        <CheckboxWrapper
          innerRef={elem => (this.elem = elem)}
          onClick={this.handleClick}
          role="checkbox"
          aria-checked={this.props.isChecked}
          tabIndex="0"
          color={this.props.color}
          hoverColor={this.props.hoverColor}
          onKeyDown={this.props.handleKeyDown}
        >
          {this.props.isChecked ? <CheckedIcon /> : <UncheckedIcon />}
        </CheckboxWrapper>
        {this.props.label}
      </StyledLabel>
    );
  }
}

CheckBox.propTypes = {
  fontSize: PropTypes.string,
  color: PropTypes.string,
  hoverColor: PropTypes.string,
  labelColor: PropTypes.string,
  isChecked: PropTypes.bool,
  label: PropTypes.string,
  onCheckBoxChanged: PropTypes.func.isRequired,
};

CheckBox.defaultProps = {
  color: "white",
  hoverColor: "orange",
  labelColor: "white",
  isChecked: false,
};

export default CheckBox;
