import React from 'react'
import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import UploadGeojsonModal from './UploadGeojsonModal'
import { Provider } from 'react-redux'
import { store } from '../../redux/store'
import {
  setSearchGeojsonBoundary,
  setShowUploadGeojsonModal
} from '../../redux/slices/mainSlice'
import * as alertHelper from '../../utils/alertHelper'
import * as mapInteraction from '../../utils/mapInteraction'
import * as mapLayers from '../../utils/mapLayers'
import * as searchHelper from '../../utils/searchHelper'

vi.mock('../../utils/alertHelper')
vi.mock('../../utils/mapInteraction', () => ({
  addUploadedGeojsonToMap: vi.fn(),
  parseGeomUpload: vi.fn()
}))
vi.mock('../../utils/mapLayers', () => ({
  clearLayer: vi.fn()
}))
vi.mock('../../utils/searchHelper')

describe('UploadGeojsonModal', () => {
  const user = userEvent.setup()

  const setup = () =>
    render(
      <Provider store={store}>
        <UploadGeojsonModal />
      </Provider>
    )

  describe('when cancel button is clicked', () => {
    it('should set showUploadGeojsonModal to be false in state', async () => {
      store.dispatch(setShowUploadGeojsonModal(true))
      setup()
      const cancelButton = screen.getByRole('button', { name: /cancel/i })
      await user.click(cancelButton)
      expect(store.getState().mainSlice.showUploadGeojsonModal).toBeFalsy()
    })
  })
  describe('when upload button is clicked', () => {
    afterEach(() => {
      vi.resetAllMocks()
    })
    it('should show warning if json is not valid and not close modal', async () => {
      const spyshowApplicationAlert = vi.spyOn(
        alertHelper,
        'showApplicationAlert'
      )
      store.dispatch(setShowUploadGeojsonModal(true))
      setup()
      const json = '{ "invalid json"'
      const file = new File([json], 'test.geojson', {
        type: 'application/json'
      })
      const input = screen.getByTestId('testGeojsonFileUploadInput')
      await waitFor(async () =>
        fireEvent.change(input, { target: { files: [file] } })
      )
      const cancelButton = screen.getByRole('button', { name: /add/i })
      await user.click(cancelButton)
      expect(spyshowApplicationAlert).toHaveBeenCalledWith(
        'warning',
        'ERROR: JSON format invalid',
        5000
      )
      expect(store.getState().mainSlice.showUploadGeojsonModal).toBeTruthy()
    })
    it('should show warning and not close modal if parseGeomUpload throws an warning', async () => {
      const spyshowApplicationAlert = vi.spyOn(
        alertHelper,
        'showApplicationAlert'
      )
      const spyaddUploadedGeojsonToMap = vi.spyOn(
        mapInteraction,
        'addUploadedGeojsonToMap'
      )
      mapInteraction.parseGeomUpload.mockRejectedValueOnce(
        new Error('Parse error')
      )

      store.dispatch(setShowUploadGeojsonModal(true))
      setup()
      const geojson = JSON.stringify({
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [0, 0]
        },
        properties: {
          name: 'My Point'
        }
      })
      const file = new File([geojson], 'test.geojson', {
        type: 'application/json'
      })
      const input = screen.getByTestId('testGeojsonFileUploadInput')
      await waitFor(async () =>
        fireEvent.change(input, { target: { files: [file] } })
      )
      const cancelButton = screen.getByRole('button', { name: /add/i })
      await user.click(cancelButton)
      expect(spyshowApplicationAlert).toHaveBeenCalledWith(
        'warning',
        'ERROR: Parse error',
        5000
      )
      expect(spyaddUploadedGeojsonToMap).not.toHaveBeenCalled()
      expect(store.getState().mainSlice.showUploadGeojsonModal).toBeTruthy()
    })
    it('should call addUploadedGeojsonToMap and close modal if parseGeomUpload and newSearch do not error', async () => {
      const spyshowApplicationAlert = vi.spyOn(
        alertHelper,
        'showApplicationAlert'
      )
      const spyaddUploadedGeojsonToMap = vi.spyOn(
        mapInteraction,
        'addUploadedGeojsonToMap'
      )
      mapInteraction.parseGeomUpload.mockResolvedValueOnce('parsed geojson')
      vi.spyOn(searchHelper, 'validateUploadedGeometry').mockResolvedValueOnce(
        undefined
      )
      vi.spyOn(searchHelper, 'newSearch').mockResolvedValueOnce(undefined)

      store.dispatch(setShowUploadGeojsonModal(true))
      setup()
      const geojson = JSON.stringify({
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [0, 0]
        },
        properties: {
          name: 'My Point'
        }
      })
      const file = new File([geojson], 'test.geojson', {
        type: 'application/json'
      })
      const input = screen.getByTestId('testGeojsonFileUploadInput')
      await waitFor(async () =>
        fireEvent.change(input, { target: { files: [file] } })
      )
      const cancelButton = screen.getByRole('button', { name: /add/i })
      await user.click(cancelButton)
      expect(spyshowApplicationAlert).not.toHaveBeenCalled()
      expect(spyaddUploadedGeojsonToMap).toHaveBeenCalledWith('parsed geojson')
      expect(searchHelper.newSearch).toHaveBeenCalledWith(
        expect.objectContaining({ signal: expect.any(AbortSignal) })
      )
      expect(store.getState().mainSlice.showUploadGeojsonModal).toBeFalsy()
    })

    it('clears AOI and draw layer when newSearch returns structured error', async () => {
      const spyClearLayer = vi.spyOn(mapLayers, 'clearLayer')
      mapInteraction.parseGeomUpload.mockResolvedValueOnce('parsed geojson')
      vi.spyOn(searchHelper, 'validateUploadedGeometry').mockResolvedValueOnce(
        undefined
      )
      vi.spyOn(searchHelper, 'newSearch').mockResolvedValueOnce({
        error: true,
        summary: 'Error Fetching Search Results',
        code: 'BadRequest',
        details: 'fail'
      })
      mapInteraction.addUploadedGeojsonToMap.mockImplementationOnce(() => {
        store.dispatch(
          setSearchGeojsonBoundary({
            type: 'Feature',
            geometry: { type: 'Point', coordinates: [2, 2] },
            properties: {}
          })
        )
      })

      store.dispatch(setShowUploadGeojsonModal(true))
      setup()

      const geojson = JSON.stringify({
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [0, 0]
        },
        properties: {
          name: 'My Point'
        }
      })

      const file = new File([geojson], 'test.geojson', {
        type: 'application/json'
      })
      const input = screen.getByTestId('testGeojsonFileUploadInput')
      await waitFor(async () =>
        fireEvent.change(input, { target: { files: [file] } })
      )

      const addButton = screen.getByRole('button', { name: /add/i })
      await user.click(addButton)

      expect(store.getState().mainSlice.searchGeojsonBoundary).toBeNull()
      expect(spyClearLayer).toHaveBeenCalledWith('drawBoundsLayer')
      expect(
        screen.getByText('Error Fetching Search Results')
      ).toBeInTheDocument()
      expect(store.getState().mainSlice.showUploadGeojsonModal).toBeTruthy()
    })

    it('should show inline STAC error and keep modal open when upload validation returns error object', async () => {
      mapInteraction.parseGeomUpload.mockResolvedValueOnce('parsed geojson')
      vi.spyOn(searchHelper, 'validateUploadedGeometry').mockResolvedValueOnce({
        error: true,
        code: 'BadRequest',
        summary: 'Unable to search the uploaded area',
        details: 'geo coordinates must be numbers'
      })

      store.dispatch(setShowUploadGeojsonModal(true))
      setup()

      const geojson = JSON.stringify({
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [0, 0]
        },
        properties: {
          name: 'My Point'
        }
      })

      const file = new File([geojson], 'test.geojson', {
        type: 'application/json'
      })
      const input = screen.getByTestId('testGeojsonFileUploadInput')
      await waitFor(async () =>
        fireEvent.change(input, { target: { files: [file] } })
      )

      const addButton = screen.getByRole('button', { name: /add/i })
      await user.click(addButton)

      expect(
        screen.getByText('Unable to search the uploaded area')
      ).toBeInTheDocument()
      expect(
        screen.getByText('BadRequest: geo coordinates must be numbers')
      ).toBeInTheDocument()
      expect(screen.getByTestId('testUploadGeojsonErrorDetails')).toHaveClass(
        'uploadGeojsonModalErrorDetails'
      )
      expect(mapInteraction.addUploadedGeojsonToMap).not.toHaveBeenCalled()
      expect(store.getState().mainSlice.showUploadGeojsonModal).toBeTruthy()
    })

    it('keeps error summary visible and renders long details in dedicated container', async () => {
      mapInteraction.parseGeomUpload.mockResolvedValueOnce('parsed geojson')
      const longDetails = `very long server message ${'x'.repeat(500)}`
      vi.spyOn(searchHelper, 'validateUploadedGeometry').mockResolvedValueOnce({
        error: true,
        code: 'BadRequest',
        summary: 'Unable to search the uploaded area',
        details: longDetails
      })

      store.dispatch(setShowUploadGeojsonModal(true))
      setup()

      const geojson = JSON.stringify({
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [0, 0]
        },
        properties: {
          name: 'My Point'
        }
      })

      const file = new File([geojson], 'test.geojson', {
        type: 'application/json'
      })
      const input = screen.getByTestId('testGeojsonFileUploadInput')
      await waitFor(async () =>
        fireEvent.change(input, { target: { files: [file] } })
      )

      const addButton = screen.getByRole('button', { name: /add/i })
      await user.click(addButton)

      expect(
        screen.getByText('Unable to search the uploaded area')
      ).toBeInTheDocument()

      const detailsContainer = screen.getByTestId(
        'testUploadGeojsonErrorDetails'
      )
      expect(detailsContainer).toHaveClass('uploadGeojsonModalErrorDetails')
      expect(detailsContainer).toHaveTextContent(`BadRequest: ${longDetails}`)
    })

    it('clears inline STAC errors when a new (still-accepted) file drop fails validation', async () => {
      mapInteraction.parseGeomUpload.mockResolvedValueOnce('parsed geojson')
      vi.spyOn(searchHelper, 'validateUploadedGeometry').mockResolvedValueOnce({
        error: true,
        code: 'BadRequest',
        summary: 'Unable to search the uploaded area',
        details: 'geo coordinates must be numbers'
      })

      store.dispatch(setShowUploadGeojsonModal(true))
      setup()

      const geojson = JSON.stringify({
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [0, 0]
        },
        properties: {
          name: 'My Point'
        }
      })

      const validFile = new File([geojson], 'test.geojson', {
        type: 'application/json'
      })
      const input = screen.getByTestId('testGeojsonFileUploadInput')

      await waitFor(async () =>
        fireEvent.change(input, { target: { files: [validFile] } })
      )

      const addButton = screen.getByRole('button', { name: /add/i })
      await user.click(addButton)

      expect(
        screen.getByText('Unable to search the uploaded area')
      ).toBeInTheDocument()

      const bigString = 'a'.repeat(100001)
      const bigFile = new File([bigString], 'test.geojson', {
        type: 'application/json'
      })

      await waitFor(async () =>
        fireEvent.change(input, { target: { files: [bigFile] } })
      )

      expect(
        screen.queryByText('Unable to search the uploaded area')
      ).not.toBeInTheDocument()
    })

    it('only calls newSearch once when Add is clicked twice quickly', async () => {
      let resolveSearch
      const searchPromise = new Promise((resolve) => {
        resolveSearch = resolve
      })

      mapInteraction.parseGeomUpload.mockResolvedValueOnce('parsed geojson')
      vi.spyOn(searchHelper, 'validateUploadedGeometry').mockResolvedValueOnce(
        undefined
      )
      vi.spyOn(searchHelper, 'newSearch').mockReturnValue(searchPromise)

      store.dispatch(setShowUploadGeojsonModal(true))
      setup()

      const geojson = JSON.stringify({
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [0, 0]
        },
        properties: {
          name: 'My Point'
        }
      })

      const file = new File([geojson], 'test.geojson', {
        type: 'application/json'
      })
      const input = screen.getByTestId('testGeojsonFileUploadInput')

      await waitFor(async () =>
        fireEvent.change(input, { target: { files: [file] } })
      )

      const addButton = screen.getByRole('button', { name: /add/i })

      await user.click(addButton)
      await user.click(addButton)

      expect(searchHelper.newSearch).toHaveBeenCalledTimes(1)

      resolveSearch(undefined)
      await waitFor(() =>
        expect(store.getState().mainSlice.showUploadGeojsonModal).toBeFalsy()
      )
    })

    it('keeps Cancel enabled while upload is submitting', async () => {
      let resolveSearch
      const searchPromise = new Promise((resolve) => {
        resolveSearch = resolve
      })

      mapInteraction.parseGeomUpload.mockResolvedValueOnce('parsed geojson')
      vi.spyOn(searchHelper, 'validateUploadedGeometry').mockResolvedValueOnce(
        undefined
      )
      vi.spyOn(searchHelper, 'newSearch').mockReturnValue(searchPromise)

      store.dispatch(setShowUploadGeojsonModal(true))
      setup()

      const geojson = JSON.stringify({
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [0, 0]
        },
        properties: {
          name: 'My Point'
        }
      })

      const file = new File([geojson], 'test.geojson', {
        type: 'application/json'
      })
      const input = screen.getByTestId('testGeojsonFileUploadInput')
      await waitFor(async () =>
        fireEvent.change(input, { target: { files: [file] } })
      )

      const addButton = screen.getByRole('button', { name: /add/i })
      await user.click(addButton)

      const cancelButton = screen.getByRole('button', { name: /cancel/i })
      expect(cancelButton).not.toBeDisabled()
      await user.click(cancelButton)
      expect(store.getState().mainSlice.showUploadGeojsonModal).toBeFalsy()

      resolveSearch(undefined)
    })

    it('clears upload AOI state when cancel is clicked', async () => {
      const spyClearLayer = vi.spyOn(mapLayers, 'clearLayer')
      store.dispatch(
        setSearchGeojsonBoundary({
          type: 'Feature',
          geometry: { type: 'Point', coordinates: [0, 0] },
          properties: {}
        })
      )
      store.dispatch(setShowUploadGeojsonModal(true))
      setup()

      const cancelButton = screen.getByRole('button', { name: /cancel/i })
      await user.click(cancelButton)

      expect(store.getState().mainSlice.searchGeojsonBoundary).toBeNull()
      expect(spyClearLayer).toHaveBeenCalledWith('drawBoundsLayer')
      expect(store.getState().mainSlice.showUploadGeojsonModal).toBeFalsy()
    })
  })

  describe('dialog semantics', () => {
    it('exposes role=dialog with aria-modal and aria-labelledby pointing at title', () => {
      store.dispatch(setShowUploadGeojsonModal(true))
      setup()
      const dialog = screen.getByRole('dialog')
      expect(dialog).toHaveAttribute('aria-modal', 'true')
      const labelId = dialog.getAttribute('aria-labelledby')
      expect(labelId).toBeTruthy()
      expect(document.getElementById(labelId)).toHaveTextContent(
        'Upload Geojson File'
      )
    })

    it('closes when Escape is pressed inside the dialog', () => {
      store.dispatch(setShowUploadGeojsonModal(true))
      setup()
      fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape' })
      expect(store.getState().mainSlice.showUploadGeojsonModal).toBeFalsy()
    })

    it('closes when the backdrop is clicked', () => {
      store.dispatch(setShowUploadGeojsonModal(true))
      setup()
      const backdrop = screen.getByTestId('testUploadGeojsonModal')
      fireEvent.click(backdrop)
      expect(store.getState().mainSlice.showUploadGeojsonModal).toBeFalsy()
    })

    it('does not close when the dialog content is clicked', () => {
      store.dispatch(setShowUploadGeojsonModal(true))
      setup()
      fireEvent.click(screen.getByRole('dialog'))
      expect(store.getState().mainSlice.showUploadGeojsonModal).toBeTruthy()
    })

    it('returns focus to the previously focused element on unmount', () => {
      store.dispatch(setShowUploadGeojsonModal(true))
      const trigger = document.createElement('button')
      trigger.textContent = 'open upload'
      document.body.appendChild(trigger)
      trigger.focus()
      expect(document.activeElement).toBe(trigger)
      const { unmount } = setup()
      expect(document.activeElement).toBe(screen.getByRole('dialog'))
      unmount()
      expect(document.activeElement).toBe(trigger)
      trigger.remove()
    })
  })
})
