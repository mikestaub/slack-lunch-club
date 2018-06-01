import styled from "styled-components";

const Background = styled.div`
  background: black;
  height: 75px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  z-index: 2000;
  box-shadow: 0 6px 20px -2px rgba(200, 50, 150, 0.7);
`;

const Container = styled.div`
  width: 63%;
  max-width: 525px;
  height: 100%;
  display: flex;
  margin: auto;
  justify-content: space-between;
  align-items: center;
  position: relative;

  @media (max-width: 768px) {
    width: 90%;
  }
`;

const Logo = styled.div`
  margin-left: 17px;
  width: 40px;

  &:hover {
    cursor: pointer;
    transform: scale(0.85);
  }
`;

const Title = styled.h1`
  font-size: 24px;

  @media (max-width: 300px) {
    display: none;
  }
`;

export { Container, Background, Logo, Title };
