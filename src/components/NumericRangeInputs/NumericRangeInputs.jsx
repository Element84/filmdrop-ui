import React, { useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import Card from '../Card/Card'
import OverflowTooltip from '../EnhancedDetails/OverflowTooltip'
import './NumericRangeInputs.css'

const NumericRangeInputs = ({
  min,
  max,
  value,
  onChange,
  label,
  mode = 'unbounded',
  integerType = false
}) => {
  const isMinFixed = mode === 'min-only'
  const isMaxFixed = mode === 'max-only'
  const hasEditableMin = !isMinFixed
  const hasEditableMax = !isMaxFixed

  const [minInput, setMinInput] = useState(isMinFixed ? min : (value.min ?? ''))
  const [maxInput, setMaxInput] = useState(isMaxFixed ? max : (value.max ?? ''))
  const [isEditingMin, setIsEditingMin] = useState(false)
  const [isEditingMax, setIsEditingMax] = useState(false)

  useEffect(() => {
    if (!isEditingMin && !isMinFixed) {
      setMinInput(value.min ?? '')
    }
  }, [value.min, isEditingMin, isMinFixed])

  useEffect(() => {
    if (!isEditingMax && !isMaxFixed) {
      setMaxInput(value.max ?? '')
    }
  }, [value.max, isEditingMax, isMaxFixed])

  const roundIfInteger = (val) => (integerType ? Math.round(val) : val)

  const buildPartialValue = (newMin, newMax) => {
    const result = {}
    if (newMin !== undefined) result.min = newMin
    if (newMax !== undefined) result.max = newMax
    return Object.keys(result).length > 0 ? result : null
  }

  const handleMinChange = (e) => {
    setMinInput(e.target.value)
  }

  const handleMaxChange = (e) => {
    setMaxInput(e.target.value)
  }

  const handleMinBlur = () => {
    setIsEditingMin(false)

    if (minInput === '' || minInput === null) {
      setMinInput('')
      if (onChange) {
        const newMax = value.max !== undefined ? value.max : undefined
        onChange(buildPartialValue(undefined, newMax))
      }
      return
    }

    let newMin = Number(minInput)
    if (isNaN(newMin)) {
      setMinInput('')
      if (onChange) {
        const newMax = value.max !== undefined ? value.max : undefined
        onChange(buildPartialValue(undefined, newMax))
      }
      return
    }

    if (max !== undefined && newMin > max) newMin = max
    if (value.max !== undefined && newMin > value.max) newMin = value.max
    newMin = roundIfInteger(newMin)

    setMinInput(newMin)
    if (onChange) {
      const newMax = value.max !== undefined ? value.max : undefined
      onChange(buildPartialValue(newMin, newMax))
    }
  }

  const handleMaxBlur = () => {
    setIsEditingMax(false)

    if (maxInput === '' || maxInput === null) {
      setMaxInput('')
      if (onChange) {
        const newMin = value.min !== undefined ? value.min : undefined
        onChange(buildPartialValue(newMin, undefined))
      }
      return
    }

    let newMax = Number(maxInput)
    if (isNaN(newMax)) {
      setMaxInput('')
      if (onChange) {
        const newMin = value.min !== undefined ? value.min : undefined
        onChange(buildPartialValue(newMin, undefined))
      }
      return
    }

    if (min !== undefined && newMax < min) newMax = min
    if (value.min !== undefined && newMax < value.min) newMax = value.min
    newMax = roundIfInteger(newMax)

    setMaxInput(newMax)
    if (onChange) {
      const newMin = value.min !== undefined ? value.min : undefined
      onChange(buildPartialValue(newMin, newMax))
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.target.blur()
    }
  }

  const minDisplayValue = isMinFixed
    ? `Min: ${min}`
    : isEditingMin
      ? minInput
      : (value.min ?? '')

  const maxDisplayValue = isMaxFixed
    ? `Max: ${max}`
    : isEditingMax
      ? maxInput
      : (value.max ?? '')

  return (
    <Card height="auto" className="numericRangeInputs">
      <OverflowTooltip component="label" className="numericRangeLabel">
        {label}
      </OverflowTooltip>
      <div className="numericRangeContainer">
        <div className="numericRangeInputWrapper">
          <input
            type={isMinFixed ? 'text' : 'number'}
            className={`numericRangeInput${isMinFixed ? ' numericRangeInput--fixed' : ''}`}
            value={minDisplayValue}
            onChange={hasEditableMin ? handleMinChange : undefined}
            onFocus={hasEditableMin ? () => setIsEditingMin(true) : undefined}
            onBlur={hasEditableMin ? handleMinBlur : undefined}
            onKeyDown={hasEditableMin ? handleKeyDown : undefined}
            readOnly={isMinFixed}
            tabIndex={isMinFixed ? -1 : undefined}
            placeholder="Min"
            aria-label={`${label} minimum value`}
          />
        </div>
        <div className="numericRangeInputWrapper">
          <input
            type={isMaxFixed ? 'text' : 'number'}
            className={`numericRangeInput${isMaxFixed ? ' numericRangeInput--fixed' : ''}`}
            value={maxDisplayValue}
            onChange={hasEditableMax ? handleMaxChange : undefined}
            onFocus={hasEditableMax ? () => setIsEditingMax(true) : undefined}
            onBlur={hasEditableMax ? handleMaxBlur : undefined}
            onKeyDown={hasEditableMax ? handleKeyDown : undefined}
            readOnly={isMaxFixed}
            tabIndex={isMaxFixed ? -1 : undefined}
            placeholder="Max"
            aria-label={`${label} maximum value`}
          />
        </div>
      </div>
    </Card>
  )
}

NumericRangeInputs.propTypes = {
  min: PropTypes.number,
  max: PropTypes.number,
  value: PropTypes.shape({
    min: PropTypes.number,
    max: PropTypes.number
  }).isRequired,
  onChange: PropTypes.func.isRequired,
  label: PropTypes.string.isRequired,
  mode: PropTypes.oneOf(['min-only', 'max-only', 'unbounded']),
  integerType: PropTypes.bool
}

export default NumericRangeInputs
