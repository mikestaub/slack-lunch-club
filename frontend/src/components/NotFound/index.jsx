import React from "react";
import { Emoji } from "emoji-mart";

import { Container } from "./styles";

function NotFound() {
  return (
    <Container>
      <h1>Page Not Found</h1>
      <Emoji emoji="slightly_frowning_face" size={50} />
    </Container>
  );
}

export default NotFound;
