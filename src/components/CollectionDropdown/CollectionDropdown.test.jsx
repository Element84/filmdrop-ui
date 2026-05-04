import React from 'react'
import { vi } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import CollectionDropdown from './CollectionDropdown'
import { Provider } from 'react-redux'
import { store } from '../../redux/store'
import {
  setCollectionsData,
  setappConfig,
  setSelectedCollection
} from '../../redux/slices/mainSlice'
import { mockCollectionsData, mockAppConfig } from '../../testing/shared-mocks'
import * as mapHelper from '../../utils/mapHelper'
import userEvent from '@testing-library/user-event'

// Mock useNavigate so it simulates URL→Redux sync for selectedCollection
const mockNavigate = vi.fn()
vi.mock('@tanstack/react-router', async () => {
  const { store } = await import('../../redux/store')
  const { setSelectedCollection } = await import('../../redux/slices/mainSlice')
  return {
    useParams: () => ({}),
    useNavigate: () => {
      return (...args) => {
        mockNavigate(...args)
        // Simulate URL→Redux sync: extract collectionId from params
        const navOptions = args[0]
        if (navOptions?.params?.collectionId) {
          store.dispatch(setSelectedCollection(navOptions.params.collectionId))
        }
      }
    },
    createRootRoute: vi.fn(() => ({ addChildren: vi.fn(() => ({})) })),
    createRoute: vi.fn(() => ({ addChildren: vi.fn(() => ({})) })),
    createRouter: vi.fn(() => ({})),
    defaultStringifySearch: vi.fn()
  }
})

describe('CollectionDropdown', () => {
  const setup = () =>
    render(
      <Provider store={store}>
        <CollectionDropdown />
      </Provider>
    )

  beforeEach(() => {
    vi.mock('../../utils/mapHelper')
    store.dispatch(setappConfig(mockAppConfig))
    store.dispatch(setCollectionsData(mockCollectionsData))
    store.dispatch(setSelectedCollection(null))
    mockNavigate.mockClear()
  })
  afterEach(() => {
    vi.resetAllMocks()
  })

  describe('on render', () => {
    it('should load collections options from collectionsData in redux state', async () => {
      setup()
      // Open the dropdown to see options
      const select = screen.getByRole('combobox')
      await userEvent.click(select)
      const listbox = within(screen.getByRole('listbox'))
      expect(listbox.getByText('Copernicus DEM GLO-30')).toBeInTheDocument()
      expect(listbox.getByText('Sentinel-2 Level 2A')).toBeInTheDocument()
    })
  })
  describe('on collection changed', () => {
    it('should navigate to collection path and call functions to reset map', async () => {
      const spyZoomToCollectionExtent = vi.spyOn(
        mapHelper,
        'zoomToCollectionExtent'
      )
      const spyClearMapSelection = vi.spyOn(mapHelper, 'clearMapSelection')
      const spyClearAllLayers = vi.spyOn(mapHelper, 'clearAllLayers')
      setup()
      const select = screen.getByRole('combobox')
      await userEvent.click(select)
      // Click a different collection than the auto-selected first one
      const option = screen.getByRole('option', {
        name: /sentinel-2 level 2a/i
      })
      await userEvent.click(option)
      expect(store.getState().mainSlice.showZoomNotice).toBeFalsy()
      expect(store.getState().mainSlice.searchLoading).toBeFalsy()
      expect(spyZoomToCollectionExtent).toHaveBeenCalled()
      expect(spyClearMapSelection).toHaveBeenCalled()
      expect(spyClearAllLayers).toHaveBeenCalled()
      // Verify navigate was called with collection path
      expect(mockNavigate).toHaveBeenCalledWith(
        expect.objectContaining({
          to: '/$collectionId',
          params: expect.objectContaining({
            collectionId: expect.any(String)
          })
        })
      )
    })
  })
})
