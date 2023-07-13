import { store } from '../redux/store'
import { setappConfig } from '../redux/slices/mainSlice'
import { showApplicationAlert } from '../utils/alertHelper'

export async function LoadConfigIntoStateService() {
  await fetch(`/config/config.json`, {
    method: 'GET'
  })
    .then((response) => {
      if (response.ok) {
        return response.json()
      }
      throw new Error()
    })
    .then((json) => {
      store.dispatch(setappConfig(json))
    })
    .catch((error) => {
      const message = 'Error Fetching Config File'
      // log full error for diagnosing client side errors if needed
      console.error(message, error)
      showApplicationAlert('error', message, null)
    })
}
