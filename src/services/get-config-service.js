import { store } from '../redux/store'
import { setAppConfig } from '../redux/slices/mainSlice'
import { showApplicationAlert } from '../utils/alertHelper'
import {
  normalizeCollectionsConfig,
  applyConfigDefaults,
  autoConfigureCollections,
  autoConfigureRendering
} from '../utils/configHelper'
import {
  resolveConfigUrl,
  resolveFaviconUrl,
  getCacheBusterSuffix
} from '../utils/configBase'

export async function LoadConfigIntoStateService() {
  const configUrl = `${resolveConfigUrl()}${getCacheBusterSuffix()}`

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
      store.dispatch(setAppConfig(configWithDefaults))
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
  try {
    const response = await fetch(
      `${resolveFaviconUrl(
        store.getState().mainSlice.appConfig.APP_FAVICON
      )}${getCacheBusterSuffix()}`,
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
