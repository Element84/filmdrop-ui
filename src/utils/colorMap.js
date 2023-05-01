import { COLORMAP } from '../components/defaults'
import * as colormap from 'colormap'

export const colorMap = (largestRatio) => {
  return colormap({
    colormap: COLORMAP,
    nshades: Math.round(Math.max(9, largestRatio)),
    format: 'hex'
  })
}
