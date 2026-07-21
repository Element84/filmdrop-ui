import React from 'react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { fireEvent, screen } from '@testing-library/react'
import { renderFilmDrop } from '../../testing/renderFilmDrop'
import { createFilmDropStore } from '../../redux/store'
import {
  setSearchResults,
  setSelectedCollection,
  setSearchDateRangeValue
} from '../../redux/slices/mainSlice'
import ExportButton from './ExportButton'

describe('ExportButton', () => {
  let originalCreateObjectURL
  let originalRevokeObjectURL
  let createObjectURLMock
  let revokeObjectURLMock
  let clickMock
  let createdAnchor

  beforeEach(() => {
    createObjectURLMock = vi.fn(() => 'blob:mock-url')
    revokeObjectURLMock = vi.fn()
    originalCreateObjectURL = URL.createObjectURL
    originalRevokeObjectURL = URL.revokeObjectURL
    URL.createObjectURL = createObjectURLMock
    URL.revokeObjectURL = revokeObjectURLMock

    createdAnchor = null
    const realCreateElement = document.createElement.bind(document)
    vi.spyOn(document, 'createElement').mockImplementation((tagName) => {
      const el = realCreateElement(tagName)
      if (tagName.toLowerCase() === 'a') {
        clickMock = vi.fn()
        el.click = clickMock
        createdAnchor = el
      }
      return el
    })
  })

  afterEach(() => {
    URL.createObjectURL = originalCreateObjectURL
    URL.revokeObjectURL = originalRevokeObjectURL
    vi.restoreAllMocks()
  })

  function mount() {
    const store = createFilmDropStore()
    store.dispatch(
      setSearchResults({ type: 'FeatureCollection', features: [] })
    )
    store.dispatch(setSelectedCollection('demo'))
    store.dispatch(
      setSearchDateRangeValue(['2024-01-01T00:00:00Z', '2024-01-31T00:00:00Z'])
    )
    return renderFilmDrop(<ExportButton />, { store })
  }

  it('sets rel="noopener noreferrer" on the temporary anchor', () => {
    mount()
    fireEvent.click(screen.getByRole('button'))
    expect(createdAnchor).not.toBeNull()
    expect(createdAnchor.rel).toBe('noopener noreferrer')
  })

  it('revokes the object URL after triggering download', () => {
    mount()
    fireEvent.click(screen.getByRole('button'))
    expect(createObjectURLMock).toHaveBeenCalledTimes(1)
    expect(clickMock).toHaveBeenCalledTimes(1)
    expect(revokeObjectURLMock).toHaveBeenCalledWith('blob:mock-url')
  })
})
