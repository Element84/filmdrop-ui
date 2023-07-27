import React from 'react'
import PropTypes from 'prop-types'
import './HeatMapSymbology.css'
import { colorMap } from '../../../utils'

const HeatMapSymbology = ({ results }) => {
  const colors = colorMap(results.properties.largestRatio)

  return (
    <div className="HeatMapSymbology">
      <div
        className="gradient"
        style={{
          '--color-1': `${colors[0]}`,
          '--color-2': `${colors[Math.round(colors.length / 4)]}`,
          '--color-3': `${colors[Math.round(colors.length / 2)]}`,
          '--color-4': `${colors[colors.length - 1]}`,
          background: `linear-gradient(90deg, var(--color-1) 0%, var(--color-2) 33%, var(--color-3) 66%, var(--color-4) 100% ) `
        }}
      />
      <div className="values">
        <div className="min">0</div>
        <div className="mid" />
        <div className="max">{results.properties.largestFrequency}</div>
      </div>
    </div>
  )
}

HeatMapSymbology.propTypes = {
  results: PropTypes.object
}

export default HeatMapSymbology
