import { vi } from 'vitest'
import React from 'react'
import { screen, fireEvent, act } from '@testing-library/react'
import ViewSelector from './ViewSelector'
import { renderFilmDrop } from '../../testing/renderFilmDrop'
import {
  setAppConfig,
  setSelectedCollectionData,
  setViewMode,
  setMap,
  setAutoCenterOnItemChanged
} from '../../redux/slices/mainSlice'
import { mockAppConfig } from '../../testing/shared-mocks'
import * as mapLayers from '../../utils/mapLayers'

vi.mock('../../utils/mapLayers', () => ({
  getCurrentMapZoomLevel: vi.fn(() => 10)
}))

describe('ViewSelector', () => {
  let mockMap
  let zoomEndCallback
  let currentStore

  const setup = (
    configOverrides = {},
    collectionDataOverrides = {},
    options = {}
  ) => {
    const { skipMap = false, zoomLevel = 10 } = options

    // Render via the canonical FilmDrop test harness
    const result = renderFilmDrop(<ViewSelector />)
    currentStore = result.store

    if (!skipMap) {
      mapLayers.getCurrentMapZoomLevel.mockReturnValue(zoomLevel)
      mockMap = {
        on: vi.fn((event, callback) => {
          if (event === 'zoomend') {
            zoomEndCallback = callback
          }
        }),
        off: vi.fn()
      }
    }

    // State is dispatched after render so selectors flow through re-renders.
    act(() => {
      currentStore.dispatch(
        setAppConfig({
          ...mockAppConfig,
          ...configOverrides
        })
      )
      currentStore.dispatch(
        setSelectedCollectionData({
          id: 'test-collection',
          aggregations: [],
          ...collectionDataOverrides
        })
      )
      if (!skipMap) {
        currentStore.dispatch(setMap(mockMap))
      }
    })

    if (!skipMap && zoomEndCallback) {
      act(() => {
        zoomEndCallback()
      })
    }

    return result
  }

  const getButton = (name) => screen.getByRole('button', { name })

  beforeEach(() => {
    vi.clearAllMocks()
    zoomEndCallback = undefined
    mockMap = undefined
    currentStore = undefined
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('basic rendering', () => {
    it('should render all four view mode buttons', () => {
      setup()
      expect(getButton('Hex')).toBeInTheDocument()
      expect(getButton('Grid')).toBeInTheDocument()
      expect(getButton('Scene')).toBeInTheDocument()
      expect(getButton('Mosaic')).toBeInTheDocument()
    })

    it('should render View Mode label', () => {
      setup()
      expect(screen.getByText('View Mode')).toBeInTheDocument()
    })
  })

  describe('button disabled states', () => {
    describe('Hex button', () => {
      it('should be disabled when collection lacks hex aggregation support', () => {
        setup({}, { aggregations: [] })
        expect(getButton('Hex')).toBeDisabled()
      })

      it('should be enabled when collection supports hex aggregation', () => {
        setup({}, { aggregations: [{ name: 'grid_geohex_frequency' }] })
        expect(getButton('Hex')).not.toBeDisabled()
      })

      it('should be enabled when collection supports centroid hex aggregation', () => {
        setup(
          {},
          { aggregations: [{ name: 'centroid_geohex_grid_frequency' }] }
        )
        expect(getButton('Hex')).not.toBeDisabled()
      })
    })

    describe('Grid button', () => {
      it('should be disabled when collection lacks grid aggregation support', () => {
        setup({}, { aggregations: [] })
        expect(getButton('Grid')).toBeDisabled()
      })

      it('should be enabled when collection supports grid aggregation', () => {
        setup({}, { aggregations: [{ name: 'grid_code_frequency' }] })
        expect(getButton('Grid')).not.toBeDisabled()
      })
    })

    describe('Scene button', () => {
      it('should be disabled when SCENE_TILER_URL is not configured', () => {
        setup({ SCENE_TILER_URL: '' })
        expect(getButton('Scene')).toBeDisabled()
      })

      it('should be disabled when zoom level is too low', () => {
        setup(
          { SCENE_TILER_URL: 'https://titiler.example.com' },
          {},
          { zoomLevel: 3 }
        )
        expect(getButton('Scene')).toBeDisabled()
      })

      it('should be enabled when SCENE_TILER_URL is configured and zoom is sufficient', () => {
        setup({ SCENE_TILER_URL: 'https://titiler.example.com' })
        expect(getButton('Scene')).not.toBeDisabled()
      })
    })

    describe('Mosaic button', () => {
      it('should be disabled when MOSAIC_TILER_URL is not configured', () => {
        setup({ MOSAIC_TILER_URL: '' })
        expect(getButton('Mosaic')).toBeDisabled()
      })

      it('should be disabled when zoom level is too low', () => {
        setup(
          { MOSAIC_TILER_URL: 'https://titiler-mosaic.example.com' },
          {},
          { zoomLevel: 3 }
        )
        expect(getButton('Mosaic')).toBeDisabled()
      })

      it('should be enabled when MOSAIC_TILER_URL is configured and zoom is sufficient', () => {
        setup({ MOSAIC_TILER_URL: 'https://titiler-mosaic.example.com' })
        expect(getButton('Mosaic')).not.toBeDisabled()
      })
    })
  })

  describe('button click handlers', () => {
    it('should dispatch setViewMode("hex") when clicking Hex button', () => {
      setup({}, { aggregations: [{ name: 'grid_geohex_frequency' }] })

      fireEvent.click(getButton('Hex'))

      expect(currentStore.getState().mainSlice.viewMode).toBe('hex')
    })

    it('should dispatch setViewMode("grid-code") when clicking Grid button', () => {
      setup({}, { aggregations: [{ name: 'grid_code_frequency' }] })

      fireEvent.click(getButton('Grid'))

      expect(currentStore.getState().mainSlice.viewMode).toBe('grid-code')
    })

    it('should dispatch setViewMode("scene") when clicking Scene button', () => {
      setup({ SCENE_TILER_URL: 'https://titiler.example.com' })
      act(() => {
        currentStore.dispatch(setViewMode('hex'))
      })

      fireEvent.click(getButton('Scene'))

      expect(currentStore.getState().mainSlice.viewMode).toBe('scene')
    })

    it('should dispatch setViewMode("mosaic") when clicking Mosaic button', () => {
      setup({ MOSAIC_TILER_URL: 'https://titiler-mosaic.example.com' })

      fireEvent.click(getButton('Mosaic'))

      expect(currentStore.getState().mainSlice.viewMode).toBe('mosaic')
    })
  })

  describe('Auto-Zoom checkbox', () => {
    it('should not render Auto-Zoom checkbox when SHOW_ITEM_AUTO_ZOOM is false', () => {
      setup({ SHOW_ITEM_AUTO_ZOOM: false })
      expect(screen.queryByText('Item Auto-Zoom')).not.toBeInTheDocument()
    })

    it('should render Auto-Zoom checkbox when SHOW_ITEM_AUTO_ZOOM is true', () => {
      setup({ SHOW_ITEM_AUTO_ZOOM: true })
      expect(screen.getByText('Item Auto-Zoom')).toBeInTheDocument()
    })

    it('should dispatch setAutoCenterOnItemChanged when checkbox is toggled', () => {
      setup({ SHOW_ITEM_AUTO_ZOOM: true })
      act(() => {
        currentStore.dispatch(setAutoCenterOnItemChanged(false))
      })

      const checkbox = screen.getByRole('checkbox')
      fireEvent.click(checkbox)

      expect(currentStore.getState().mainSlice.autoCenterOnItemChanged).toBe(
        true
      )
    })
  })
})
