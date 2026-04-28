import { store } from '../redux/store'
import { setappConfig } from '../redux/slices/mainSlice'
import { showApplicationAlert } from '../utils/alertHelper'
import {
  normalizeCollectionsConfig,
  applyConfigDefaults,
  autoConfigureCollections,
  autoConfigureRendering
} from '../utils/configHelper'

export async function LoadConfigIntoStateService() {
  const cacheBuster = Date.now()
  const configUrl = `${
    import.meta.env.BASE_URL
  }config/config.json?_cb=${cacheBuster}`

  await fetch(configUrl, {
    cache: 'no-store'
  })
    .then((response) => {
      if (response.ok) {
        return response.json()
      }
      throw new Error()
    })
    .then(async (json) => {
      // Validate config and enforce strict modern format requirements
      let normalizedConfig = normalizeCollectionsConfig(json)

      // Auto-configure collections from STAC API if STAC_API_URL is provided
      if (normalizedConfig.STAC_API_URL) {
        normalizedConfig = await autoConfigureCollections(
          normalizedConfig.STAC_API_URL,
          normalizedConfig
        )
      }

      // Auto-configure rendering based on collection render extension
      normalizedConfig = autoConfigureRendering(normalizedConfig)

      // Apply defaults for optional parameters
      const configWithDefaults = applyConfigDefaults(normalizedConfig)
      store.dispatch(setappConfig(configWithDefaults))
    })
    .catch((error) => {
      const message =
        error?.code === 'LEGACY_CONFIG_NOT_SUPPORTED' ||
        error?.code === 'MIXED_CONFIG_NOT_SUPPORTED' ||
        error?.code === 'INVALID_CONFIG_FORMAT'
          ? error.message
          : 'Error Fetching Config File'
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
