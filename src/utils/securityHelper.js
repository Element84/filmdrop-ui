/**
 * Input sanitization and XSS prevention
 */

import DOMPurify from 'dompurify'

/**
 * Sanitization configuration
 */
const SANITIZE_CONFIG = {
  // Allow only safe HTML tags for formatting
  ALLOWED_TAGS: ['br', 'span', 'strong', 'em'],
  // Allow only safe attributes
  ALLOWED_ATTR: ['class', 'id'],
  // Remove all script tags and event handlers
  FORBID_TAGS: [
    'script',
    'object',
    'embed',
    'iframe',
    'form',
    'input',
    'button'
  ],
  FORBID_ATTR: [
    'onerror',
    'onload',
    'onclick',
    'onmouseover',
    'onfocus',
    'onblur'
  ],
  // Strip all dangerous content
  KEEP_CONTENT: true,
  // Return only text content for maximum safety
  RETURN_DOM: false,
  RETURN_DOM_FRAGMENT: false,
  RETURN_DOM_IMPORT: false,
  // Allow safe mathematical symbols
  ALLOWED_URI_REGEXP:
    /^(?:(?:(?:f|ht)tps?|mailto|tel|callto|sms|cid|xmpp):|[^a-z]|[a-z+.-]+(?:[^a-z+.-:]|$))/i
}

/**
 * STRICT SANITIZATION CONFIG
 * For cases where we need maximum security (no HTML at all)
 */
const STRICT_SANITIZE_CONFIG = {
  ALLOWED_TAGS: [],
  ALLOWED_ATTR: [],
  KEEP_CONTENT: true,
  RETURN_DOM: false
}

/**
 * Sanitize HTML content using DOMPurify
 * @param {string} html - HTML string to sanitize
 * @param {boolean} strict - Use strict mode (no HTML tags allowed)
 * @returns {string} Sanitized HTML string
 */
export function sanitizeHtml(html, strict = false) {
  if (typeof html !== 'string') {
    return String(html || '')
  }

  const config = strict ? STRICT_SANITIZE_CONFIG : SANITIZE_CONFIG
  return DOMPurify.sanitize(html, config)
}

/**
 * Sanitize field value for safe display
 * @param {any} value - Field value to sanitize
 * @param {boolean} allowHtml - Whether to allow safe HTML tags
 * @returns {string} Sanitized value
 */
export function sanitizeFieldValue(value, allowHtml = false) {
  if (value === null || value === undefined) {
    return ''
  }

  if (typeof value === 'boolean') {
    return value ? 'Yes' : 'No'
  }

  if (typeof value === 'number') {
    return String(value)
  }

  if (Array.isArray(value)) {
    return sanitizeArrayValue(value, allowHtml)
  }

  if (typeof value === 'object') {
    return sanitizeObjectValue(value, allowHtml)
  }

  // String values - sanitize HTML
  const stringValue = String(value)
  return allowHtml ? sanitizeHtml(stringValue) : sanitizeHtml(stringValue, true)
}

/**
 * Sanitize array values
 * @param {Array} array - Array to sanitize
 * @param {boolean} allowHtml - Whether to allow safe HTML tags
 * @returns {string} Sanitized array representation
 */
function sanitizeArrayValue(array, allowHtml = false) {
  const sanitizedItems = array.map((item) =>
    sanitizeFieldValue(item, allowHtml)
  )
  return sanitizedItems.join(', ')
}

/**
 * Sanitize object values
 * @param {Object} obj - Object to sanitize
 * @param {boolean} allowHtml - Whether to allow safe HTML tags
 * @returns {string} Sanitized object representation
 */
function sanitizeObjectValue(obj, allowHtml = false) {
  if (obj === null) return 'null'

  const sanitizedEntries = Object.entries(obj).map(([key, value]) => {
    const sanitizedKey = sanitizeFieldValue(key, false) // Keys should never have HTML
    const sanitizedValue = sanitizeFieldValue(value, allowHtml)
    return `${sanitizedKey}: ${sanitizedValue}`
  })

  return `{${sanitizedEntries.join(', ')}}`
}

/**
 * Sanitize field name for safe use in HTML attributes
 * @param {string} fieldName - Field name to sanitize
 * @returns {string} Sanitized field name
 */
export function sanitizeFieldName(fieldName) {
  if (typeof fieldName !== 'string') {
    return 'unknown-field'
  }

  // Remove all non-alphanumeric characters except hyphens and underscores
  return fieldName.replace(/[^a-zA-Z0-9\-_]/g, '-')
}

/**
 * Escape HTML entities in text content
 * @param {string} text - Text to escape
 * @returns {string} HTML-escaped text
 */
export function escapeHtml(text) {
  if (typeof text !== 'string') {
    return String(text || '')
  }

  // Pure string replacement (no DOM) so this is safe in SSR and at module
  // import time. Matches browser `div.innerHTML` for text content: only
  // `&`, `<`, `>` are escaped (not quotes or slashes).
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

/**
 * Validate and sanitize STAC item properties
 * @param {Object} properties - STAC item properties
 * @returns {Object} Sanitized properties
 */
export function sanitizeStacProperties(properties) {
  if (!properties || typeof properties !== 'object') {
    return {}
  }

  const sanitized = {}

  for (const [key, value] of Object.entries(properties)) {
    // Sanitize the key
    const sanitizedKey = sanitizeFieldName(key)

    // Sanitize the value (no HTML allowed in raw properties)
    const sanitizedValue = sanitizeFieldValue(value, false)

    sanitized[sanitizedKey] = sanitizedValue
  }

  return sanitized
}

/**
 * Check if a string contains potentially dangerous HTML
 * @param {string} html - HTML string to check
 * @returns {boolean} True if potentially dangerous
 */
export function isDangerousHtml(html) {
  if (typeof html !== 'string') {
    return false
  }

  const dangerousPatterns = [
    /<script/i,
    /javascript:/i,
    /on\w+\s*=/i,
    /<iframe/i,
    /<object/i,
    /<embed/i,
    /<form/i,
    /<input/i,
    /<button/i
  ]

  return dangerousPatterns.some((pattern) => pattern.test(html))
}

/**
 * Security validation for field processing
 * @param {string} field - Field name
 * @param {any} value - Field value
 * @returns {Object} Validation result with sanitized values
 */
export function validateFieldSecurity(field, value) {
  const result = {
    isValid: true,
    sanitizedField: sanitizeFieldName(field),
    sanitizedValue: sanitizeFieldValue(value, false),
    warnings: []
  }

  // Check for dangerous patterns
  if (isDangerousHtml(String(value))) {
    result.warnings.push('Potentially dangerous HTML detected in field value')
  }

  // Only warn if the field name was actually changed by sanitization
  // This prevents false positives for legitimate field names like 'eo-cloud_cover'
  if (field !== result.sanitizedField) {
    result.warnings.push('Field name contained unsafe characters')
  }

  return result
}
