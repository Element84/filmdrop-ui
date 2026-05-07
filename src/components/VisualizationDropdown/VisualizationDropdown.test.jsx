import React from 'react'
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Provider } from 'react-redux'
import { store } from '../../redux/store'
import {
  mainSliceReset,
  setAppConfig,
  setSelectedCollection,
  setSelectedVisualization,
  setCurrentPopupResult,
  setShowSceneOverlay
} from '../../redux/slices/mainSlice'
import { mockAppConfig } from '../../testing/shared-mocks'
import VisualizationDropdown from './VisualizationDropdown.jsx'

const { setVizMock, debounceTitilerOverlayMock, clearLayerMock } = vi.hoisted(
  () => ({
    setVizMock: vi.fn(),
    debounceTitilerOverlayMock: vi.fn(),
    clearLayerMock: vi.fn()
  })
)

vi.mock('../../hooks/useUrlNavigate', () => ({
  useUrlNavigate: () => ({
    setViz: setVizMock
  })
}))

vi.mock('../../utils/mapLayers', () => ({
  CLICKED_SCENE_IMAGE_LAYER: 'clickedSceneImageLayer',
  debounceTitilerOverlay: debounceTitilerOverlayMock,
  clearLayer: clearLayerMock
}))

/* eslint-disable react/prop-types -- mock components don't need prop validation */
vi.mock('@mui/material', () => ({
  Select: ({ value, onChange, children, ...rest }) => (
    <select value={value} onChange={onChange} {...rest}>
      {children}
    </select>
  ),
  MenuItem: ({ value, children }) => <option value={value}>{children}</option>,
  OutlinedInput: () => null,
  Checkbox: ({ id, checked, onChange }) => (
    <input id={id} type="checkbox" checked={checked} onChange={onChange} />
  )
}))
/* eslint-enable react/prop-types */

function renderSubject() {
  return render(
    <Provider store={store}>
      <VisualizationDropdown />
    </Provider>
  )
}

describe('VisualizationDropdown', () => {
  beforeEach(() => {
    setVizMock.mockReset()
    debounceTitilerOverlayMock.mockReset()
    clearLayerMock.mockReset()

    store.dispatch(mainSliceReset())
    store.dispatch(
      setAppConfig({
        ...mockAppConfig,
        COLLECTIONS_CONFIG: {
          'demo-collection': {
            visualizations: {
              default: { title: 'True Color', assets: ['visual'] },
              ndvi: { title: 'NDVI', assets: ['nir', 'red'] }
            }
          }
        }
      })
    )
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('renders nothing when the selected collection has no visualizations', () => {
    store.dispatch(
      setAppConfig({
        ...mockAppConfig,
        COLLECTIONS_CONFIG: {}
      })
    )
    store.dispatch(setSelectedCollection('demo-collection'))

    const { container } = renderSubject()

    expect(container.firstChild).toBeNull()
    expect(setVizMock).not.toHaveBeenCalled()
  })

  it('auto-selects the first visualization when none is selected', () => {
    store.dispatch(setSelectedCollection('demo-collection'))
    store.dispatch(setSelectedVisualization(null))

    renderSubject()

    expect(setVizMock).toHaveBeenCalledWith('default')
    expect(screen.getByRole('combobox')).toHaveValue('default')
  })

  it('updates the URL visualization when the selection changes', () => {
    store.dispatch(setSelectedCollection('demo-collection'))
    store.dispatch(setSelectedVisualization('default'))

    renderSubject()

    fireEvent.change(screen.getByRole('combobox'), {
      target: { value: 'ndvi' }
    })

    expect(setVizMock).toHaveBeenCalledWith('ndvi')
  })

  it('toggles the scene overlay and clears map imagery when unchecked', () => {
    const currentPopupResult = { id: 'scene-1' }

    store.dispatch(setSelectedCollection('demo-collection'))
    store.dispatch(setSelectedVisualization('default'))
    store.dispatch(setCurrentPopupResult(currentPopupResult))
    store.dispatch(setShowSceneOverlay(false))

    renderSubject()

    const checkbox = screen.getByRole('checkbox', { name: 'Show on map' })

    fireEvent.click(checkbox)
    expect(store.getState().mainSlice.showSceneOverlay).toBe(true)
    expect(debounceTitilerOverlayMock).toHaveBeenCalledWith(currentPopupResult)

    fireEvent.click(checkbox)
    expect(store.getState().mainSlice.showSceneOverlay).toBe(false)
    expect(clearLayerMock).toHaveBeenCalledWith('clickedSceneImageLayer')
  })
})
