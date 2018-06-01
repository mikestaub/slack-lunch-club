import styled, { css } from "styled-components";
import { Link } from "react-router-dom";

const Container = styled.div`
  display: flex;
  align-items: center;
  height: 100%;
`;

const MenuContainer = styled.div`
  position: absolute;
  top: 75px;
  right: 0;
  box-shadow: 0 0 10px 0 rgba(6, 17, 184, 0.75);
`;

const ProfileImage = styled.img`
  height: 40px;
  width: 40px;
  border-radius: 50%;
  border: 2px solid ${props => (props.highlight ? "grey" : "white")};
  transform: scale(${props => (props.highlight ? 0.85 : 1.0)});
  margin-right: 17px;

  &:hover {
    cursor: pointer;
  }
`;

const DropdownMenu = styled.ol`
  display: flex;
  flex-direction: column;
  background: white;
  border-radius: 0 0 7px 7px;
`;

const itemCss = css`
  margin: 8px;
  color: black;

  &:hover {
    text-decoration: underline;
    cursor: pointer;
  }
`;

const MenuItem = styled.li`
  ${itemCss};
`;

const MenuText = styled.span`
  margin-left: 5px;
`;

const StyledLink = styled(Link)`
  ${itemCss};
  text-decoration: none;
  margin: 0;
`;

export {
  Container,
  MenuContainer,
  ProfileImage,
  DropdownMenu,
  MenuItem,
  MenuText,
  StyledLink,
};
