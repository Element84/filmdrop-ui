/**
 * Semantic grouping and filtering of STAC fields
 */

import { getCollectionConfig } from './configHelper'

/**
 * Groups STAC properties by extension prefix
 * @param {Record<string, any>} properties - STAC item properties
 * @param {Function} filterPredicate - Optional field filter
 * @returns {Record<string, Record<string, any>>} Grouped properties by extension
 */
export function groupFieldsSemantically(properties, filterPredicate = null) {
  const groups = {}
  if (!properties || typeof properties !== 'object') return groups

  for (const [key, value] of Object.entries(properties)) {
    // STEP 1: OPTIONAL FILTERING - Apply filter predicate if provided
    // This allows collection-specific field filtering before grouping
    if (filterPredicate && !filterPredicate(key, { properties })) {
      continue
    }

    // STEP 2: EXTENSION PREFIX DETECTION - Extract extension prefix from field name
    // Fields with ":" separator use the prefix, others go to "core" group
    const extension = key.includes(':') ? key.split(':')[0] : 'core'

    // STEP 3: GROUP CREATION - Create group if it doesn't exist and add field
    if (!groups[extension]) groups[extension] = {}
    groups[extension][key] = value
  }

  return groups
}

/**
 * Creates field predicate for enhanced display configuration
 * @param {string} collectionId - Collection ID
 * @param {object} appConfig - Application configuration
 * @returns {Function} Field filter predicate
 */
export function createEnhancedDisplayFieldPredicate(
  collectionId,
  appConfig = null
) {
  const enhancedConfig = getCollectionConfig(
    collectionId,
    'enhancedDisplayConfig',
    appConfig
  )

  if (enhancedConfig?.property_groups) {
    // Extract field names from the grouped format
    const configuredFields = new Set()
    enhancedConfig.property_groups.forEach((group) => {
      group.fields.forEach((field) => {
        configuredFields.add(field.name)
      })
    })

    return function predicate(field) {
      return configuredFields.has(field)
    }
  }

  // If no config exists for this collection, show all fields (fallback to auto-discovery)
  return () => true
}

/**
 * Normalize group name for use in HTML attributes
 * @param {string} groupName - The group name
 * @returns {string} Normalized name (lowercase with hyphens)
 */
export function normalizeGroupName(groupName) {
  return (groupName || '').toLowerCase().replace(/\s+/g, '-')
}
