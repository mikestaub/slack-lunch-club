import styled from "styled-components";

const CheckboxWrapper = styled.div`
  display: inline-block;
  margin-right: 10px;

  &:focus,
  &:hover {
    color: ${props => props.hoverColor};
  }

  &:active {
    outline: none;
  }
`;

const StyledLabel = styled.label`
  font-size: ${props => props.fontSize};
  color: ${props => props.color};
  z-index: 1000;

  &:hover {
    cursor: pointer;
  }
`;

export { CheckboxWrapper, StyledLabel };
