import StacFields from '@radiantearth/stac-fields'
import { getStacFieldType } from './fieldDiscovery.js'
import { sanitizeFieldValue, validateFieldSecurity } from './securityHelper.js'

/**
 * Field value formatting and HTML generation
 */

/**
 * Formats STAC field with HTML
 * @param {string} field - Field name
 * @param {any} value - Field value
 * @param {object} item - STAC item
 * @returns {string} Formatted HTML
 */
export function formatStacFieldEnhanced(field, value, item) {
  if (!item?.properties) {
    return formatStacField(field, value, item)
  }

  // SECURITY STEP: Validate input but preserve original types for processing
  const securityValidation = validateFieldSecurity(field, value)
  const sanitizedField = securityValidation.sanitizedField

  // Log security warnings in development (only for actual security issues)
  if (
    import.meta.env?.DEV &&
    securityValidation.warnings.length > 0 &&
    securityValidation.warnings.some((w) => w.includes('dangerous HTML'))
  ) {
    console.warn(
      'Security warnings for field:',
      sanitizedField,
      securityValidation.warnings
    )
  }

  // Step 1: Discover field type automatically (using original values for type detection)
  const fieldType = getStacFieldType(field, value, item)

  // Step 2: Extract components using universal extractor (using original values)
  const components = extractFieldComponents(field, value, item, fieldType)

  // Step 3: Generate HTML using universal formatter (sanitization happens in HTML generation)
  if (components && components.length > 0) {
    return generateFieldHtml(fieldType, components, sanitizedField)
  }

  // Fallback to standard formatting (with sanitization)
  return formatStacField(sanitizedField, value, item)
}

/**
 * Extract components from STAC field
 * @param {string} field - Field name
 * @param {any} value - Field value
 * @param {Object} item - STAC item
 * @param {string} fieldType - Field type
 * @returns {Array} Component objects
 */
function extractFieldComponents(field, value, item, fieldType) {
  switch (fieldType) {
    case 'grid':
      return extractGridComponents(field, value, item)
    case 'coordinate':
      return extractCoordinateComponents(field, value)
    case 'shape':
      return extractShapeComponents(field, value)
    case 'transform':
      return extractTransformComponents(field, value)
    case 'processing':
      return extractProcessingComponents(field, value)
    case 'boolean':
      return extractBooleanComponents(field, value)
    case 'percentage':
      return extractPercentageComponents(field, value)
    case 'datetime':
      return [{ value }]
    default:
      return null
  }
}

/**
 * Extract grid components
 * @param {string} field - Field name
 * @param {any} value - Field value
 * @param {Object} item - STAC item
 * @returns {Array} Grid component objects
 */
function extractGridComponents(field, value, item) {
  const components = []

  // STEP 1: PROPERTY SCANNING - Look for grid-related properties in the item
  const propertyComponents = extractGridComponentsFromProperties(
    item.properties
  )
  components.push(...propertyComponents)

  // STEP 2: VALUE PARSING - If no components found, try to parse the value itself
  if (components.length === 0 && typeof value === 'string') {
    const parsed = parseGridValue(value)
    if (parsed) {
      components.push(...parsed)
    }
  }

  return components
}

/**
 * Extract grid components from STAC item properties
 * @param {Object} properties - STAC item properties
 * @returns {Array} Array of grid component objects
 */
function extractGridComponentsFromProperties(properties) {
  const components = []
  const gridPropertyPatterns = [
    'utm_zone',
    'latitude_band',
    'grid_square',
    'wrs_type',
    'wrs_path',
    'wrs_row',
    'tile',
    'zone',
    'grid:code'
  ]

  Object.entries(properties).forEach(([propName, propValue]) => {
    if (isGridProperty(propName, gridPropertyPatterns)) {
      const component = createGridComponent(propName, propValue)
      if (component) {
        components.push(component)
      }
    }
  })

  return components
}

/**
 * Check if a property name matches grid property patterns
 * @param {string} propName - Property name to check
 * @param {Array} patterns - Array of grid property patterns
 * @returns {boolean} True if property matches grid patterns
 */
function isGridProperty(propName, patterns) {
  const propLower = propName.toLowerCase()
  return patterns.some(
    (pattern) => propLower.includes(pattern) || propLower === pattern
  )
}

/**
 * Create a grid component object from property name and value
 * @param {string} propName - Property name
 * @param {any} propValue - Property value
 * @returns {Object|null} Grid component object or null if invalid
 */
