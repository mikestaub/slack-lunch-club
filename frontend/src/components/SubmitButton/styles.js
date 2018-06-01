import styled from "styled-components";

const StyledButton = styled.button`
  position: relative;
  background: #c36;
  border: 1px solid white;
  font-size: 16px;
  width: 100px;
  height: 50px;
  border-radius: 100px;
  margin-top: 5px;
  color: white;

  &:hover {
    cursor: pointer;
    border: 1px solid #6cc;
    background: #b82f5d;
  }

  &:active {
    outline: none;
  }
`;

export { StyledButton };
