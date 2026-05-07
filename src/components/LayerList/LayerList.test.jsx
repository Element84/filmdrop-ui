import React from 'react'
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Provider } from 'react-redux'
import { createFilmDropStore } from '../../redux/store'
import { setReferenceLayers } from '../../redux/slices/mainSlice'
import LayerList from './LayerList.jsx'

const { toggleReferenceLayerVisibilityMock } = vi.hoisted(() => ({
  toggleReferenceLayerVisibilityMock: vi.fn()
}))

vi.mock('../../utils/mapInteraction', () => ({
  toggleReferenceLayerVisibility: toggleReferenceLayerVisibilityMock
}))

function renderSubject(referenceLayers) {
  const store = createFilmDropStore()
  store.dispatch(setReferenceLayers(referenceLayers))

  const view = render(
    <Provider store={store}>
      <LayerList />
    </Provider>
  )

  return { ...view, store }
}

describe('LayerList', () => {
  beforeEach(() => {
    toggleReferenceLayerVisibilityMock.mockReset()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('renders configured reference layers', () => {
    renderSubject([
      {
        combinedLayerName: 'service_roads',
        layerAlias: 'Roads',
        visibility: true
      },
      {
        combinedLayerName: 'service_buildings',
        layerAlias: 'Buildings',
        visibility: false
      }
    ])

    expect(screen.getByText('Reference Layers')).toBeInTheDocument()
    expect(screen.getByLabelText('Roads')).toBeChecked()
    expect(screen.getByLabelText('Buildings')).not.toBeChecked()
  })

  it('toggles the clicked layer and leaves other layers unchanged', () => {
    const { store } = renderSubject([
      {
        combinedLayerName: 'service_roads',
        layerAlias: 'Roads',
        visibility: true
      },
      {
        combinedLayerName: 'service_buildings',
        layerAlias: 'Buildings',
        visibility: false
      }
    ])

    fireEvent.click(screen.getByLabelText('Buildings'))

    expect(store.getState().mainSlice.referenceLayers).toEqual([
      {
        combinedLayerName: 'service_roads',
        layerAlias: 'Roads',
        visibility: true
      },
      {
        combinedLayerName: 'service_buildings',
        layerAlias: 'Buildings',
        visibility: true
      }
    ])
    expect(toggleReferenceLayerVisibilityMock).toHaveBeenCalledWith(
      'service_buildings'
    )
  })
})
