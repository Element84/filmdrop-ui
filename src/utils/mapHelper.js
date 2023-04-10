import { store } from '../redux/store'

const _map = store.getState().mainSlice.map

export function _clearSelectedFootprints() {
  // clear source data for selected
  _map.getSource('selectedFootprint').setData({
    type: 'FeatureCollection',
    features: []
  })
}
