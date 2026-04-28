export const LEGACY_CONFIG_KEYS = [
  'SCENE_TILER_PARAMS',
  'MOSAIC_TILER_PARAMS',
  'SEARCH_MIN_ZOOM_LEVELS',
  'POPUP_DISPLAY_FIELDS',
  'TILE_LAYER_PARAMS',
  'ENHANCED_DISPLAY_CONFIG',
  'DEFAULT_COLLECTION'
]

export const MODERN_CONFIG_KEYS = [
  'STAC_API_URL',
  'PUBLIC_URL',
  'LOGO_URL',
  'LOGO_ALT',
  'DASHBOARD_BTN_URL',
  'ANALYZE_BTN_URL',
  'API_MAX_ITEMS',
  'COLLECTIONS',
  'COLLECTIONS_CONFIG',
  'SCENE_TILER_URL',
  'ACTION_BUTTON',
  'MOSAIC_TILER_URL',
  'MOSAIC_MAX_ITEMS',
  'CONFIG_COLORMAP',
  'BASEMAP',
  'THEME_SWITCHING_ENABLED',
  'CART_ENABLED',
  'BRAND_LOGO',
  'APP_NAME',
  'APP_FAVICON',
  'MAP_ZOOM',
  'MAP_CENTER',
  'MAP_ZOOM_MAX',
  'LAYER_LIST_SERVICES',
  'STAC_LINK_ENABLED',
  'STAC_LINKS_SECTION_ENABLED',
  'STAC_LINKS_EXCLUDE_LIST',
  'SHOW_ITEM_AUTO_ZOOM',
  'FETCH_CREDENTIALS',
  'APP_TOKEN_AUTH_ENABLED',
  'AUTH_URL',
  'SUPPORTS_AGGREGATIONS',
  'EXPORT_ENABLED',
  'STAC_HEADER_COOKIES',
  'RIGHT_SIDEBAR_ENABLED',
  'THEME_DEFAULT',
  'TILER_SETTINGS',
  '_STAC_COLLECTIONS'
]

/**
 * Expected value types for top-level config keys validated by `config:lint`.
 * Keys must match the union of {@link MODERN_CONFIG_KEYS} and {@link LEGACY_CONFIG_KEYS}.
 */
export const TOP_LEVEL_CONFIG_EXPECTED_TYPES = {
  STAC_API_URL: 'string',
  PUBLIC_URL: 'string',
  LOGO_URL: 'string',
  LOGO_ALT: 'string',
  DASHBOARD_BTN_URL: 'string',
  ANALYZE_BTN_URL: 'string',
  API_MAX_ITEMS: 'number',
  COLLECTIONS: 'object',
  COLLECTIONS_CONFIG: 'object',
  SCENE_TILER_URL: 'string',
  ACTION_BUTTON: 'object',
  MOSAIC_TILER_URL: 'string',
  MOSAIC_MAX_ITEMS: 'number',
  CONFIG_COLORMAP: 'string',
  BASEMAP: 'object',
  THEME_SWITCHING_ENABLED: 'boolean',
  CART_ENABLED: 'boolean',
  BRAND_LOGO: 'object',
  APP_NAME: 'string',
  APP_FAVICON: 'string',
  MAP_ZOOM: 'number',
  MAP_CENTER: 'array',
  MAP_ZOOM_MAX: 'number',
  LAYER_LIST_SERVICES: 'array',
  STAC_LINK_ENABLED: 'boolean',
  STAC_LINKS_SECTION_ENABLED: 'boolean',
  STAC_LINKS_EXCLUDE_LIST: 'array',
  SHOW_ITEM_AUTO_ZOOM: 'boolean',
  FETCH_CREDENTIALS: 'string',
  APP_TOKEN_AUTH_ENABLED: 'boolean',
  AUTH_URL: 'string',
  SUPPORTS_AGGREGATIONS: 'boolean',
  EXPORT_ENABLED: 'boolean',
  STAC_HEADER_COOKIES: 'array',
  RIGHT_SIDEBAR_ENABLED: 'boolean',
  THEME_DEFAULT: 'string',
  TILER_SETTINGS: 'object',
  _STAC_COLLECTIONS: 'array',
  SCENE_TILER_PARAMS: 'object',
  MOSAIC_TILER_PARAMS: 'object',
  SEARCH_MIN_ZOOM_LEVELS: 'object',
  POPUP_DISPLAY_FIELDS: 'object',
  TILE_LAYER_PARAMS: 'object',
  ENHANCED_DISPLAY_CONFIG: 'object',
  DEFAULT_COLLECTION: 'string'
}

export class ConfigValidationError extends Error {
  /**
   * @param {string} message
   * @param {'LEGACY_CONFIG_NOT_SUPPORTED' | 'MIXED_CONFIG_NOT_SUPPORTED' | 'INVALID_CONFIG_FORMAT'} code
   */
  constructor(message, code) {
    super(message)
    this.name = 'ConfigValidationError'
    this.code = code
  }
}

const RESERVED_COLLECTION_ID_PREFIXES = ['_comment', '_DEPRECATED_', '_']

export function detectConfigFormat(config) {
  if (!config || typeof config !== 'object') return 'unknown'

  const hasLegacyKeys = LEGACY_CONFIG_KEYS.some((key) => key in config)
  const hasLegacyCollectionsArray = Array.isArray(config.COLLECTIONS)
  const hasCollectionsConfig =
    'COLLECTIONS_CONFIG' in config &&
    typeof config.COLLECTIONS_CONFIG === 'object'

  if (hasCollectionsConfig && (hasLegacyKeys || hasLegacyCollectionsArray)) {
    return 'mixed'
  }
  if (hasCollectionsConfig) return 'new'
  if (hasLegacyKeys || hasLegacyCollectionsArray) return 'legacy'
  return 'unknown'
}

