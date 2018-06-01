import styled from "styled-components";
import FaTimesCircle from "react-icons/lib/fa/times-circle-o";

const SnackbarContainer = styled.div`
  display: ${props => (props.visible ? "flex" : "none")};
  border-radius: 7px;
  justify-content: space-between;
  align-items: center;
  position: fixed;
  margin: auto;
  padding-left: 5%;
  padding-right: 5%;
  bottom: 10px;
  background-color: #dd474d;
  width: 80%;
  min-height: 80px;
  z-index: 1000;
  right: 0;
  left: 0;
  box-shadow: 0 0 10px 0 rgba(0, 0, 0, 0.75);

  @media (min-width: 700px) {
    padding-right: 3%;
    padding-left: 3%;
  }
`;

const Content = styled.div`
  font-size: 18px;
`;

const CloseIcon = styled(FaTimesCircle)`
  font-size: 30px;

  &:hover {
    cursor: pointer;
    color: grey;
  }
`;

export { SnackbarContainer, Content, CloseIcon };
