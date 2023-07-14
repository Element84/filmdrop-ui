import {
  setapplicationAlertMessage,
  setapplicationAlertSeverity,
  setshowApplicationAlert
} from '../redux/slices/mainSlice'
import { store } from '../redux/store'

export function showApplicationAlert(
  severity,
  message = null,
  duration = null
) {
  message
    ? store.dispatch(setapplicationAlertMessage(message))
    : store.dispatch(setapplicationAlertMessage('System Error'))

  store.dispatch(setapplicationAlertSeverity(severity))
  store.dispatch(setshowApplicationAlert(true))

  duration &&
    setTimeout(() => {
      store.dispatch(setshowApplicationAlert(false))
    }, duration)
}
