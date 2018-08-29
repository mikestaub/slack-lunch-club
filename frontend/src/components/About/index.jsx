import React from "react";
import {
  AboutContainer,
  Text,
  Link,
  CoffeeLink,
  CoffeeImage,
  CoffeeContainer,
  Title,
} from "./styles";

function About(props) {
  return (
    <AboutContainer>
      <Title>About</Title>
      <Text>
        Slack Lunch Club is a simple and fun way to bring your team closer
        together.
      </Text>
      <Text>
        The app was also an excuse for me to learn about cutting edge web
        technologies, and the best way to learn is to build!
      </Text>
      <Text>
        Keep in mind this is considered 'beta / experimental' software. I will
        never share any data collected, but use this app at your own risk. If
        you find that this app is providing value to your team, or you just want
        to support me, please
      </Text>
      <CoffeeContainer>
        <CoffeeLink
          href="https://www.buymeacoffee.com/mikestaub"
          target="_blank"
        >
          <CoffeeImage src="https://www.buymeacoffee.com/assets/img/BMC-btn-logo.svg" />
          buy me a coffee
        </CoffeeLink>
      </CoffeeContainer>
      <Text>
        To learn more about how the app was implemented, read the blog post
        series
        <Link
          href="https://medium.com/@mikestaub22/slack-lunch-club-part-1-7-deep-dive-into-a-modern-web-app-d3eb980a215"
          target="_blank"
          rel="noopener"
        >
          here
        </Link>
        .
      </Text>
      <Text>
        And follow me on twitter for future updates.
        <Link
          href="https://twitter.com/mikestaub"
          target="_blank"
          rel="noopener"
        >
          @mikestaub
        </Link>
      </Text>
    </AboutContainer>
  );
}

export default About;
