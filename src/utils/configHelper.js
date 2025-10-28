import { DEFAULT_APP_NAME } from '../components/defaults'
import { store } from '../redux/store'
import { DoesFaviconExistService } from '../services/get-config-service'
import { setappName, setreferenceLayers } from '../redux/slices/mainSlice'
import { showApplicationAlert } from './alertHelper'

function loadAppTitle() {
  if (!store.getState().mainSlice.appConfig.APP_NAME) {
    document.title = DEFAULT_APP_NAME
    store.dispatch(setappName(DEFAULT_APP_NAME))
    return
  }
  document.title = store.getState().mainSlice.appConfig.APP_NAME
  store.dispatch(setappName(store.getState().mainSlice.appConfig.APP_NAME))
}

async function loadAppFavicon() {
  if (!store.getState().mainSlice.appConfig.APP_FAVICON) {
    return
  }
  const doesFaviconFileExist = await DoesFaviconExistService()
  if (!doesFaviconFileExist) {
    return
  }
  if (
    store
      .getState()
      .mainSlice.appConfig.APP_FAVICON.toLowerCase()
      .endsWith('.png') ||
    store
      .getState()
      .mainSlice.appConfig.APP_FAVICON.toLowerCase()
      .endsWith('.ico')
  ) {
    const faviconFromConfig =
      '/config/' +
      store.getState().mainSlice.appConfig.APP_FAVICON +
      `?_cb=${Date.now()}`
    const newFaviconLink = document.querySelector("link[rel~='icon']")
    newFaviconLink.href = faviconFromConfig
  }
}

async function parseLayerListConfig(config) {
  try {
    if (
      !store.getState().mainSlice.appConfig ||
      !store.getState().mainSlice.appConfig.LAYER_LIST_SERVICES
    ) {
      throw new Error(
        'Invalid configuration format: LAYER_LIST_SERVICES is missing.'
      )
    }
    return store
      .getState()
      .mainSlice.appConfig.LAYER_LIST_SERVICES.flatMap((service) => {
        if (!service.layers || !Array.isArray(service.layers)) {
          throw new Error(
            `Invalid configuration format for service '${service.name}': 'layers' is missing or not an array.`
          )
        }

        return service.layers
          .map((layer) => {
            if (!layer.name) {
              throw new Error(
                `Invalid configuration format for layer in service '${service.name}': 'name' is missing.`
              )
            }

            const validCRS = ['EPSG:4326', 'EPSG:3857']
            const shouldAddLayer = !layer.crs || validCRS.includes(layer.crs)

            if (shouldAddLayer) {
              return {
                combinedLayerName: `${service.name.replace(
                  / /g,
                  '_'
                )}_${layer.name.replace(/ /g, '_')}`,
                layerName: layer.name,
                layerAlias: layer.alias || layer.name,
                visibility: layer.default_visibility || false,
                crs: layer.crs || 'EPSG:3857',
                url: service.url,
                type: service.type
              }
            }

            console.error(
              'Error adding layer: ' +
                `${service.name.replace(/ /g, '_')}_${layer.name.replace(
                  / /g,
                  '_'
                )}` +
                ': unsupported crs'
            )
            return null // Skip adding the layer if error
          })
          .filter((layer) => layer !== null) // Filter out null layers
      })
  } catch (error) {
    console.error('Error loading reference layers', error.message)
    showApplicationAlert('warning', 'Error loading reference layers', 5000)
    return []
  }
}

async function loadReferenceLayers() {
  if (
    !store.getState().mainSlice.appConfig.LAYER_LIST_SERVICES ||
    !store.getState().mainSlice.appConfig.LAYER_LIST_ENABLED
  ) {
    return
  }
  const LayerListFromConfig = await parseLayerListConfig()
  if (LayerListFromConfig.length === 0) {
    return
  }

  store.dispatch(setreferenceLayers(LayerListFromConfig))
}

/**
 * Normalizes config to support both old (separate params) and new (COLLECTIONS_CONFIG) formats
 * @param {Object} config - The application config object
 * @returns {Object} - Normalized config with COLLECTIONS_CONFIG structure
 */
