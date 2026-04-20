import {
  setapplicationAlertMessage,
  setapplicationAlertSeverity,
  setshowApplicationAlert,
  setisAuthErrorAlert
} from '../redux/slices/mainSlice'
import { store } from '../redux/store'

// Module-scope pending alert timeout. Replaced on each call so rapid alerts
// do not race. Cleared on FilmDropRoot unmount via clearPendingAlertTimeout().
let pendingAlertTimeoutId = null

export function clearPendingAlertTimeout() {
  if (pendingAlertTimeoutId !== null) {
    clearTimeout(pendingAlertTimeoutId)
    pendingAlertTimeoutId = null
  }
}

export function showApplicationAlert(
  severity,
  message = null,
  duration = null,
  isAuthError = false
) {
  message
    ? store.dispatch(setapplicationAlertMessage(message))
    : store.dispatch(setapplicationAlertMessage('System Error'))

  store.dispatch(setapplicationAlertSeverity(severity))
  store.dispatch(setisAuthErrorAlert(isAuthError))
  store.dispatch(setshowApplicationAlert(true))

  // Clear previous timeout before starting a new one so successive alerts
  // don't end up dismissing whatever alert is currently on-screen.
  clearPendingAlertTimeout()

  if (duration) {
    pendingAlertTimeoutId = setTimeout(() => {
      pendingAlertTimeoutId = null
      store.dispatch(setshowApplicationAlert(false))
    }, duration)
    return pendingAlertTimeoutId
  }
  return null
}
