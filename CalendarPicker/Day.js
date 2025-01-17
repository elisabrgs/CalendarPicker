import React from 'react';
import {
  View,
  Text,
  TouchableOpacity
} from 'react-native';
import PropTypes from 'prop-types';
import moment from 'moment';

export default function Day(props) {
  const {
    day,
    month,
    year,
    styles,
    customDatesStyles,
    onPressDay,
    selectedStartDate,
    selectedEndDate,
    allowRangeSelection,
    selectedDayStyle,
    selectedRangeStartStyle,
    selectedRangeStyle,
    selectedRangeEndStyle,
    minDate,
    maxDate,
    disabledDates,
    minRangeDuration,
    maxRangeDuration,
    theme,
    dateFormat,
    markedDates,
  } = props;

  const thisDay = moment({year, month, day});
  const thisDayFormatted = thisDay.format(dateFormat);

  let dateOutOfRange;
  let daySelectedStyle = styles.dayButton; // may be overridden depending on state
  let selectedDayColorStyle = {};
  let propSelectedDayStyle;
  let dateIsBeforeMin = false;
  let dateIsAfterMax = false;
  let dateIsDisabled = false;
  let dateIsBeforeMinDuration = false;
  let dateIsAfterMaxDuration = false;
  let customContainerStyle, customDateStyle, customTextStyle;

  // First let's check if date is out of range
  // Check whether props maxDate / minDate are defined. If not supplied,
  // don't restrict dates.
  if (maxDate) {
    dateIsAfterMax = thisDay.isAfter(maxDate, 'day');
  }
  if (minDate) {
    dateIsBeforeMin = thisDay.isBefore(minDate, 'day');
  }

  if (disabledDates && disabledDates.indexOf(thisDay.valueOf()) >= 0) {
    dateIsDisabled = true;
  }

  if (allowRangeSelection && minRangeDuration && selectedStartDate && thisDay.valueOf() > selectedStartDate.valueOf()) {
    if (Array.isArray(minRangeDuration)) {
      let i = minRangeDuration.findIndex((i)=>(i.date === selectedStartDate.valueOf()));
      if (i >= 0 && selectedStartDate.valueOf() + minRangeDuration[i].minDuration * 86400000 > thisDay.valueOf()) {
        dateIsBeforeMinDuration = true;
      }
    } else if(selectedStartDate.valueOf() + minRangeDuration * 86400000 > thisDay.valueOf()) {
      dateIsBeforeMinDuration = true;
    }
  }

	if (allowRangeSelection && maxRangeDuration && selectedStartDate && thisDay.valueOf() > selectedStartDate.valueOf()) {
		if (Array.isArray(maxRangeDuration)) {
			let i = maxRangeDuration.findIndex((i)=>(i.date === selectedStartDate.valueOf()));
			if (i >= 0 && selectedStartDate.valueOf() + maxRangeDuration[i].maxDuration * 86400000 < thisDay.valueOf()) {
				dateIsAfterMaxDuration = true;
			}
		} else if(selectedStartDate.valueOf() + maxRangeDuration * 86400000 < thisDay.valueOf()) {
			dateIsAfterMaxDuration = true;
		}
	}

  dateOutOfRange = dateIsAfterMax || dateIsBeforeMin || dateIsDisabled || dateIsBeforeMinDuration || dateIsAfterMaxDuration;

  // If date is in range let's apply styles
  if (!dateOutOfRange) {
    for (let cds of customDatesStyles) {
      if (thisDay.isSame(moment(cds.date), 'day')) {
        customContainerStyle = cds.containerStyle;
        customDateStyle = cds.style;
        customTextStyle = cds.textStyle;
        break;
      }
    }

    let isThisDaySameAsSelectedStart = thisDay.isSame(selectedStartDate, 'day');
    let isThisDaySameAsSelectedEnd = thisDay.isSame(selectedEndDate, 'day');

    // set selected day style
    if (!allowRangeSelection &&
        selectedStartDate &&
        isThisDaySameAsSelectedStart) {
      daySelectedStyle = styles.selectedDay;
      selectedDayColorStyle = [styles.selectedDayLabel];
      // selectedDayStyle prop overrides selectedDayColor (created via makeStyles)
      propSelectedDayStyle = selectedDayStyle || styles.selectedDayBackground;
    }

    // Set selected ranges styles
    if (allowRangeSelection) {
      if (selectedStartDate && selectedEndDate) {
          // Apply style for start date
        if (isThisDaySameAsSelectedStart) {
          daySelectedStyle = [styles.startDayWrapper, selectedRangeStyle, selectedRangeStartStyle];
          selectedDayColorStyle = styles.selectedDayLabel;
        }
        // Apply style for end date
        if (isThisDaySameAsSelectedEnd) {
          daySelectedStyle = [styles.endDayWrapper, selectedRangeStyle, selectedRangeEndStyle];
          selectedDayColorStyle = styles.selectedDayLabel;
        }
        // Apply style if start date is the same as end date
        if (isThisDaySameAsSelectedEnd &&
            isThisDaySameAsSelectedStart &&
            selectedEndDate.isSame(selectedStartDate, 'day')) {
            daySelectedStyle = [styles.selectedDay, styles.selectedDayBackground, selectedRangeStyle];
            selectedDayColorStyle = styles.selectedDayLabel;
        }
        // Apply style if this day is in range
        if (thisDay.isBetween(selectedStartDate, selectedEndDate, 'day')) {
          daySelectedStyle = [styles.inRangeDay, selectedRangeStyle];
          selectedDayColorStyle = styles.selectedDayLabel;
        }
      }
      // Apply style if start date has been selected but end date has not
      if (selectedStartDate &&
          !selectedEndDate &&
          isThisDaySameAsSelectedStart) {
          daySelectedStyle = [styles.selectedDay, selectedRangeStyle, selectedRangeStartStyle || styles.selectedDayBackground];
          selectedDayColorStyle = styles.selectedDayLabel;
      }
    }

    let markedDayContainerStyle = {};
    let markedDayTextStyle = {};
    if (markedDates && markedDates[thisDayFormatted]) {
      markedDayContainerStyle = markedDates[thisDayFormatted].selected ? theme.selectedDay.container : theme.activeDay.container;
      markedDayTextStyle = markedDates[thisDayFormatted].selected ? theme.selectedDay.text : theme.activeDay.text;
    }

    return (
      <View style={[styles.dayWrapper, customContainerStyle]}>
        <TouchableOpacity
          style={[customDateStyle, daySelectedStyle, propSelectedDayStyle, markedDayContainerStyle ]}
          onPress={() => onPressDay(day) }
        >
          <Text
            style={[
              styles.dayLabel,
              selectedDayColorStyle,
              customTextStyle,
              {
                color: theme.textDayColor,
                fontFamily: theme.textDayFontFamily,
                fontWeight: theme.textDayFontWeight,
                fontSize: theme.textDayFontSize,
              },
              markedDayTextStyle
            ]}
          >
            { day }
          </Text>
        </TouchableOpacity>
      </View>
    );
  }
  else {  // dateOutOfRange = true
    return (
      <View style={styles.dayWrapper}>
        <Text
          style={[
            styles.disabledText,
            {
              color: theme.textDisabledColor,
              fontFamily: theme.textDayFontFamily,
              fontWeight: theme.textDayFontWeight,
              fontSize: theme.textDayFontSize,
            },
          ]}
        >
          { day }
        </Text>
      </View>
    );
  }
}

Day.defaultProps = {
  customDatesStyles: [],
};

Day.propTypes = {
  styles: PropTypes.shape({}),
  day: PropTypes.number,
  onPressDay: PropTypes.func,
  disabledDates: PropTypes.array,
  minRangeDuration: PropTypes.oneOfType([PropTypes.array, PropTypes.number]),
  maxRangeDuration: PropTypes.oneOfType([PropTypes.array, PropTypes.number]),
};
