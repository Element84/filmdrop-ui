import {
  setApplicationAlertMessage,
  setApplicationAlertSeverity,
  setShowApplicationAlert,
  setIsAuthErrorAlert
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
    ? store.dispatch(setApplicationAlertMessage(message))
    : store.dispatch(setApplicationAlertMessage('System Error'))

  store.dispatch(setApplicationAlertSeverity(severity))
  store.dispatch(setIsAuthErrorAlert(isAuthError))
  store.dispatch(setShowApplicationAlert(true))

  // Clear previous timeout before starting a new one so successive alerts
  // don't end up dismissing whatever alert is currently on-screen.
  clearPendingAlertTimeout()

  if (duration) {
    pendingAlertTimeoutId = setTimeout(() => {
      pendingAlertTimeoutId = null
      store.dispatch(setShowApplicationAlert(false))
    }, duration)
    return pendingAlertTimeoutId
  }
  return null
}
