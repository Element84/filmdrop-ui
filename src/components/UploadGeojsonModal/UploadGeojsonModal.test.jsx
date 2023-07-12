import React from 'react'
import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import UploadGeojsonModal from './UploadGeojsonModal'
import { Provider } from 'react-redux'
import { store } from '../../redux/store'
import { setshowUploadGeojsonModal } from '../../redux/slices/mainSlice'
import * as alertHelper from '../../utils/alertHelper'
import * as mapHelper from '../../utils/mapHelper'

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
      store.dispatch(setshowUploadGeojsonModal(true))
      setup()
      const cancelButton = screen.getByRole('button', { name: /cancel/i })
      await user.click(cancelButton)
      expect(store.getState().mainSlice.showUploadGeojsonModal).toBeFalsy()
    })
  })
  describe('when upload button is clicked', () => {
    beforeEach(() => {
      vi.mock('../../utils/alertHelper')
      vi.mock('../../utils/mapHelper')
    })
    afterEach(() => {
      vi.resetAllMocks()
    })
    it('should show error if json is not valid and not close modal', async () => {
      const spyshowApplicationAlert = vi.spyOn(
        alertHelper,
        'showApplicationAlert'
      )
      store.dispatch(setshowUploadGeojsonModal(true))
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
        'error',
        'ERROR: JSON format invalid',
        5000
      )
      expect(store.getState().mainSlice.showUploadGeojsonModal).toBeTruthy()
    })
    it('should show error and not close modal if parseGeomUpload throws an error', async () => {
      const spyshowApplicationAlert = vi.spyOn(
        alertHelper,
        'showApplicationAlert'
      )
      const spyaddUploadedGeojsonToMap = vi.spyOn(
        mapHelper,
        'addUploadedGeojsonToMap'
      )
      mapHelper.parseGeomUpload.mockRejectedValueOnce(new Error('Parse error'))

      store.dispatch(setshowUploadGeojsonModal(true))
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
        'error',
        'ERROR: Parse error',
        5000
      )
      expect(spyaddUploadedGeojsonToMap).not.toHaveBeenCalled()
      expect(store.getState().mainSlice.showUploadGeojsonModal).toBeTruthy()
    })
    it('should call addUploadedGeojsonToMap and close modal if parseGeomUpload does not error', async () => {
      const spyshowApplicationAlert = vi.spyOn(
        alertHelper,
        'showApplicationAlert'
      )
      const spyaddUploadedGeojsonToMap = vi.spyOn(
        mapHelper,
        'addUploadedGeojsonToMap'
      )
      mapHelper.parseGeomUpload.mockResolvedValueOnce('parsed geojson')

      store.dispatch(setshowUploadGeojsonModal(true))
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
      expect(store.getState().mainSlice.showUploadGeojsonModal).toBeFalsy()
    })
  })
})
