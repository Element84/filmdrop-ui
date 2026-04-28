import React from 'react'
import PropTypes from 'prop-types'
import { Select, MenuItem, OutlinedInput, Chip, Box } from '@mui/material'
import Card from '../Card/Card'
import './MultiSelect.css'

const MultiSelect = ({ label, value, onChange, options, className = '' }) => {
  const handleChange = (event) => {
    const newValue = event.target.value
    onChange(typeof newValue === 'string' ? newValue.split(',') : newValue)
  }

  const handleDelete = (valueToDelete) => {
    onChange(value.filter((v) => v !== valueToDelete))
    document.activeElement?.blur()
  }

  return (
    <Card label={label} className={`MultiSelect ${className}`}>
      <Select
        className="MultiSelect__select"
        multiple
        value={value}
        onChange={handleChange}
        input={<OutlinedInput />}
        MenuProps={{
          classes: { paper: 'MultiSelect__menu' }
        }}
        renderValue={(selected) => (
          <Box className="MultiSelect__chips">
            {selected.map((val) => {
              const option = options.find((opt) => opt.value === val)
              return (
                <Chip
                  key={val}
                  label={option?.label || val}
                  onDelete={() => handleDelete(val)}
                  className="MultiSelect__chip"
                  onMouseDown={(e) => e.stopPropagation()}
                />
              )
            })}
          </Box>
        )}
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

MultiSelect.propTypes = {
  label: PropTypes.string,
  value: PropTypes.arrayOf(PropTypes.string).isRequired,
  onChange: PropTypes.func.isRequired,
  options: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired
    })
  ).isRequired,
  className: PropTypes.string
}

export default MultiSelect
