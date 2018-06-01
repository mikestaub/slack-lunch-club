import styled, { css } from "styled-components";
import ProgressiveImage from "react-progressive-bg-image";

import { colors } from "../SharedStyles";

const OffsetContent = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
`;

const CenteredContent = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const BackgroundImage = styled(ProgressiveImage)`
  background-image: url(${props => props.image});
  background-repeat: no-repeat;
  background-size: contain;
  width: 620px;
  height: 100%;
  position: fixed;
  right: 0;
  opacity: 0.6;
  z-index: -1;

  @media (max-width: 800px) {
    width: 100%;
  }
`;

const BannerContainer = styled.div`
  height: 350px;
  margin-top: 10%;

  @media (min-width: 1050px) {
    align-self: flex-start;
    margin-left: 15%;
  }

  @media (min-width: 1300px) {
    align-self: center;
    margin-left: 0;
  }
`;

const Logo = styled.img`
  width: 60px;
`;

const Title = styled.h1`
  font-size: 68px;

  @media (max-width: 380px) {
    font-size: 30px;
  }

  @media (min-width: 380px) and (max-width: 600px) {
    font-size: 45px;
  }
`;

const SlackLoginButton = styled.button`
  height: 46px;
  width: 178px;
  border-radius: 7px;
  border: 3px solid white;
  background-image: url(https://platform.slack-edge.com/img/sign_in_with_slack.png);
  background-repeat: no-repeat;
  margin-top: 25px;
  transition: all 0.2s ease-in-out;

  &:hover {
    border: 3px solid mediumpurple;
    cursor: pointer;
    transform: scale(1.05);
  }
`;

const List = styled.ol`
  display: flex;
  justify-content: space-between;
  list-style: none;

  @media (max-width: 1050px) {
    flex-direction: column;
    width: 55%;
    margin-bottom: 40px;
  }

  @media (min-width: 800px) and (max-width: 1050px) {
    width: 55%;
  }
`;

const ListItem = styled.li`
  display: flex;
  flex-direction: column;
  margin: 20px;
  width: 100%;
  text-align: center;
  border-radius: 7px;
  height: 220px;
  position: relative;
  box-shadow: 2px 2px 9px -1px rgba(71, 71, 71, 0.89);

  &:hover {
    cursor: default;
    box-shadow: none;
  }

  @media (max-width: 1050px) {
    height: 200px;
    margin-left: 0;
    margin-right: 0;
  }
`;

const ListItemHeader = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 40px;
  font-size: 23px;
  width: 100%;
  position: absolute;
  background-color: white;
  color: ${colors.slackPurple};
  border-radius: 4px 4px 0 0;

  > span {
    padding-right: 7px;
  }
`;

const ListItemBody = styled.div`
  display: flex;
  align-items: center;
  height: 100%;
  padding-top: 40px;
  font-size: 21px;

  > span {
    padding: 30px;
  }

  &::after {
    background-image: linear-gradient(to right, #c140fe, #e09160);
    opacity: 0.8;
    position: absolute;
    content: "";
    width: 100%;
    height: 100%;
    z-index: -1;
    top: 0;
    left: 0;
    border-radius: 4px;
  }

  @media (max-width: 440px) {
    font-size: 15px;
  }

  @media (min-width: 440px) and (max-width: 800px) {
    font-size: 17px;
  }

  @media (max-width: 1050px) {
    height: 200px;
  }
`;

const iconCss = css`
  position: absolute;
  top: 0;
  right: 0;
  padding: 5px;

  > a {
    color: white;

    &:hover {
      cursor: pointer;
      color: ${colors.slackPurple};
    }
  }
`;

const GitCloneButton = styled.div`
  ${iconCss};
`;

const AboutButton = styled.div`
  ${iconCss};
  right: 40px;
`;

export {
  OffsetContent,
  CenteredContent,
  BackgroundImage,
  BannerContainer,
  Logo,
  Title,
  SlackLoginButton,
  List,
  ListItem,
  ListItemHeader,
  ListItemBody,
  GitCloneButton,
  AboutButton,
};
