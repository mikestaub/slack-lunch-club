import styled from "styled-components";

// TODO use element queries https://github.com/styled-components/styled-components/issues/416
const DayList = styled.ol`
  display: flex;
  justify-content: space-between;
  list-style: none;

  @media (max-width: 500px) {
    flex-direction: column;
  }
`;

const PaddedWrapper = styled.div`
  position: absolute;
  padding: 10px;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
`;

const DayListItem = styled.li`
  position: relative;
  background-image: linear-gradient(to right, #251886, #d300ff);
  background-attachment: fixed;
  border-radius: 7px;
  margin: 5px;
  width: 20%;

  /* maintain square shape */
  &::after {
    padding-top: 100%;
    display: block;
    content: "";
  }

  &:first-child {
    margin-left: 0;
  }

  &:last-child {
    margin-right: 0;
  }

  &:hover {
    cursor: pointer;
    box-shadow: 0 0 10px 0 rgba(6, 17, 184, 0.75);
  }

  @media (max-width: 500px) {
    width: 100%;
    height: 50px;
    margin: 0;
    margin-top: 10px;
    padding-bottom: 0;

    * label {
      margin-left: 10px;
    }
  }
`;

const DayContainer = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  text-align: center;
  justify-content: space-between;
  align-items: center;

  @media (max-width: 500px) {
    flex-direction: row-reverse;
    text-align: left;
    justify-content: flex-end;
  }
`;

const DayOfMonth = styled.div`
  padding: 5px;
  font-size: 17px;
`;

export { DayList, DayListItem, PaddedWrapper, DayContainer, DayOfMonth };
