import StacFields from '@radiantearth/stac-fields'

/**
 * Field type detection and metadata discovery
 */

// Bounded LRU caches for field type discovery. Map preserves insertion
// order; we re-insert on read to promote entries and drop the oldest
// entry when size exceeds MAX_CACHE_SIZE. This avoids the previous
// "nuke the whole cache when full" behavior, which caused thrashing on
// long-running sessions browsing many items.
const fieldTypeCache = new Map()
const fieldSpecCache = new Map()
const fieldMetadataCache = new Map()

// Cache size limits to prevent memory leaks
const MAX_CACHE_SIZE = 1000

function lruGet(cache, key) {
  if (!cache.has(key)) return undefined
  const value = cache.get(key)
  // Re-insert to move to most-recently-used position
  cache.delete(key)
  cache.set(key, value)
  return value
}

function lruSet(cache, key, value) {
  if (cache.has(key)) cache.delete(key)
  cache.set(key, value)
  if (cache.size > MAX_CACHE_SIZE) {
    // Evict oldest entry (first key in insertion order)
    const oldestKey = cache.keys().next().value
    if (oldestKey !== undefined) cache.delete(oldestKey)
  }
}

/**
 * Clear all field-discovery caches. Exported for host apps that tear down
 * FilmDrop between mounts and want to reclaim memory.
 */
export function clearFieldCaches() {
  fieldTypeCache.clear()
  fieldSpecCache.clear()
  fieldMetadataCache.clear()
}

/**
 * Discovers field type based on field name and value patterns
 * @param {string} field - The field name
 * @param {any} value - The field value to analyze
 * @returns {string} Field type: 'grid', 'coordinate', 'shape', 'transform', 'processing', 'boolean', 'percentage', or 'standard'
 */
function discoverFieldType(field, value) {
  const fieldLower = field.toLowerCase()
  const valueStr = String(value)

  // Grid systems (MGRS, WRS, UTM)
  if (
    fieldLower.includes('grid') || // Generic grid references
    fieldLower.includes('mgrs') || // Military Grid Reference System
    fieldLower.includes('wrs') || // Worldwide Reference System (Landsat)
    fieldLower.includes('utm') || // Universal Transverse Mercator
    fieldLower.includes('tile') || // Tile identifiers
    fieldLower.includes('zone') || // UTM zones, grid zones
    fieldLower.includes('path') || // WRS path numbers
    fieldLower.includes('row') || // WRS row numbers
    valueStr.includes('MGRS') || // MGRS grid codes in values
    valueStr.includes('WRS') || // WRS identifiers in values
    valueStr.includes('UTM') || // UTM references in values
    valueStr.includes('Path:') || // WRS path notation
    valueStr.includes('Row:') // WRS row notation
  ) {
    return 'grid'
  }

  // Coordinates
  if (
    fieldLower.includes('centroid') || // Geometric center points
    fieldLower.includes('bbox') || // Bounding boxes
    fieldLower.includes('lat') || // Latitude references
    fieldLower.includes('lon') || // Longitude references
    fieldLower.includes('coordinate') || // Generic coordinate fields
    fieldLower.includes('geometry') || // Geometry-related fields
    fieldLower.includes('location') // Location fields
  ) {
    return 'coordinate'
  }

  // Array coordinates (2 or 4 elements)
  if (
    Array.isArray(value) &&
    (value.length === 2 || value.length === 4) &&
    !fieldLower.includes('shape') && // Exclude shape fields
    !fieldLower.includes('size') && // Exclude size fields
    !fieldLower.includes('dimension') // Exclude dimension fields
  ) {
    return 'coordinate'
  }

  // Shapes (dimensions, sizes)
  if (
    fieldLower.includes('shape') ||
    fieldLower.includes('size') ||
    fieldLower.includes('dimension') ||
    fieldLower.includes('width') ||
    fieldLower.includes('height') ||
    fieldLower.includes('pixel') ||
    fieldLower.includes('resolution')
  ) {
    return 'shape'
  }

  // Transforms (matrices, projections)
  if (
    fieldLower.includes('transform') ||
    fieldLower.includes('matrix') ||
    fieldLower.includes('affine') ||
    fieldLower.includes('projection') ||
    fieldLower.includes('epsg') ||
    (Array.isArray(value) && value.length === 6) // 6-element transformation arrays
  ) {
    return 'transform'
  }

  // Processing (algorithms, versions)
  if (
    fieldLower.includes('processing') ||
    fieldLower.includes('software') ||
    fieldLower.includes('algorithm') ||
    fieldLower.includes('workflow') ||
    fieldLower.includes('version') ||
    (typeof value === 'object' && value !== null && value.name) // Named objects
  ) {
    return 'processing'
  }

  // BOOLEAN: Check for True/false values for flags, toggles, presence indicators
  if (typeof value === 'boolean') {
    return 'boolean'
  }

  // Percentages (0-1 range): Cloud cover, quality metrics, coverage ratios
  if (
    fieldLower.includes('percentage') || // Explicit percentage fields
    fieldLower.includes('cover') || // Cloud cover, snow cover, etc.
    (typeof value === 'number' && value >= 0 && value <= 1) // Normalized values (0-1)
  ) {
    return 'percentage'
  }

  // ISO 8601 datetime detection with strict validation
  if (typeof value === 'string') {
    // Match full ISO 8601 format: YYYY-MM-DDTHH:mm:ss[.sss][Z|±HH:mm]
    const iso8601Regex =
      /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?(Z|[+-]\d{2}:\d{2})?$/

    if (iso8601Regex.test(value)) {
      try {
        const date = new Date(value)

        // Validate date is valid and within reasonable range
        const year = date.getFullYear()
        if (!isNaN(date.getTime()) && year >= 1900 && year <= 2100) {
          return 'datetime'
        }
      } catch (e) {
        // Invalid date, continue to standard
      }
    }
  }

  // STANDARD: Default fallback for unrecognized fields
  // Used for general text, numbers, dates, and unknown formats
  return 'standard'
}

