import { describe, it, vi } from 'vitest'
import React from 'react'
import { render, screen } from '@testing-library/react'
import LeftContent from './LeftContent'
import { Provider } from 'react-redux'
import { store } from '../../../../redux/store'
import {
  setappConfig,
  setShowPopupModal,
  setClickResults,
  setSearchLoading
} from '../../../../redux/slices/mainSlice'
import {
  mockAppConfig,
  mockClickResults
} from '../../../../testing/shared-mocks'
import userEvent from '@testing-library/user-event'

describe('LeftContent', () => {
  const user = userEvent.setup()
  const setup = () =>
    render(
      <Provider store={store}>
        <LeftContent />
      </Provider>
    )

  beforeEach(() => {
    store.dispatch(setappConfig(mockAppConfig))
    vi.mock('../../../../utils/mapHelper')
  })
  afterEach(() => {
    vi.resetAllMocks()
  })

  describe('on render', () => {
    it('should render Search', () => {
      setup()
      expect(screen.queryByTestId('Search')).toBeInTheDocument()
    })
    // it('should render popup results if showPopupModal set to true in redux and clickResults greater than 0', () => {
    //   store.dispatch(setShowPopupModal(true))
    //   store.dispatch(setClickResults([mockClickResults[0]]))
    //   setup()
    //   expect(screen.queryByTestId('testPopupResults')).toBeInTheDocument()
    // })
    // it('should not render popup results if showPopupModal set to false in redux', () => {
    //   store.dispatch(setClickResults([mockClickResults[0]]))
    //   setup()
    //   expect(screen.queryByTestId('testPopupResults')).not.toBeInTheDocument()
    // })
    // it('should not render popup results clickResults has not results added', () => {
    //   store.dispatch(setShowPopupModal(true))
    //   store.dispatch(setClickResults([]))
    //   setup()
    //   expect(screen.queryByTestId('testPopupResults')).not.toBeInTheDocument()
    // })

    // describe('when drawing mode enabled', () => {
    //   it('should render disabled search bar overlay div', async () => {
    //     setup()
    //     const drawBoundaryButton = screen.getByRole('button', {
    //       name: /draw/i
    //     })
    //     await user.click(drawBoundaryButton)
    //     expect(
    //       screen.queryByTestId('test_disableSearchOverlay')
    //     ).toBeInTheDocument()
    //   })
    // })

    // describe('when search loading', () => {
    //   it('should render disabled search bar overlay div', async () => {
    //     store.dispatch(setSearchLoading(true))
    //     store.dispatch(setappConfig(mockAppConfig))
    //     setup()
    //     expect(
    //       screen.queryByTestId('test_disableSearchOverlay')
    //     ).toBeInTheDocument()
    //   })
    // })
  })
})
