import { vi } from 'vitest'
import { setapplicationAlertMessage } from '../redux/slices/mainSlice'
import { store } from '../redux/store'
import { showApplicationAlert } from './alertHelper'

describe('AlertHelper', () => {
  describe('showApplicationAlert', () => {
    it('should set default Alert message if no message passed', () => {
      store.dispatch(setapplicationAlertMessage('test error'))
      expect(store.getState().mainSlice.applicationAlertMessage).toBe(
        'test error'
      )
      showApplicationAlert('error', null)
      expect(store.getState().mainSlice.applicationAlertMessage).toBe(
        'System Error'
      )
    })
    it('should set Alert message in state if message param passed', () => {
      showApplicationAlert('error', 'this is a user message')
      expect(store.getState().mainSlice.applicationAlertMessage).toBe(
        'this is a user message'
      )
    })
    it('should set ShowApplicationAlert in state to false if duration param passed and specified duration has finished', async () => {
      vi.useFakeTimers()
      const durationParam = 5000
      showApplicationAlert('error', null, durationParam)
      expect(store.getState().mainSlice.showApplicationAlert).toBeTruthy()
      vi.runAllTimers()
      expect(store.getState().mainSlice.showApplicationAlert).toBeFalsy()
    })
    it('should set ApplicationAlertSeverity in state to match input param', () => {
      showApplicationAlert('success', 'this is a user message')
      expect(store.getState().mainSlice.applicationAlertSeverity).toBe(
        'success'
      )
    })
  })
})
