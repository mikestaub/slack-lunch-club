import React from "react";
import PropTypes from "prop-types";

import AvailableDaysPicker from "../AvailableDaysPicker";
import CheckBox from "../CheckBox";
import LocationPicker from "../LocationPicker";
import SubmitButton from "../SubmitButton";
import { LoadingIcon } from "../SharedStyles";
import {
  MainFormContainer,
  Form,
  LargeText,
  PaddedSection,
  CenteredContent,
} from "./styles";

class MainForm extends React.Component {
  blockFormSubmission() {
    // prevent enter key from submitting the form (map search event)
    window.addEventListener("keydown", this.onKeydown);
  }

  unblockFormSubmission() {
    window.removeEventListener("keydown", this.onKeydown);
  }

  onKeydown(event) {
    if (event.keyCode === 13) {
      event.preventDefault();
      return false;
    }
    return true;
  }

  componentWillMount() {
    this.blockFormSubmission();
  }

  componentWillUnmount() {
    this.unblockFormSubmission();
  }

  render() {
    const props = this.props;
    return (
      <MainFormContainer>
        {props.userLoading ? (
          <LoadingIcon size="50px" />
        ) : (
          <Form onSubmit={props.handleSubmitForm}>
            <PaddedSection>
              <LargeText>When are you available?</LargeText>
              <AvailableDaysPicker
                availableDays={props.availableDays}
                onClick={props.handleDayToggled}
              />
            </PaddedSection>
            <PaddedSection>
              <LargeText>Where are you coming from?</LargeText>
              <LocationPicker
                userLocation={props.userLocation}
                onLocationPicked={props.handleLocationPicked}
              />
            </PaddedSection>
            <PaddedSection>
              <CheckBox
                fontSize="24px"
                color="white"
                isChecked={props.matchEveryWeek}
                label="match me every week"
                onCheckBoxChanged={props.handleCheckBoxChanged}
              />
            </PaddedSection>
            <CenteredContent>
              <SubmitButton isLoading={props.requestPending} />
            </CenteredContent>
          </Form>
        )}
      </MainFormContainer>
    );
  }
}

MainForm.propTypes = {
  matchEveryWeek: PropTypes.bool,
  availableDays: PropTypes.object,
  userLocation: PropTypes.object,
  handleLocationPicked: PropTypes.func.isRequired,
  handleDayToggled: PropTypes.func.isRequired,
  handleCheckBoxChanged: PropTypes.func.isRequired,
  handleSubmitForm: PropTypes.func.isRequired,
  requestPending: PropTypes.bool.isRequired,
  userLoading: PropTypes.bool.isRequired,
};

export default MainForm;
