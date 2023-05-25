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

  const [startDate, setstartDate] = useState()
  // set default date range (current minus 24hrs * 60min * 60sec * 1000ms per day * 14 days)
  const twoWeeksAgo = new Date(Date.now() - 24 * 60 * 60 * 1000 * 14)
  const [datePickerValue, setDatePickerValue] = useState([
    twoWeeksAgo,
    new Date()
  ])
  const [temporalRangeFound, settemporalRangeFound] = useState(false)

  useEffect(() => {
    if (_selectedCollectionData) {
      const startDateFromCollection = new Date(
        _selectedCollectionData.extent.temporal.interval[0]
      )
      settemporalRangeFound(true)
      setstartDate(startDateFromCollection)
      const collectionEndDateOrCurrent =
        _selectedCollectionData.extent.temporal.interval[0][1] !== null
          ? new Date(_selectedCollectionData.extent.temporal.interval[0][1])
          : new Date()
      setDatePickerValue([
        new Date(_selectedCollectionData.extent.temporal.interval[0][0]),
        collectionEndDateOrCurrent
      ])
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
            <a data-tooltip-id="dateRange-tooltip">
              <InfoOutlinedIcon className="dateToolTipIcon" />
            </a>
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
        calendarType="US"
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
