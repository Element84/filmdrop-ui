import React, { useEffect, useState } from 'react'
import './DateTimeRangeSelector.css'
import { useSelector, useDispatch } from 'react-redux'
import 'react-tooltip/dist/react-tooltip.css'
import { Tooltip } from 'react-tooltip'
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined'
import DateTimeRangePicker from '@wojtekmaj/react-datetimerange-picker'
import { setSearchDateRangeValue } from '../../redux/slices/mainSlice'

const DateTimeRangeSelector = () => {
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

  const [startDate, setstartDate] = useState()
  const [datePickerValue, setDatePickerValue] = useState(_SearchDateRangeValue)

  const [temporalRangeFound, settemporalRangeFound] = useState(false)

  useEffect(() => {
    let collectionEndDateOrCurrent

    if (_selectedCollectionData) {
      const startDateFromCollection = new Date(
        _selectedCollectionData.extent.temporal.interval[0]
      )
      settemporalRangeFound(true)
      setstartDate(startDateFromCollection)
      collectionEndDateOrCurrent =
        _selectedCollectionData.extent.temporal.interval[0][1] !== null
          ? new Date(_selectedCollectionData.extent.temporal.interval[0][1])
          : new Date()
    }
    // if temporal range not in last two week on init, set to match collection
    if (_selectedCollectionData && !_hasCollectionChanged) {
      if (
        (datePickerValue[0] <
          new Date(_selectedCollectionData.extent.temporal.interval[0][0]) &&
          datePickerValue[1] <
            new Date(_selectedCollectionData.extent.temporal.interval[0][0])) ||
        (datePickerValue[0] > collectionEndDateOrCurrent &&
          datePickerValue[1] > collectionEndDateOrCurrent)
      ) {
        setDatePickerValue([
          new Date(_selectedCollectionData.extent.temporal.interval[0][0]),
          collectionEndDateOrCurrent
        ])
      }
    }
    if (_selectedCollectionData && _hasCollectionChanged) {
      if (datePickerValue) {
        if (
          (datePickerValue[0] <
            new Date(_selectedCollectionData.extent.temporal.interval[0][0]) &&
            datePickerValue[1] <
              new Date(
                _selectedCollectionData.extent.temporal.interval[0][0]
              )) ||
          (datePickerValue[0] > collectionEndDateOrCurrent &&
            datePickerValue[1] > collectionEndDateOrCurrent)
        ) {
          setDatePickerValue([
            new Date(_selectedCollectionData.extent.temporal.interval[0][0]),
            collectionEndDateOrCurrent
          ])
        }
      } else {
        setDatePickerValue([
          new Date(_selectedCollectionData.extent.temporal.interval[0][0]),
          collectionEndDateOrCurrent
        ])
      }
    }
  }, [_selectedCollectionData])

  useEffect(() => {
    dispatch(setSearchDateRangeValue(datePickerValue))
  }, [datePickerValue])

  return (
    <div className="datePicker">
      <label>
        Date Range{' '}
        {temporalRangeFound && (
          <>
            <span data-tooltip-id="dateRange-tooltip">
              <InfoOutlinedIcon className="dateToolTipIcon" />
            </span>
            <Tooltip id="dateRange-tooltip">
              <strong>Collection Range:</strong>
              <br />
              {_selectedCollectionData.extent.temporal.interval[0][0]
                ? new Date(
                    _selectedCollectionData.extent.temporal.interval[0][0]
                  ).toDateString()
                : 'No Lower Limit'}{' '}
              -{' '}
              {_selectedCollectionData.extent.temporal.interval[0][1]
                ? new Date(
                    _selectedCollectionData.extent.temporal.interval[0][1]
                  ).toDateString()
                : 'Present'}
            </Tooltip>
          </>
        )}
        {!datePickerValue && (
          <span className="error-true">
            <em>Required</em>
          </span>
        )}
      </label>
      <DateTimeRangePicker
        className="dateTimePicker"
        format={'yy-MM-dd'}
        calendarType="gregory"
        showLeadingZeros={false}
        disableClock={true}
        required={true}
        minDate={startDate}
        onChange={setDatePickerValue}
        value={datePickerValue}
      ></DateTimeRangePicker>
    </div>
  )
}

export default DateTimeRangeSelector