function createGridComponent(propName, propValue) {
  // SECURITY: Sanitize property name and value
  const sanitizedPropName = sanitizeFieldValue(propName, false)
  const sanitizedPropValue = sanitizeFieldValue(propValue, false)

  // Generate human-readable label from sanitized property name
  const label = generateDynamicLabel(sanitizedPropName)
  // Infer which grid system this belongs to (using sanitized values)
  const system = inferGridSystem(sanitizedPropName, sanitizedPropValue)

  return {
    label,
    value: sanitizedPropValue,
    system,
    source: sanitizedPropName
  }
}

/**
 * Extract coordinate components dynamically
 */
function extractCoordinateComponents(field, value) {
  const components = []

  if (field === 'proj:centroid' && value && typeof value === 'object') {
    const lat =
      value.lat ?? value.latitude ?? (Array.isArray(value) ? value[1] : null)
    const lon =
      value.lon ?? value.longitude ?? (Array.isArray(value) ? value[0] : null)
    if (typeof lat === 'number' && typeof lon === 'number') {
      components.push({ type: 'centroid', lat, lon, source: field })
    }
  } else if (
    field === 'proj:centroid' &&
    Array.isArray(value) &&
    value.length >= 2
  ) {
    components.push({
      type: 'centroid',
      lat: value[1],
      lon: value[0],
      source: field
    })
  } else if (field === 'bbox' && Array.isArray(value) && value.length >= 4) {
    const [minLon, minLat, maxLon, maxLat] = value
    components.push({
      type: 'bbox',
      minLat,
      minLon,
      maxLat,
      maxLon,
      centerLat: (minLat + maxLat) / 2,
      centerLon: (minLon + maxLon) / 2,
      source: field
    })
  }

  return components
}

/**
 * Extract shape components dynamically
 */
function extractShapeComponents(field, value) {
  const components = []

  if (field === 'proj:shape' && Array.isArray(value) && value.length >= 2) {
    components.push({
      type: 'shape',
      width: value[0],
      height: value[1],
      source: field
    })
  }

  return components
}

/**
 * Extract transform components dynamically
 */
function extractTransformComponents(field, value) {
  const components = []

  if (field === 'proj:transform' && Array.isArray(value) && value.length >= 6) {
    components.push({
      type: 'transform',
      pixelSizeX: value[0],
      rotationX: value[1],
      originX: value[2],
      rotationY: value[3],
      pixelSizeY: value[4],
      originY: value[5],
      source: field
    })
  }

  return components
}

/**
 * Extract processing components dynamically
 */
function extractProcessingComponents(field, value) {
  const components = []

  if (
    field === 'processing:software' &&
    value &&
    typeof value === 'object' &&
    value.name
  ) {
    components.push({
      type: 'software',
      name: value.name,
      version: value.version || 'Unknown',
      source: field
    })
    return components
  }

  if (
    field === 'processing:software' &&
    value &&
    typeof value === 'object' &&
    !Array.isArray(value)
  ) {
    for (const [k, v] of Object.entries(value)) {
      components.push({
        type: 'software',
        name: k,
        version: typeof v === 'string' ? v : String(v),
        source: field
      })
    }
    return components
  }

  return components
}

/**
 * Extract boolean components
 */
function extractBooleanComponents(field, value) {
  return [
    {
      type: 'boolean',
      value,
      source: field
    }
  ]
}

/**
 * Extract percentage components
 */
function extractPercentageComponents(field, value) {
  const fieldLower = field.toLowerCase()
  if (typeof value === 'number') {
    if (value >= 0 && value <= 1) {
      return [
        { type: 'percentage', value: (value * 100).toFixed(2), source: field }
      ]
    }
    if (
      (fieldLower.includes('cover') ||
        fieldLower.includes('cloud_cover') ||
        fieldLower.endsWith(':cloud_cover')) &&
      value >= 0 &&
      value <= 100
    ) {
      return [{ type: 'percentage', value: value.toFixed(2), source: field }]
    }
  }
  return null
}

/**
 * Generate HTML for field components
 * @param {string} fieldType - Field type
 * @param {Array} components - Component objects
 * @param {string} field - Field name
 * @returns {string} Formatted HTML
 */
function generateFieldHtml(fieldType, components, field) {
  switch (fieldType) {
    case 'grid':
      return generateGridHtml(components, field)
    case 'coordinate':
      return generateCoordinateHtml(components)
    case 'shape':
      return generateShapeHtml(components)
    case 'transform':
      return generateTransformHtml(components)
    case 'processing':
      return generateProcessingHtml(components)
    case 'boolean':
      return generateBooleanHtml(components)
    case 'percentage':
      return generatePercentageHtml(components)
    default:
      return formatStacField(field, components[0]?.value, null)
  }
}

