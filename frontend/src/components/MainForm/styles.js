import styled from "styled-components";

const MainFormContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding-bottom: 30px;
  min-height: 500px;
`;

const Form = styled.form`
  width: 63%;
  max-width: 525px;
  padding: 40px;
  align-self: baseline;

  @media (max-width: 768px) {
    width: 90%;
  }
`;

const LargeText = styled.h2`
  font-size: 24px;
  padding-top: 10px;
  padding-bottom: 10px;
`;

const PaddedSection = styled.section`
  padding: 15px;
`;

const CenteredContent = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
`;

export { MainFormContainer, Form, LargeText, PaddedSection, CenteredContent };
