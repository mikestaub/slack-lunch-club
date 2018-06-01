import styled from "styled-components";

import { colors } from "../SharedStyles";

const AboutContainer = styled.div`
  display: flex;
  height: 100%;
  margin: 10% 15% 10% 15%;
  text-align: center;
  flex-direction: column;
`;

const Text = styled.p`
  font-size: 20px;
  margin: 10px;
`;

const Link = styled.a`
  color: lightblue;
  font-size: 20px;
  padding-left: 5px;

  &:hover {
    color: purple;
    cursor: pointer;
  }
`;

const CoffeeLink = styled.a`
  width: 200px;
  background: ${colors.slackPurple};
  padding: 12px;
  padding-right: 26px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  color: white;
  text-decoration: none;

  &:hover {
    cursor: pointer;
    filter: brightness(85%);
  }
`;

const CoffeeImage = styled.img`
  height: 30px;
  width: 60px;
`;

const CoffeeContainer = styled.div`
  display: flex;
  justify-content: center;
  margin-top: 20px;
  margin-bottom: 20px;
`;

const Title = styled.h2`
  color: #ffc973;
  font-size: 50px;
  margin: 15px;
`;

export {
  AboutContainer,
  Text,
  Link,
  CoffeeImage,
  CoffeeLink,
  CoffeeContainer,
  Title,
};