/**
 * Generate grid text dynamically
 */
function generateGridHtml(components, currentField) {
  if (components.length === 0) return ''
  const currentLower = (currentField || '').toLowerCase()

  // If the current field is a specific sub-field (path/row/type/utm/lat band/grid square/tile),
  // render ONLY that sub-value to avoid duplicate composite rows across related fields.
  const isSpecificGridSubfield = [
    'wrs_path',
    'wrs_row',
    'wrs_type',
    'utm_zone',
    'latitude_band',
    'grid_square',
    'tile',
    'zone',
    'grid:code'
  ].some((k) => currentLower.includes(k))

  if (isSpecificGridSubfield) {
    // Prefer exact source match, else best-effort include match
    let comp = components.find(
      (c) => (c.source || '').toLowerCase() === currentLower
    )
    if (!comp) {
      comp = components.find(
        (c) =>
          c.label &&
          currentLower.includes(c.label.replace(/\s+/g, '_').toLowerCase())
      )
    }
    if (comp) {
      // Minimal formatting: special case for wrs_type to show WRS-<type>
      if (currentLower.includes('wrs_type')) {
        const sanitizedValue = sanitizeFieldValue(comp.value, false)
        return `WRS-${String(sanitizedValue).toUpperCase()}`
      }
      if (currentLower === 'grid:code') {
        return sanitizeFieldValue(comp.value, false)
      }
      return sanitizeFieldValue(comp.value, false)
    }
  }

  // Otherwise, render a concise composite once (for fields like grid:code or general grid summaries)
  const systemName = sanitizeFieldValue(components[0]?.system || 'GRID', false)
  const seen = new Set()
  const parts = components
    .filter((c) => {
      const key = sanitizeFieldValue(c.label, false).toLowerCase()
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })
    .map((c) => {
      // SECURITY: Sanitize all text content
      const sanitizedLabel = sanitizeFieldValue(c.label, false)
      const sanitizedValue = sanitizeFieldValue(c.value, false)
      const text = String(sanitizedValue)
      const truncated = text.length > 64 ? `${text.slice(0, 61)}...` : text
      return `${sanitizedLabel}: ${truncated}`
    })
  return `${systemName}:<br/>${parts.join('<br/>')}`
}

/**
 * Generate coordinate text dynamically
 */
function generateCoordinateHtml(components) {
  if (components.length === 0) return ''
  const c = components[0]
  if (c.type === 'centroid') {
    // SECURITY: Ensure numeric values are properly formatted
    const lat =
      typeof c.lat === 'number'
        ? c.lat.toFixed(6)
        : sanitizeFieldValue(c.lat, false)
    const lon =
      typeof c.lon === 'number'
        ? c.lon.toFixed(6)
        : sanitizeFieldValue(c.lon, false)
    return `Lat: ${lat}°, Lon: ${lon}°`
  }
  if (c.type === 'bbox') {
    // SECURITY: Ensure numeric values are properly formatted
    const minLon =
      typeof c.minLon === 'number'
        ? c.minLon.toFixed(6)
        : sanitizeFieldValue(c.minLon, false)
    const minLat =
      typeof c.minLat === 'number'
        ? c.minLat.toFixed(6)
        : sanitizeFieldValue(c.minLat, false)
    const maxLon =
      typeof c.maxLon === 'number'
        ? c.maxLon.toFixed(6)
        : sanitizeFieldValue(c.maxLon, false)
    const maxLat =
      typeof c.maxLat === 'number'
        ? c.maxLat.toFixed(6)
        : sanitizeFieldValue(c.maxLat, false)
    return `BBox: [${minLon}, ${minLat}] – [${maxLon}, ${maxLat}]`
  }
  return sanitizeFieldValue(c.value ?? '', false)
}

/**
 * Generate shape text dynamically
 */
function generateShapeHtml(components) {
  if (components.length === 0) return ''
  const c = components[0]
  if (c.type === 'shape') {
    // SECURITY: Ensure numeric values are properly formatted and use safe multiplication symbol
    const width =
      typeof c.width === 'number'
        ? c.width.toLocaleString()
        : sanitizeFieldValue(c.width, false)
    const height =
      typeof c.height === 'number'
        ? c.height.toLocaleString()
        : sanitizeFieldValue(c.height, false)
    return `Shape: ${width} × ${height} px`
  }
  return sanitizeFieldValue(c.value ?? '', false)
}

/**
 * Generate transform text dynamically
 */
