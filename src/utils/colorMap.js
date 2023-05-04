import { COLORMAP } from '../components/defaults'
import * as createColormap from 'colormap'

export const colorMap = (largestRatio) =>
  createColormap({
    colormap: COLORMAP,
    nshades: Math.round(Math.max(9, largestRatio)),
    format: 'hex'
  })
