import React from "react";
import PropTypes from "prop-types";
import { Emoji } from "emoji-mart";
import GithubIcon from "react-icons/lib/fa/github";
import QuestionIcon from "react-icons/lib/fa/question-circle";
import { oneLine } from "common-tags";

import backgroundImage from "./breakfast-club.png";
import smallBackgroundImage from "./small-breakfast-club.png";
import {
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
} from "./styles";

const createListItem = (emoji, text, idx) => (
  <ListItem>
    <ListItemHeader>
      <Emoji emoji={emoji} size={22} />
      {`Step ${idx}`}
    </ListItemHeader>
    <ListItemBody>
      <span>{text}</span>
    </ListItemBody>
  </ListItem>
);

const LandingPage = props => (
  <CenteredContent>
    <BackgroundImage
      src={backgroundImage}
      placeholder={smallBackgroundImage}
      transition="all 0.5s linear"
    />
    <BannerContainer>
      <OffsetContent>
        <CenteredContent>
          <Logo src={props.logo} alt="logo" />
          <Title>Slack Lunch Club</Title>
          <SlackLoginButton
            id="sign-in-with-slack"
            onClick={props.slackLogin}
          />
        </CenteredContent>
      </OffsetContent>
    </BannerContainer>
    <CenteredContent>
      <List>
        {createListItem(
          "calendar",
          oneLine`Set your availability and location. You will be matched with
            a random member of your slack team within 5 min walking distance.`,
          1,
        )}
        {createListItem(
          "envelope_with_arrow",
          "Receive your match email the following saturday at noon.",
          2,
        )}
        {createListItem(
          "taco",
          "Coordinate a time and place to meet for lunch that week!",
          3,
        )}
      </List>
    </CenteredContent>
    <GitCloneButton>
      <a
        href="https://github.com/mikestaub/slack-lunch-club.git"
        target="_blank"
        rel="noopener noreferrer"
        title="view on github.com"
      >
        <GithubIcon size={32} />
      </a>
    </GitCloneButton>
    <AboutButton>
      <a href="/about" title="about">
        <QuestionIcon size={32} />
      </a>
    </AboutButton>
  </CenteredContent>
);

LandingPage.propTypes = {
  logo: PropTypes.string.isRequired,
  slackLogin: PropTypes.func.isRequired,
};

export default LandingPage;
