import { DEFAULT_COLORMAP } from '../components/defaults'
import colormap from 'colormap'
import { store } from '../redux/store'

export const colorMap = (largestRatio) => {
  return colormap({
    colormap:
      store.getState().mainSlice.appConfig.CONFIG_COLORMAP || DEFAULT_COLORMAP,
    nshades: Math.round(Math.max(9, largestRatio)),
    format: 'hex'
  })
}