export function normalizeCollectionsConfig(config) {
  if (!config) return config

  // If COLLECTIONS_CONFIG already exists and is not empty, prioritize it
  if (
    config.COLLECTIONS_CONFIG &&
    Object.keys(config.COLLECTIONS_CONFIG).length > 0
  ) {
    // Still check for legacy params and warn if both exist
    const legacyParams = [
      'SCENE_TILER_PARAMS',
      'MOSAIC_TILER_PARAMS',
      'SEARCH_MIN_ZOOM_LEVELS',
      'POPUP_DISPLAY_FIELDS',
      'TILE_LAYER_PARAMS',
      'ENHANCED_DISPLAY_CONFIG'
    ]
    const hasLegacyParams = legacyParams.some((param) => config[param])
    if (hasLegacyParams) {
      console.warn(
        'Both COLLECTIONS_CONFIG and legacy collection parameters detected. ' +
          'COLLECTIONS_CONFIG takes precedence. Consider removing deprecated parameters: ' +
          legacyParams.join(', ')
      )
    }
    return config
  }

  // Build COLLECTIONS_CONFIG from legacy parameters
  const collectionsConfig = {}

  // Get all collection IDs from various sources
  const collectionIds = new Set()

  // Add collections from COLLECTIONS array
  if (config.COLLECTIONS && Array.isArray(config.COLLECTIONS)) {
    config.COLLECTIONS.forEach((id) => collectionIds.add(id))
  }

  if (config.SCENE_TILER_PARAMS) {
    Object.keys(config.SCENE_TILER_PARAMS).forEach((id) =>
      collectionIds.add(id)
    )
  }
  if (config.MOSAIC_TILER_PARAMS) {
    Object.keys(config.MOSAIC_TILER_PARAMS).forEach((id) =>
      collectionIds.add(id)
    )
  }
  if (config.SEARCH_MIN_ZOOM_LEVELS) {
    Object.keys(config.SEARCH_MIN_ZOOM_LEVELS).forEach((id) =>
      collectionIds.add(id)
    )
  }
  if (config.POPUP_DISPLAY_FIELDS) {
    Object.keys(config.POPUP_DISPLAY_FIELDS).forEach((id) =>
      collectionIds.add(id)
    )
  }
  if (config.TILE_LAYER_PARAMS) {
    Object.keys(config.TILE_LAYER_PARAMS).forEach((id) => collectionIds.add(id))
  }
  if (config.ENHANCED_DISPLAY_CONFIG) {
    Object.keys(config.ENHANCED_DISPLAY_CONFIG).forEach((id) =>
      collectionIds.add(id)
    )
  }

  // Build consolidated config for each collection
  collectionIds.forEach((collectionId) => {
    collectionsConfig[collectionId] = {}

    if (config.SCENE_TILER_PARAMS?.[collectionId]) {
      collectionsConfig[collectionId].sceneTilerParams =
        config.SCENE_TILER_PARAMS[collectionId]
    }
    if (config.MOSAIC_TILER_PARAMS?.[collectionId]) {
      collectionsConfig[collectionId].mosaicTilerParams =
        config.MOSAIC_TILER_PARAMS[collectionId]
    }
    if (config.SEARCH_MIN_ZOOM_LEVELS?.[collectionId]) {
      // Legacy: convert old searchMinZoomLevels.high to new sceneMinZoom
      const legacyZoomLevels = config.SEARCH_MIN_ZOOM_LEVELS[collectionId]
      collectionsConfig[collectionId].sceneMinZoom =
        legacyZoomLevels?.high || legacyZoomLevels
    }
    if (config.POPUP_DISPLAY_FIELDS?.[collectionId]) {
      collectionsConfig[collectionId].popupDisplayFields =
        config.POPUP_DISPLAY_FIELDS[collectionId]
    }
    if (config.TILE_LAYER_PARAMS?.[collectionId]) {
      collectionsConfig[collectionId].tileLayerParams =
        config.TILE_LAYER_PARAMS[collectionId]
    }
    if (config.ENHANCED_DISPLAY_CONFIG?.[collectionId]) {
      collectionsConfig[collectionId].enhancedDisplayConfig =
        config.ENHANCED_DISPLAY_CONFIG[collectionId]
    }
  })

  // Add COLLECTIONS_CONFIG to the config
  if (Object.keys(collectionsConfig).length > 0) {
    config.COLLECTIONS_CONFIG = collectionsConfig
  }

  return config
}

/**
 * Gets collection-specific config parameter using new or legacy structure
 * @param {string} collectionId - The collection ID
 * @param {string} paramName - Parameter name ('sceneTilerParams', 'mosaicTilerParams', etc.)
 * @param {Object} config - Optional config object for testing (uses store if not provided)
 * @returns {*} - The parameter value or undefined
 */
export function getCollectionConfig(collectionId, paramName, config = null) {
  const appConfig = config || store.getState().mainSlice.appConfig
  if (!appConfig) return undefined

  // Try new structure first
  if (appConfig.COLLECTIONS_CONFIG?.[collectionId]?.[paramName]) {
    return appConfig.COLLECTIONS_CONFIG[collectionId][paramName]
  }

  // Fall back to legacy structure
  const legacyParamMap = {
    sceneTilerParams: 'SCENE_TILER_PARAMS',
    mosaicTilerParams: 'MOSAIC_TILER_PARAMS',
    sceneMinZoom: 'SEARCH_MIN_ZOOM_LEVELS',
    popupDisplayFields: 'POPUP_DISPLAY_FIELDS',
    tileLayerParams: 'TILE_LAYER_PARAMS',
    enhancedDisplayConfig: 'ENHANCED_DISPLAY_CONFIG'
  }

  const legacyParam = legacyParamMap[paramName]
  if (legacyParam && appConfig[legacyParam]?.[collectionId]) {
    const legacyValue = appConfig[legacyParam][collectionId]
    // Special handling for sceneMinZoom: extract 'high' value from legacy object
    if (paramName === 'sceneMinZoom' && typeof legacyValue === 'object') {
      return legacyValue.high || legacyValue
    }
    return legacyValue
  }

  return undefined
}

export function InitializeAppFromConfig() {
  loadAppTitle()
  loadAppFavicon()
  loadReferenceLayers()
}

// exports for testing purposes
export { loadAppTitle, loadAppFavicon }
