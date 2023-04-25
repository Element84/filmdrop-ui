const colormap = require('colormap')

export const colorMap = (largestRatio) => {
  return colormap({
    colormap: 'viridis',
    nshades: Math.round(largestRatio) > 9 ? Math.round(largestRatio) : 9,
    format: 'hex'
  })
}
