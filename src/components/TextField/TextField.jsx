import React, { useState } from 'react'
import PropTypes from 'prop-types'
import { TextField as MuiTextField } from '@mui/material'
import Card from '../Card/Card'
import { useDebouncedCallback } from '../../hooks/useDebouncedCallback'
import './TextField.css'

const TextField = ({
  label,
  value,
  onChange,
  type = 'text',
  className = '',
  debounceDelay = 300
}) => {
  // Local state for immediate UI updates (prevents stuttering)
  const [localValue, setLocalValue] = useState(value)
  // Reset the draft on parent prop change via render-phase setState (do NOT
  // replace with useEffect — that cascades renders).
  // https://react.dev/reference/react/useState#storing-information-from-previous-renders
  const [prevValue, setPrevValue] = useState(value)
  if (value !== prevValue) {
    setPrevValue(value)
    setLocalValue(value)
  }

  // Debounced onChange callback
  const debouncedOnChange = useDebouncedCallback(onChange, debounceDelay)

  // Handle local input changes
  const handleLocalChange = (e) => {
    const newValue = e.target.value
    setLocalValue(newValue) // Immediate UI update
    debouncedOnChange(newValue) // Debounced parent callback
  }

  return (
    <Card label={label} className={`TextField ${className}`}>
      <MuiTextField
        className="TextField__input"
        type={type}
        value={localValue}
        onChange={handleLocalChange}
        variant="outlined"
        fullWidth
      />
    </Card>
  )
}

TextField.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onChange: PropTypes.func.isRequired,
  type: PropTypes.oneOf(['text', 'number']),
  className: PropTypes.string,
  debounceDelay: PropTypes.number
}

export default TextField
