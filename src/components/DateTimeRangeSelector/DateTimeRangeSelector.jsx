import React, { useEffect, useState } from 'react'
import './DateTimeRangeSelector.css'
import { useSelector, useDispatch } from 'react-redux'
import 'react-tooltip/dist/react-tooltip.css'
import { setSearchDateRangeValue } from '../../redux/slices/mainSlice'
import CalendarTodayIcon from '@mui/icons-material/CalendarToday'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import { convertToUTC } from '../../utils/datetime'

const DateTimeRangeSelector = () => {
  dayjs.extend(utc)
  const dispatch = useDispatch()
  const _selectedCollectionData = useSelector(
    (state) => state.mainSlice.selectedCollectionData
  )
  const _hasCollectionChanged = useSelector(
    (state) => state.mainSlice.hasCollectionChanged
  )
  const _SearchDateRangeValue = useSelector(
    (state) => state.mainSlice.searchDateRangeValue
  )
  const _hasLeftPanelTabChanged = useSelector(
    (state) => state.mainSlice.hasLeftPanelTabChanged
  )
  const [startDate, setstartDate] = useState(_SearchDateRangeValue[0])
  const [endDate, setendDate] = useState(_SearchDateRangeValue[1])

  useEffect(() => {
    if (!_selectedCollectionData) {
      return
    }

    const currentDateUTCString = dayjs(new Date()).utc().startOf('day').format()
    const collectionEndDateOrCurrentLocal =
      _selectedCollectionData.extent.temporal.interval[0][1] !== null
        ? convertToUTC(_selectedCollectionData.extent.temporal.interval[0][1])
        : convertToUTC(currentDateUTCString)

    // if temporal range not in last two week on init, set to match collection
    if (!_hasCollectionChanged) {
      if (
        (startDate <
          convertToUTC(
            _selectedCollectionData.extent.temporal.interval[0][0]
          ) &&
          endDate <
            convertToUTC(
              _selectedCollectionData.extent.temporal.interval[0][0]
            )) ||
        (startDate > collectionEndDateOrCurrentLocal &&
          endDate > collectionEndDateOrCurrentLocal)
      ) {
        setstartDate(
          convertToUTC(_selectedCollectionData.extent.temporal.interval[0][0])
        )
        setendDate(collectionEndDateOrCurrentLocal)
      }
    } else {
      setstartDate(convertToUTC(_SearchDateRangeValue[0]))
      setendDate(convertToUTC(_SearchDateRangeValue[1]))
    }
  }, [_selectedCollectionData])

  useEffect(() => {
    let correctStartSearchDate
    let correctEndSearchDate

    const StartDateAsDateObject =
      startDate instanceof Date ? startDate : new Date(startDate)
    const offsetInMilliseconds =
      StartDateAsDateObject.getTimezoneOffset() * 60 * 1000

    if (startDate instanceof Date) {
      correctStartSearchDate = new Date(
        startDate.getTime() - offsetInMilliseconds
      ).toISOString()
    } else {
      correctStartSearchDate = new Date(startDate).toISOString()
    }

    if (endDate instanceof Date) {
      correctEndSearchDate = new Date(
        endDate.getTime() - offsetInMilliseconds
      ).toISOString()
    } else {
      correctEndSearchDate = new Date(endDate).toISOString()
    }

    dispatch(
      setSearchDateRangeValue([correctStartSearchDate, correctEndSearchDate])
    )
  }, [startDate, endDate])

  useEffect(() => {
    if (_hasLeftPanelTabChanged) {
      setstartDate(convertToUTC(_SearchDateRangeValue[0]))
      setendDate(convertToUTC(_SearchDateRangeValue[1]))
    }
  }, [])

  return (
    <div className="datePicker">
      <label>
        Date Range <span className="datePickerLabelUTCText">(UTC)</span>{' '}
        {!startDate || !endDate ? (
          <span className="error-true">
            <em>Required</em>
          </span>
        ) : null}
      </label>
      <div className="datePickerContainer">
        <DatePicker
          className="reactDatePicker"
          selected={
            startDate instanceof Date
              ? startDate.setHours(0, 0, 0)
              : new Date(startDate)
          }
          maxDate={endDate}
          showPopperArrow={false}
          todayButton="Today"
          showIcon
          icon={
            <CalendarTodayIcon className="datePicker-icon"></CalendarTodayIcon>
          }
          toggleCalendarOnIconClick
          closeOnScroll={true}
          peekNextMonth
          showMonthDropdown
          showYearDropdown
          dropdownMode="select"
          dateFormat="yyyy-MM-dd"
          popperPlacement="top-end"
          onChange={(date) => setstartDate(date)}
        ></DatePicker>
        <span className="dateRangeSpanText">to</span>
        <DatePicker
          className="reactDatePicker"
          selected={
            endDate instanceof Date
              ? endDate.setHours(23, 59, 59)
              : new Date(endDate)
          }
          minDate={startDate}
          maxDate={new Date()}
          showPopperArrow={false}
          todayButton="Today"
          showIcon
          icon={
            <CalendarTodayIcon className="datePicker-icon"></CalendarTodayIcon>
          }
          toggleCalendarOnIconClick
          closeOnScroll={true}
          showMonthDropdown
          showYearDropdown
          dropdownMode="select"
          dateFormat="yyyy-MM-dd"
          popperPlacement="top-end"
          onChange={(date) => setendDate(date)}
        ></DatePicker>
      </div>
    </div>
  )
}

export default DateTimeRangeSelector