/**
 * Get field type with caching
 */
export function getStacFieldType(field, value, item) {
  const cacheKey = `${field}:${typeof value}:${Array.isArray(value) ? value.length : 'scalar'}`
  const cached = lruGet(fieldTypeCache, cacheKey)
  if (cached !== undefined) return cached

  try {
    const fieldType = discoverFieldType(field, value)
    lruSet(fieldTypeCache, cacheKey, fieldType)
    return fieldType
  } catch (error) {
    console.warn('Field type discovery failed for field:', field, error)
    const fallbackType = 'standard'
    lruSet(fieldTypeCache, cacheKey, fallbackType)
    return fallbackType
  }
}

/**
 * Get field specification with caching
 */
export function getFieldSpec(field) {
  const cached = lruGet(fieldSpecCache, field)
  if (cached !== undefined) return cached

  try {
    const spec = StacFields.Registry.getSpecification(field)
    lruSet(fieldSpecCache, field, spec)
    return spec
  } catch (error) {
    const fallbackSpec = {}
    lruSet(fieldSpecCache, field, fallbackSpec)
    return fallbackSpec
  }
}

/**
 * Get field metadata with caching
 */
export function getFieldMetadata(field) {
  const cached = lruGet(fieldMetadataCache, field)
  if (cached !== undefined) return cached

  try {
    const spec = StacFields.Registry.getSpecification(field)
    const tooltipContent =
      spec?.description || spec?.explain || spec?.title || null
    const hasTooltip = !!tooltipContent

    const metadata = {
      hasTooltip,
      tooltipContent,
      tooltipSource: hasTooltip ? 'registry' : null
    }

    lruSet(fieldMetadataCache, field, metadata)
    return metadata
  } catch (error) {
    const fallbackMetadata = {
      hasTooltip: false,
      tooltipContent: null,
      tooltipSource: null
    }

    lruSet(fieldMetadataCache, field, fallbackMetadata)
    return fallbackMetadata
  }
}

/**
 * Get tooltip info for a field
 */
export function getFieldTooltipInfo(field) {
  const metadata = getFieldMetadata(field)
  return metadata.hasTooltip
    ? {
        content: metadata.tooltipContent,
        shouldShow: true,
        source: metadata.tooltipSource
      }
    : null
}

/**
 * Check if field is supported
 */
export function isFieldSupported(field) {
  try {
    const spec = StacFields.Registry.getSpecification(field)
    return !!spec
  } catch (error) {
    return false
  }
}

/**
 * Discover field metadata
 */
export function discoverFieldMetadata(field, collection) {
  try {
    const spec = StacFields.Registry.getSpecification(field)
    return {
      label: spec?.label || getFallbackFieldLabel(field),
      unit: spec?.unit || null,
      description: spec?.description || null,
      type: spec?.type || 'string'
    }
  } catch (error) {
    return {
      label: getFallbackFieldLabel(field),
      unit: null,
      description: null,
      type: 'string'
    }
  }
}

/**
 * Generate fallback label for unknown fields
 */
export function getFallbackFieldLabel(field) {
  return field
    .replace(/^(eo|sar|proj|s2|landsat|sat|view|storage|processing):/, '')
    .replace(/[-_:]/g, ' ')
    .replace(/\b\w/g, (l) => l.toUpperCase())
    .trim()
}
