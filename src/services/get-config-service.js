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

export async function prepareAppConfig(rawConfig) {
  let normalizedConfig = normalizeCollectionsConfig(rawConfig)

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
  return applyConfigDefaults(normalizedConfig)
}

/**
 * Load runtime config, normalize it, and store it in Redux.
 * @param {{signal?: AbortSignal, config?: Object}} [options]
 * @returns {Promise<Object>} Final config object or normalized error object.
 */
export async function LoadConfigIntoStateService({ signal, config } = {}) {
  const contextLabel = 'Error Fetching Config File'

  try {
    let rawConfig = config

    if (rawConfig === undefined) {
      const configUrl = `${resolveConfigUrl()}${getCacheBusterSuffix()}`
      const response = await fetch(configUrl, {
        cache: 'no-store',
        signal
      })

      if (!response.ok) {
        throw await normalizeStacErrorResponse(response, contextLabel)
      }

      rawConfig = await response.json()
    }

    const configWithDefaults = await prepareAppConfig(rawConfig)
    // Aborted means a newer load may already be in flight or committed.
    if (signal?.aborted) return configWithDefaults
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
