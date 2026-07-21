import React from 'react'
import PropTypes from 'prop-types'
import { Select, MenuItem, OutlinedInput } from '@mui/material'
import Card from '../Card/Card'
import './Dropdown.css'

const Dropdown = ({ label, value, onChange, options, className = '' }) => {
  const selectAriaLabel = label || 'Dropdown'

  const handleChange = (event) => {
    onChange(event)
  }

  return (
    <Card height={'auto'} label={label} className={`Dropdown ${className}`}>
      <Select
        className="Dropdown__select"
        value={value}
        onChange={handleChange}
        aria-label={selectAriaLabel}
        input={<OutlinedInput />}
        MenuProps={{
          classes: { paper: 'Dropdown__menu' }
        }}
      >
        {options.map((option) => (
          <MenuItem key={option.value} value={option.value}>
            {option.label}
          </MenuItem>
        ))}
      </Select>
    </Card>
  )
}

Dropdown.propTypes = {
  label: PropTypes.string,
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  options: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired
    })
  ).isRequired,
  className: PropTypes.string
}

export default Dropdown
