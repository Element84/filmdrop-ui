import { useMemo } from 'react'
import { useSelector } from 'react-redux'
import { getCollectionConfig } from '../utils/configHelper'

/**
 * Determine the render order for a queryable schema based on its component type.
 * Returns a numeric order for supported schemas, or null for unsupported schemas.
 *
 * Order: RangeSliderWithInputs (0), NumericRangeInputs (1), MultiSelect (2), TextField string (3)
 */
function getQueryableRenderOrder(schema) {
  if (!schema || typeof schema !== 'object') {
    return null
  }

  // RangeSliderWithInputs: numeric types with both min and max defined
  if (
    (schema.type === 'number' || schema.type === 'integer') &&
    !schema.enum &&
    schema.minimum !== undefined &&
    schema.maximum !== undefined
  ) {
    return 0
  }

  // NumericRangeInputs: numeric types without both bounds (min-only, max-only, unbounded)
  if ((schema.type === 'number' || schema.type === 'integer') && !schema.enum) {
    return 1
  }

  // MultiSelect: enum values for string, number, or integer types
  if (
    schema.enum &&
    (schema.type === 'string' ||
      schema.type === 'number' ||
      schema.type === 'integer')
  ) {
    return 2
  }

  // TextField: string without enum (for string equivalence queries)
  if (schema.type === 'string') {
    return 3
  }

  // All other types are unsupported (booleans, objects, arrays of non-enums, etc.)
  return null
}

/**
 * Custom hook to get filtered and sorted renderable queryable fields
 * @returns {Object} { fields: Array, hasFields: boolean, error: Object | null }
 */
export const useRenderableQueryables = () => {
  const selectedCollection = useSelector(
    (state) => state.mainSlice.selectedCollection
  )
  const selectedCollectionData = useSelector(
    (state) => state.mainSlice.selectedCollectionData
  )

  const queryables = selectedCollectionData?.queryables
  const queryableFilters = getCollectionConfig(
    selectedCollection,
    'queryableFilters'
  )

  return useMemo(() => {
    // Check for explicit error from service
    if (queryables?.error === true) {
      return {
        fields: [],
        hasFields: false,
        error: {
          message: queryables.message || 'Unknown error'
        }
      }
    }

    // Return empty result if queryables are invalid
    if (
      !queryables ||
      typeof queryables !== 'object' ||
      Array.isArray(queryables)
    ) {
      return {
        fields: [],
        hasFields: false,
        error: null
      }
    }

    // Compute render order once per entry, filter unsupported schemas and apply optional allowlist
    const withOrder = Object.entries(queryables)
      .map(([fieldName, schema]) => [
        fieldName,
        schema,
        getQueryableRenderOrder(schema)
      ])
      .filter(
        ([fieldName, , order]) =>
          order !== null &&
          (!Array.isArray(queryableFilters) ||
            queryableFilters.includes(fieldName))
      )

    // Sort by component type: RangeSlider, MultiSelect, TextField (string), TextField (numeric)
    const sorted = [...withOrder]
      .sort((a, b) => a[2] - b[2])
      .map(([fieldName, schema]) => [fieldName, schema])

    return {
      fields: sorted,
      hasFields: sorted.length > 0,
      error: null
    }
  }, [queryables, queryableFilters])
}
