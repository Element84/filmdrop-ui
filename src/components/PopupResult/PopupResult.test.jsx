import React from 'react'
import { render, screen } from '@testing-library/react'
import PopupResult from './PopupResult'
import { Provider } from 'react-redux'
import { store } from '../../redux/store'
import {
  setSelectedCollectionData,
  setappConfig
} from '../../redux/slices/mainSlice'
import {
  mockAppConfig,
  mockClickResults,
  mockCollectionsData
} from '../../testing/shared-mocks'
import { describe } from 'vitest'

describe('PopupResult', () => {
  const setup = () =>
    render(
      <Provider store={store}>
        <PopupResult result={mockClickResults[0]} />
      </Provider>
    )

  beforeEach(() => {
    store.dispatch(setappConfig(mockAppConfig))
  })

  describe('on conditional render', () => {
    it('should render title field and no others if POPUP_DISPLAY_FIELDS not set in config', () => {
      const mockAppConfigSearchEnabled = {
        ...mockAppConfig
      }
      store.dispatch(setappConfig(mockAppConfigSearchEnabled))
      setup()
      expect(screen.queryByText(/title:/i)).toBeInTheDocument()
    })
    it('should render other properties only if POPUP_DISPLAY_FIELDS set in config and collection exists in app', () => {
      const mockAppConfigSearchEnabled = {
        ...mockAppConfig,
        POPUP_DISPLAY_FIELDS: { 'cop-dem-glo-30': ['datetime'] }
      }
      store.dispatch(setappConfig(mockAppConfigSearchEnabled))
      store.dispatch(setSelectedCollectionData(mockCollectionsData[0]))
      setup()
      expect(screen.queryByText(/title:/i)).toBeInTheDocument()
      expect(screen.queryByText(/datetime:/i)).toBeInTheDocument()
    })
    it('should not render other properties if POPUP_DISPLAY_FIELDS set in config but collection does not exists in app', () => {
      const mockAppConfigSearchEnabled = {
        ...mockAppConfig,
        POPUP_DISPLAY_FIELDS: { 'sentinel-2-l2a': ['datetime'] }
      }
      store.dispatch(setappConfig(mockAppConfigSearchEnabled))
      store.dispatch(setSelectedCollectionData(mockCollectionsData[0]))
      setup()
      expect(screen.queryByText(/title:/i)).toBeInTheDocument()
      expect(screen.queryByText(/datetime:/i)).not.toBeInTheDocument()
    })
  })
})
