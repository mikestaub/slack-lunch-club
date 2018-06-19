import React from "react";
import PropTypes from "prop-types";
import Ink from "react-ink";
import dayjs from "dayjs";
import AdvancedFormat from "dayjs/plugin/advancedFormat";

import withNullableProps from "../WithNullableProps";

import {
  DayList,
  DayListItem,
  PaddedWrapper,
  DayContainer,
  DayOfMonth,
} from "./styles";
import CheckBox from "../CheckBox";

const shortDay = {
  monday: "Mon",
  tuesday: "Tues",
  wednesday: "Wed",
  thursday: "Thurs",
  friday: "Fri",
};

dayjs.extend(AdvancedFormat);

function AvailableDaysPicker(props) {
  const days = Object.keys(props.availableDays).map((day, idx) => (
    <DayListItem
      key={idx}
      onClick={() =>
        props.onClick({
          ...props.availableDays,
          [day]: !props.availableDays[day],
        })
      }
    >
      <PaddedWrapper>
        <DayContainer>
          <DayOfMonth>
            {`${shortDay[day]}, ${dayjs()
              .startOf("week")
              .add(idx + 1, "day")
              .format("Do")}`}
          </DayOfMonth>
          <CheckBox
            isChecked={props.availableDays[day]}
            onCheckBoxChanged={() =>
              props.onClick({
                ...props.availableDays,
                [day]: !props.availableDays[day],
              })
            }
          />
        </DayContainer>
      </PaddedWrapper>
      <Ink style={{ userSelect: "none" }} />
    </DayListItem>
  ));

  return <DayList>{days}</DayList>;
}

AvailableDaysPicker.propTypes = {
  availableDays: PropTypes.object,
  onClick: PropTypes.func.isRequired,
};

AvailableDaysPicker.defaultProps = {
  availableDays: {
    monday: false,
    tuesday: false,
    wednesday: false,
    thursday: false,
    friday: false,
  },
};

export default withNullableProps(AvailableDaysPicker);
