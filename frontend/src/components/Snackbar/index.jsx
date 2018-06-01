import React from "react";
import PropTypes from "prop-types";

import { SnackbarContainer, Content, CloseIcon } from "./styles";

function Snackbar({ visible, text, onClose }) {
  return (
    <SnackbarContainer visible={visible}>
      <Content>{text}</Content>
      <CloseIcon onClick={onClose} />
    </SnackbarContainer>
  );
}

Snackbar.propTypes = {
  visible: PropTypes.bool,
  text: PropTypes.string.isRequired,
  onClose: PropTypes.func,
};

export default Snackbar;