export function getLegacyKeysPresent(config) {
  if (!config || typeof config !== 'object') return []
  return LEGACY_CONFIG_KEYS.filter((key) => key in config)
}

/**
 * Human-readable list of legacy inputs that conflict with COLLECTIONS_CONFIG (mixed format).
 * Includes named legacy keys plus COLLECTIONS when it is a legacy array.
 */
export function getMixedFormatLegacySignals(config) {
  const signals = [...getLegacyKeysPresent(config)]
  if (Array.isArray(config?.COLLECTIONS)) {
    signals.push('COLLECTIONS (legacy array)')
  }
  return signals
}

export function isReservedCollectionId(collectionId) {
  return RESERVED_COLLECTION_ID_PREFIXES.some((prefix) =>
    String(collectionId).startsWith(prefix)
  )
}

function addCollectionIdsFromObject(collectionIds, source) {
  if (!source || typeof source !== 'object' || Array.isArray(source)) {
    return
  }
  Object.keys(source).forEach((collectionId) => {
    if (!isReservedCollectionId(collectionId)) {
      collectionIds.add(collectionId)
    }
  })
}

export function migrateLegacyConfig(config) {
  const migrated = structuredClone(config)
  const format = detectConfigFormat(migrated)

  if (format === 'new') {
    return { migratedConfig: migrated, removedKeys: [], format }
  }

  if (format === 'mixed') {
    const signals = getMixedFormatLegacySignals(migrated)
    throw new ConfigValidationError(
      `Mixed configuration format is not supported for migration. Resolve mixed keys before migrating. Conflicting legacy inputs: ${signals.join(
        ', '
      )}`,
      'MIXED_CONFIG_NOT_SUPPORTED'
    )
  }

  if (format === 'unknown') {
    throw new ConfigValidationError(
      'Unknown configuration format. Expected legacy keys or COLLECTIONS_CONFIG.',
      'INVALID_CONFIG_FORMAT'
    )
  }

  const collectionIds = new Set()
  addCollectionIdsFromObject(collectionIds, migrated.SCENE_TILER_PARAMS)
  addCollectionIdsFromObject(collectionIds, migrated.MOSAIC_TILER_PARAMS)
  addCollectionIdsFromObject(collectionIds, migrated.SEARCH_MIN_ZOOM_LEVELS)
  addCollectionIdsFromObject(collectionIds, migrated.POPUP_DISPLAY_FIELDS)
  addCollectionIdsFromObject(collectionIds, migrated.TILE_LAYER_PARAMS)
  addCollectionIdsFromObject(collectionIds, migrated.ENHANCED_DISPLAY_CONFIG)

  const collectionsConfig = {}
  for (const collectionId of [...collectionIds].sort()) {
    const nextConfig = {}

    if (migrated.SCENE_TILER_PARAMS?.[collectionId]) {
      nextConfig.visualizations = {
        default: migrated.SCENE_TILER_PARAMS[collectionId]
      }
    }
    if (migrated.MOSAIC_TILER_PARAMS?.[collectionId]) {
      nextConfig.mosaicTilerParams = migrated.MOSAIC_TILER_PARAMS[collectionId]
    }
    if (migrated.SEARCH_MIN_ZOOM_LEVELS?.[collectionId] !== undefined) {
      const zoomConfig = migrated.SEARCH_MIN_ZOOM_LEVELS[collectionId]
      nextConfig.sceneMinZoom =
        typeof zoomConfig === 'number' ? zoomConfig : zoomConfig?.high
    }
    if (migrated.POPUP_DISPLAY_FIELDS?.[collectionId]) {
      nextConfig.popupDisplayFields =
        migrated.POPUP_DISPLAY_FIELDS[collectionId]
    }
    if (migrated.TILE_LAYER_PARAMS?.[collectionId]) {
      nextConfig.tileLayerParams = migrated.TILE_LAYER_PARAMS[collectionId]
    }
    if (migrated.ENHANCED_DISPLAY_CONFIG?.[collectionId]) {
      nextConfig.enhancedDisplayConfig =
        migrated.ENHANCED_DISPLAY_CONFIG[collectionId]
    }

    if (Object.keys(nextConfig).length > 0) {
      collectionsConfig[collectionId] = nextConfig
    }
  }

  if (Object.keys(collectionsConfig).length > 0) {
    migrated.COLLECTIONS_CONFIG = collectionsConfig
  }

  if (Array.isArray(migrated.COLLECTIONS)) {
    migrated.COLLECTIONS = { include: migrated.COLLECTIONS }
  }
  if (typeof migrated.DEFAULT_COLLECTION === 'string') {
    migrated.COLLECTIONS = migrated.COLLECTIONS || {}
    if (!migrated.COLLECTIONS.default) {
      migrated.COLLECTIONS.default = migrated.DEFAULT_COLLECTION
    }
  }

  const removedKeys = []
  LEGACY_CONFIG_KEYS.forEach((legacyKey) => {
    if (legacyKey in migrated) {
      delete migrated[legacyKey]
      removedKeys.push(legacyKey)
    }
  })

  return { migratedConfig: migrated, removedKeys, format }
}
