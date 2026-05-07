import { store } from '../redux/store'
import { setAppConfig } from '../redux/slices/mainSlice'
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
import {
  normalizeStacErrorResponse,
  normalizeStacNetworkError
} from '../utils/stacErrorHelper'

/**
 * Load runtime config, normalize it, and store it in Redux.
 * @param {AbortSignal} [signal] - Optional abort signal.
 * @returns {Promise<Object>} Final config object or normalized error object.
 */
export async function LoadConfigIntoStateService(signal) {
  const configUrl = `${resolveConfigUrl()}${getCacheBusterSuffix()}`
  const contextLabel = 'Error Fetching Config File'

  try {
    const response = await fetch(configUrl, {
      cache: 'no-store',
      signal
    })

    if (!response.ok) {
      throw await normalizeStacErrorResponse(response, contextLabel)
    }

    const json = await response.json()

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
    return configWithDefaults
  } catch (error) {
    const normalizedError =
      error?.error === true
        ? error
        : normalizeStacNetworkError(error, contextLabel)
    console.error(contextLabel, normalizedError)
    return normalizedError
  }
}

/**
 * Check whether configured favicon exists.
 * @param {AbortSignal} [signal] - Optional abort signal.
 * @returns {Promise<boolean>} True when favicon HEAD request succeeds.
 */
export async function DoesFaviconExistService(signal) {
  try {
    const response = await fetch(
      `${resolveFaviconUrl(
        store.getState().mainSlice.appConfig.APP_FAVICON
      )}${getCacheBusterSuffix()}`,
      {
        method: 'HEAD',
        cache: 'no-store',
        signal
      }
    )

    return response.ok
  } catch (error) {
    console.error('Error Fetching Favicon File', error)
    return false
  }
}