function generateTransformHtml(components) {
  if (components.length === 0) return ''
  const c = components[0]
  if (c.type === 'transform') {
    const pixelSizeX = sanitizeFieldValue(
      typeof c.pixelSizeX === 'number'
        ? c.pixelSizeX.toLocaleString()
        : c.pixelSizeX,
      false
    )
    const pixelSizeY = sanitizeFieldValue(
      typeof c.pixelSizeY === 'number'
        ? Math.abs(c.pixelSizeY).toLocaleString()
        : c.pixelSizeY,
      false
    )
    const originX = sanitizeFieldValue(
      typeof c.originX === 'number' ? c.originX.toLocaleString() : c.originX,
      false
    )
    const originY = sanitizeFieldValue(
      typeof c.originY === 'number' ? c.originY.toLocaleString() : c.originY,
      false
    )
    return `Pixel Size: ${pixelSizeX} × ${pixelSizeY} m; Origin: (${originX}, ${originY})`
  }
  return String(c.value ?? '')
}

/**
 * Generate processing text dynamically
 */
function generateProcessingHtml(components) {
  if (components.length === 0) return ''
  const parts = components
    .filter((c) => c.type === 'software')
    .map(
      (c) =>
        `${sanitizeFieldValue(c.name, false)} (${sanitizeFieldValue(c.version, false)})`
    )
  return parts.join(', ')
}

/**
 * Generate boolean HTML
 */
function generateBooleanHtml(components) {
  if (components.length === 0) return ''

  const value = components[0].value
  return value ? 'Yes' : 'No'
}

/**
 * Generate percentage HTML
 */
function generatePercentageHtml(components) {
  if (components.length === 0) return ''

  return `${components[0].value}%`
}

/**
 * HELPER FUNCTIONS
 */

/**
 * Generate dynamic labels from field names
 */
function generateDynamicLabel(fieldName) {
  // Remove extension prefix if present
  const cleanName = fieldName.includes(':')
    ? fieldName.split(':')[1]
    : fieldName

  // Convert snake_case or kebab-case to Title Case
  return cleanName
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, (l) => l.toUpperCase())
}

/**
 * Infer grid system from field name and value
 */
function inferGridSystem(fieldName, value) {
  const fieldLower = fieldName.toLowerCase()
  const valueStr = String(value)

  if (fieldLower.includes('mgrs') || valueStr.includes('MGRS')) return 'MGRS'
  if (fieldLower.includes('wrs') || valueStr.includes('WRS')) return 'WRS-2'
  if (fieldLower.includes('utm') || valueStr.includes('UTM')) return 'UTM'
  if (fieldLower.includes('grid') || valueStr.includes('Grid')) return 'GRID'

  return 'GRID'
}

/**
 * Parse grid value string for components
 */
function parseGridValue(value) {
  // This is a fallback - in practice, we prefer STAC properties
  if (value.includes('MGRS')) {
    return [
      {
        label: 'Grid Code',
        value,
        system: 'MGRS',
        source: 'value'
      }
    ]
  }

  if (value.includes('WRS')) {
    return [
      {
        label: 'Grid Code',
        value,
        system: 'WRS-2',
        source: 'value'
      }
    ]
  }

  return null
}

/**
 * Standard stac-fields formatting fallback
 */
function formatStacField(field, value, item) {
  try {
    const formatted = StacFields.format(value, field, item)
    const result = typeof formatted === 'string' ? formatted : String(value)
    // SECURITY: Sanitize the final output
    return sanitizeFieldValue(result, true) // Allow safe HTML for formatting
  } catch (error) {
    // SECURITY: Sanitize fallback output
    return sanitizeFieldValue(String(value), true)
  }
}

/**
 * EXPORT ALL NECESSARY FUNCTIONS FOR BACKWARD COMPATIBILITY
 */

export { extractFieldComponents }

export function getFieldLabel(field, item = null) {
  try {
    return StacFields.label(field, item)
  } catch (error) {
    return field.replace(/[-_:]/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())
  }
}

export function getFieldLabelPlainText(field, item = null) {
  const label = getFieldLabel(field, item)
  // Strip HTML tags to get plain text
  const div = document.createElement('div')
  div.innerHTML = label
  return div.textContent || div.innerText || label
}

export function getFieldUnit(field) {
  try {
    const spec = StacFields.Registry.getSpecification(field)
    return spec?.unit || null
  } catch (error) {
    return null
  }
}

export function renderFieldValue(field, value, item) {
  const formattedValue = formatStacFieldEnhanced(field, value, item)
  const hasHtml = /<[^>]*>/.test(formattedValue)
  const cleanValue = hasHtml
    ? formattedValue.replace(/&nbsp;/g, ' ')
    : formattedValue

  return {
    formattedValue: cleanValue,
    hasHtml
  }
}
