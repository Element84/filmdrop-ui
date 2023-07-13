import { DEFAULT_COLORMAP } from '../components/defaults'
import { VITE_COLORMAP } from '../assets/config'
import colormap from 'colormap'

export const colorMap = (largestRatio) => {
  return colormap({
    colormap: VITE_COLORMAP || DEFAULT_COLORMAP,
    nshades: Math.round(Math.max(9, largestRatio)),
    format: 'hex'
  })
}
