import React, { useEffect, useMemo } from 'react'
import './DateTimeRangeSelector.css'
import { useSelector, useDispatch } from 'react-redux'
import { setSearchDateRangeValue } from '../../redux/slices/mainSlice'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import Card from '../Card/Card'

// dayjs.extend is idempotent; calling it at module load is safe and only
// needs to happen once per bundle.
dayjs.extend(utc)

const calendarSlotProps = {
  desktopPaper: {
    sx: {
      backgroundColor: 'var(--side-panel-datepicker-popup-background)',
      color: 'var(--side-panel-datepicker-popup-color)',
      border: '1px solid var(--side-panel-datepicker-popup-border)',
      backgroundImage: 'none'
    }
  }
}

const DateTimeRangeSelector = () => {
  const dispatch = useDispatch()
  const selectedCollectionData = useSelector(
    (state) => state.mainSlice.selectedCollectionData
  )
  const searchDateRangeValue = useSelector(
    (state) => state.mainSlice.searchDateRangeValue
  )

  // Memoized helper text for collection extent
  const collectionExtentText = useMemo(() => {
    if (!selectedCollectionData?.extent?.temporal?.interval?.[0]?.[0]) {
      return null
    }

    const startExtent = selectedCollectionData.extent.temporal.interval[0][0]
    const endExtent = selectedCollectionData.extent.temporal.interval[0][1]

    const startFormatted = dayjs(startExtent).format('YYYY-MM-DD')
    const endFormatted = endExtent
      ? dayjs(endExtent).format('YYYY-MM-DD')
      : 'Present'

    return `Available: ${startFormatted} to ${endFormatted}`
  }, [selectedCollectionData])

  // When collection changes, reset date range:
  // - Finite collections (definite end date): use full temporal extent
  // - Ongoing collections (null end date): use last 2 weeks from today
  useEffect(() => {
    if (!selectedCollectionData?.extent?.temporal?.interval?.[0]) {
      return
    }

    const collectionStart =
      selectedCollectionData.extent.temporal.interval[0][0]
    const collectionEnd = selectedCollectionData.extent.temporal.interval[0][1]

    if (!collectionStart) {
      return
    }

    const collectionStartDate = dayjs(collectionStart)
    const collectionEndDate = collectionEnd ? dayjs(collectionEnd) : dayjs()

    if (collectionEnd) {
      // Finite collection (e.g. NAIP) — use full extent
      dispatch(
        setSearchDateRangeValue([
          collectionStartDate.toISOString(),
          collectionEndDate.toISOString()
        ])
      )
    } else {
      // Ongoing collection (null end date, e.g. Sentinel-2) — last 2 weeks
      const twoWeeksAgo = dayjs().subtract(14, 'day')
      const newStart = twoWeeksAgo.isBefore(collectionStartDate)
        ? collectionStartDate
        : twoWeeksAgo

      dispatch(
        setSearchDateRangeValue([newStart.toISOString(), dayjs().toISOString()])
      )
    }
  }, [selectedCollectionData, dispatch])

  // Handle date changes - dispatch directly to Redux
  // MUI DatePicker passes dayjs objects directly
  const handleStartDateChange = (date) => {
    if (date && date.isValid()) {
      // Create new Date at start of day in UTC
      const utcDate = date.startOf('day').toISOString()
      dispatch(setSearchDateRangeValue([utcDate, searchDateRangeValue[1]]))
    }
  }

  const handleEndDateChange = (date) => {
    if (date && date.isValid()) {
      // Create new Date at end of day in UTC
      const utcDate = date.endOf('day').toISOString()
      dispatch(setSearchDateRangeValue([searchDateRangeValue[0], utcDate]))
    }
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Card label="Date Range (UTC)" className="datePicker">
        {collectionExtentText && (
          <div className="datePickerHelperText">{collectionExtentText}</div>
        )}
        <div className="datePickerContainer">
          <div className="datePickerInputWrapper">
            <DatePicker
              value={dayjs(searchDateRangeValue[0])}
              maxDate={dayjs(searchDateRangeValue[1])}
              format="YYYY-MM-DD"
              onChange={handleStartDateChange}
              slotProps={{
                ...calendarSlotProps,
                textField: {
                  id: 'startDatePicker',
                  size: 'small'
                }
              }}
            />
            <label htmlFor="startDatePicker" className="datePickerInputLabel">
              From
            </label>
          </div>
          <div className="datePickerInputWrapper">
            <DatePicker
              value={dayjs(searchDateRangeValue[1])}
              minDate={dayjs(searchDateRangeValue[0])}
              maxDate={dayjs()}
              format="YYYY-MM-DD"
              onChange={handleEndDateChange}
              slotProps={{
                ...calendarSlotProps,
                textField: {
                  id: 'endDatePicker',
                  size: 'small'
                }
              }}
            />
            <label htmlFor="endDatePicker" className="datePickerInputLabel">
              To
            </label>
          </div>
        </div>
      </Card>
    </LocalizationProvider>
  )
}

export default DateTimeRangeSelector
