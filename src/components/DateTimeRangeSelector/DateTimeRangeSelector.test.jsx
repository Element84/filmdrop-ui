import React from 'react'
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Provider } from 'react-redux'
import dayjs from 'dayjs'
import { createFilmDropStore } from '../../redux/store'
import {
  setSelectedCollectionData,
  setSearchDateRangeValue
} from '../../redux/slices/mainSlice'
import DateTimeRangeSelector from './DateTimeRangeSelector.jsx'

/* eslint-disable react/prop-types -- mock components don't need prop validation */
vi.mock('@mui/x-date-pickers/LocalizationProvider', () => ({
  LocalizationProvider: ({ children }) => <>{children}</>
}))

vi.mock('@mui/x-date-pickers/AdapterDayjs', () => ({
  AdapterDayjs: {}
}))

vi.mock('@mui/x-date-pickers/DatePicker', () => ({
  DatePicker: ({ onChange, slotProps }) => {
    const id = slotProps?.textField?.id
    const nextValue =
      id === 'startDatePicker' ? dayjs('2024-02-01') : dayjs('2024-02-10')
    return (
      <button
        type="button"
        data-testid={id}
        onClick={() => onChange(nextValue)}
      >
        {id}
      </button>
    )
  }
}))
/* eslint-enable react/prop-types */

function renderSubject(store) {
  return render(
    <Provider store={store}>
      <DateTimeRangeSelector />
    </Provider>
  )
}

describe('DateTimeRangeSelector', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2024-03-15T12:00:00.000Z'))
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  it('shows extent helper text and initializes finite ranges to full extent', async () => {
    const store = createFilmDropStore()
    store.dispatch(
      setSearchDateRangeValue([
        '2024-01-01T00:00:00.000Z',
        '2024-01-02T00:00:00.000Z'
      ])
    )
    store.dispatch(
      setSelectedCollectionData({
        extent: {
          temporal: {
            interval: [['2024-01-10T00:00:00.000Z', '2024-01-20T00:00:00.000Z']]
          }
        }
      })
    )

    renderSubject(store)

    expect(screen.getByText(/^Available:/)).toHaveTextContent(
      /2024-01-(09|10).*2024-01-(19|20)/
    )

    expect(store.getState().mainSlice.searchDateRangeValue).toEqual([
      '2024-01-10T00:00:00.000Z',
      '2024-01-20T00:00:00.000Z'
    ])
  })

  it('initializes ongoing ranges to last two weeks through now', async () => {
    const store = createFilmDropStore()
    store.dispatch(
      setSearchDateRangeValue([
        '2023-01-01T00:00:00.000Z',
        '2023-01-02T00:00:00.000Z'
      ])
    )
    store.dispatch(
      setSelectedCollectionData({
        extent: {
          temporal: {
            interval: [['2023-01-01T00:00:00.000Z', null]]
          }
        }
      })
    )

    renderSubject(store)

    expect(screen.getByText(/^Available:/)).toHaveTextContent(/Present/)

    const [start, end] = store.getState().mainSlice.searchDateRangeValue
    expect(dayjs(end).isAfter(dayjs(start))).toBe(true)
    expect(dayjs(end).diff(dayjs(start), 'day')).toBe(14)
    expect(dayjs(start).isAfter(dayjs('2023-01-01T00:00:00.000Z'))).toBe(true)
  })

  it('updates start and end date values from picker changes', async () => {
    const store = createFilmDropStore()
    store.dispatch(
      setSearchDateRangeValue([
        '2024-01-01T00:00:00.000Z',
        '2024-01-20T00:00:00.000Z'
      ])
    )
    store.dispatch(
      setSelectedCollectionData({
        extent: {
          temporal: {
            interval: [['2024-01-01T00:00:00.000Z', '2024-01-20T00:00:00.000Z']]
          }
        }
      })
    )

    renderSubject(store)

    fireEvent.click(screen.getByTestId('startDatePicker'))
    expect(store.getState().mainSlice.searchDateRangeValue[0]).toBe(
      dayjs('2024-02-01').startOf('day').toISOString()
    )

    fireEvent.click(screen.getByTestId('endDatePicker'))
    expect(store.getState().mainSlice.searchDateRangeValue[1]).toBe(
      dayjs('2024-02-10').endOf('day').toISOString()
    )
  })
})
