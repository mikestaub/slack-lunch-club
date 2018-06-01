import styled, { keyframes } from "styled-components";
import FaSpinner from "react-icons/lib/fa/spinner";

const rotate360 = keyframes`
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
`;

const LoadingIcon = styled(FaSpinner)`
  animation: ${rotate360} 1.5s linear infinite;
  font-size: ${props => (props.size ? props.size : "20px")};
`;

const colors = {
  slackBlue: "#66CCCC",
  slackPurple: "#663366",
  slackGold: "#CC9933",
};

export { colors, LoadingIcon };
