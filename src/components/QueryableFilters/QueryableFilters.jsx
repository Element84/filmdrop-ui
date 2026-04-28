import React, { useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Alert } from '@mui/material'
import RangeSliderWithInputs from '../RangeSliderWithInputs/RangeSliderWithInputs'
import NumericRangeInputs from '../NumericRangeInputs/NumericRangeInputs'
import MultiSelect from '../MultiSelect/MultiSelect'
import TextField from '../TextField/TextField'
import { setQueryableFilters } from '../../redux/slices/mainSlice'
import { sanitizeFieldValue } from '../../utils/securityHelper'
import { useRenderableQueryables } from '../../hooks/useRenderableQueryables'
import { getFieldLabelPlainText } from '../../utils/fieldFormatting'
import { calculateRangeStep } from '../../utils/rangeHelper'
import './QueryableFilters.css'

const QueryableFilters = () => {
  const dispatch = useDispatch()
  const selectedCollectionData = useSelector(
    (state) => state.mainSlice.selectedCollectionData
  )
  const queryableFilters = useSelector(
    (state) => state.mainSlice.queryableFilters
  )

  // Use custom hook to get filtered and sorted queryable fields
  const { fields: renderableFields, error } = useRenderableQueryables()

  // Initialize default values when queryables change
  // This MUST come before any conditional returns (Rules of Hooks)
  useEffect(() => {
    if (renderableFields.length === 0) return

    const newFilters = { ...queryableFilters }
    let hasChanges = false

    renderableFields.forEach(([fieldName, schema]) => {
      const defaultValue = schema.default
      // Only set default if field isn't already set and default exists
      if (
        defaultValue !== undefined &&
        queryableFilters[fieldName] === undefined
      ) {
        const sanitizedValue =
          typeof defaultValue === 'string'
            ? sanitizeFieldValue(defaultValue, false)
            : defaultValue
        newFilters[fieldName] = sanitizedValue
        hasChanges = true
      }
    })

    if (hasChanges) {
      dispatch(setQueryableFilters(newFilters))
    }
  }, [selectedCollectionData?.id, renderableFields, queryableFilters, dispatch])

  // Check if queryables has error (from the hook)
  if (error) {
    return (
      <div className="queryableFiltersError">
        <Alert severity="error">
          Unable to load filters: {error.message || 'Unknown error'}
        </Alert>
      </div>
    )
  }

  // If no renderable fields after filtering, hide component
  if (renderableFields.length === 0) {
    return null
  }

  const handleFilterChange = (fieldName, value) => {
    // Sanitize value before storing
    const sanitizedValue =
      typeof value === 'string' ? sanitizeFieldValue(value, false) : value

    const newFilters = { ...queryableFilters }

    // Remove filter if value is empty/null
    if (
      sanitizedValue === null ||
      sanitizedValue === undefined ||
      sanitizedValue === '' ||
      (Array.isArray(sanitizedValue) && sanitizedValue.length === 0)
    ) {
      delete newFilters[fieldName]
    } else {
      newFilters[fieldName] = sanitizedValue
    }

    dispatch(setQueryableFilters(newFilters))
  }

  const renderField = (fieldName, schema) => {
    // Prefer the queryable's title, fall back to stac-fields label
    const label = schema.title || getFieldLabelPlainText(fieldName)
    const currentValue = queryableFilters[fieldName]
    const defaultValue = schema.default

    // Numeric fields without enum -> RangeSliderWithInputs or NumericRangeInputs
    if (
      (schema.type === 'number' || schema.type === 'integer') &&
      !schema.enum
    ) {
      const isInteger = schema.type === 'integer'
      const hasMin = schema.minimum !== undefined
      const hasMax = schema.maximum !== undefined

      if (hasMin && hasMax) {
        // Both bounds -> full range slider
        const rangeValue = currentValue || {
          min: schema.minimum,
          max: schema.maximum
        }
        return (
          <div key={fieldName} className="queryableField">
            <RangeSliderWithInputs
              min={schema.minimum}
              max={schema.maximum}
              value={rangeValue}
              onChange={(value) => handleFilterChange(fieldName, value)}
              label={label}
              step={calculateRangeStep(schema.minimum, schema.maximum)}
              integerType={isInteger}
            />
          </div>
        )
      }

      if (hasMin && !hasMax) {
        // Only minimum -> min fixed, max editable
        return (
          <div key={fieldName} className="queryableField">
            <NumericRangeInputs
              mode="min-only"
              min={schema.minimum}
              value={currentValue || {}}
              onChange={(value) => handleFilterChange(fieldName, value)}
              label={label}
              integerType={isInteger}
            />
          </div>
        )
      }

      if (!hasMin && hasMax) {
        // Only maximum -> max fixed, min editable
        return (
          <div key={fieldName} className="queryableField">
            <NumericRangeInputs
              mode="max-only"
              max={schema.maximum}
              value={currentValue || {}}
              onChange={(value) => handleFilterChange(fieldName, value)}
              label={label}
              integerType={isInteger}
            />
          </div>
        )
      }

      // No bounds -> both editable
      return (
        <div key={fieldName} className="queryableField">
          <NumericRangeInputs
            mode="unbounded"
            value={currentValue || {}}
            onChange={(value) => handleFilterChange(fieldName, value)}
            label={label}
            integerType={isInteger}
          />
        </div>
      )
    }

    // Enum values (string, number, or integer) -> MultiSelect
    if (
      schema.enum &&
      (schema.type === 'string' ||
        schema.type === 'number' ||
        schema.type === 'integer')
    ) {
      const options = schema.enum.map((option) => ({
        value: option,
        label: sanitizeFieldValue(String(option), false)
      }))

      return (
        <div key={fieldName} className="queryableField">
          <MultiSelect
            label={label}
            value={currentValue ?? defaultValue ?? []}
            onChange={(newValue) => handleFilterChange(fieldName, newValue)}
            options={options}
          />
        </div>
      )
    }

    // String field without enum -> Text input for string equivalence queries
    if (schema.type === 'string') {
      return (
        <div key={fieldName} className="queryableField">
          <TextField
            label={label}
            type="text"
            value={currentValue ?? defaultValue ?? ''}
            onChange={(val) => {
              handleFilterChange(fieldName, val === '' ? null : val)
            }}
          />
        </div>
      )
    }

    // Unsupported schema type
    return null
  }

  return (
    <div className="queryableFilters">
      {renderableFields.map(([fieldName, schema]) =>
        renderField(fieldName, schema)
      )}
    </div>
  )
}

export default QueryableFilters
