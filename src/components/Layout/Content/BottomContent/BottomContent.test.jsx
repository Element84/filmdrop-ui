import { vi } from 'vitest'
import React from 'react'
import { render, screen } from '@testing-library/react'
import BottomContent from './BottomContent'
import { Provider } from 'react-redux'
import { store } from '../../../../redux/store'
import {
  setSearchResults,
  setisDrawingEnabled
} from '../../../../redux/slices/mainSlice'
import {
  mockSceneSearchResult,
  mockHexAggregateSearchResult,
  mockGridAggregateSearchResult
} from '../../../../testing/shared-mocks'
import userEvent from '@testing-library/user-event'
import * as mapHelper from '../../../../utils/mapHelper'

describe('BottomContent', () => {
  const user = userEvent.setup()
  const setup = () =>
    render(
      <Provider store={store}>
        <BottomContent />
      </Provider>
    )

  beforeEach(() => {
    vi.mock('../../../../utils/mapHelper')
  })
  afterEach(() => {
    vi.resetAllMocks()
  })

  describe('when isDrawingEnabled is true', () => {
    beforeEach(() => {
      store.dispatch(setisDrawingEnabled(true))
    })
    it('should not show scene message when drawing message is showing', () => {
      store.dispatch(setSearchResults(mockSceneSearchResult))
      setup()
      expect(
        screen.queryByTestId('testShowingScenesMessage')
      ).not.toBeInTheDocument()
    })
    it('should not show grid aggregate messages when drawing message is showing', () => {
      store.dispatch(setSearchResults(mockGridAggregateSearchResult))
      setup()
      expect(
        screen.queryByTestId('testShowingAggregatedMessage')
      ).not.toBeInTheDocument()
    })
    it('should not show hex aggregate messages when drawing message is showing', () => {
      store.dispatch(setSearchResults(mockHexAggregateSearchResult))
      setup()
      expect(
        screen.queryByTestId('testShowingAggregatedMessage')
      ).not.toBeInTheDocument()
    })
    describe('on draw message close clicked', () => {
      it('should setisDrawingEnabled to false in redux state and call disableMapPolyDrawing', async () => {
        const spyDisableMapPolyDrawing = vi.spyOn(
          mapHelper,
          'disableMapPolyDrawing'
        )
        setup()
        expect(store.getState().mainSlice.isDrawingEnabled).toBeTruthy()
        await user.click(
          screen.getByRole('button', {
            name: /cancel/i
          })
        )
        expect(store.getState().mainSlice.isDrawingEnabled).toBeFalsy()
        expect(spyDisableMapPolyDrawing).toHaveBeenCalledOnce()
      })
    })
  })
  describe('when isDrawingEnabled is false', () => {
    it('should show scene messages when not drawing', () => {
      store.dispatch(setisDrawingEnabled(false))
      store.dispatch(setSearchResults(mockSceneSearchResult))
      setup()
      expect(
        screen.queryByTestId('testShowingScenesMessage')
      ).toBeInTheDocument()
    })
    it('should show grid aggregate messages when not drawing', () => {
      store.dispatch(setisDrawingEnabled(false))
      store.dispatch(setSearchResults(mockGridAggregateSearchResult))
      setup()
      expect(
        screen.queryByTestId('testShowingAggregatedMessage')
      ).toBeInTheDocument()
    })
    it('should show hex aggregate messages when not drawing', () => {
      store.dispatch(setisDrawingEnabled(false))
      store.dispatch(setSearchResults(mockHexAggregateSearchResult))
      setup()
      expect(
        screen.queryByTestId('testShowingAggregatedMessage')
      ).toBeInTheDocument()
    })
  })
})
