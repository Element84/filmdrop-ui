import { COLORMAP } from '../components/defaults'
const colormap = require('colormap')

export const colorMap = (largestRatio) => {
  return colormap({
    colormap: COLORMAP,
    nshades: Math.round(largestRatio) > 9 ? Math.round(largestRatio) : 9,
    format: 'hex'
  })
}
