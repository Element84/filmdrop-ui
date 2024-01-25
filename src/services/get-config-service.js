import { store } from '../redux/store'
import { setappConfig } from '../redux/slices/mainSlice'
import { showApplicationAlert } from '../utils/alertHelper'

export async function LoadConfigIntoStateService() {
  const cacheBuster = Date.now()
  const configUrl = `${
    import.meta.env.BASE_URL
  }config/config.json?_cb=${cacheBuster}`

  await fetch(configUrl, {
    method: 'GET',
    cache: 'no-store'
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

export async function DoesFaviconExistService() {
  const cacheBuster = Date.now()

  try {
    const response = await fetch(
      `/config/${
        store.getState().mainSlice.appConfig.APP_FAVICON
      }?_cb=${cacheBuster}`,
      {
        method: 'HEAD',
        cache: 'no-store'
      }
    )

    return response.ok
  } catch (error) {
    console.error('Error Fetching Favicon File', error)
    return false
  }
}
