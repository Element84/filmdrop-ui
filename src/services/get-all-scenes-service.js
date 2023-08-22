import { store } from '../redux/store'
import { setmappedScenes } from '../redux/slices/mainSlice'
import {
  addDataToLayer,
  footprintLayerStyle,
  clearLayer
} from '../utils/mapHelper'
import { DEFAULT_MAX_SCENES_RENDERED } from '../components/defaults'

async function fetchFeatures(url, abortSignal) {
  const response = await fetch(url, { signal: abortSignal })
  const data = await response.json()
  clearLayer('clickedSceneImageLayer')

  const features = data.features || []

  const options = {
    style: footprintLayerStyle
  }
  addDataToLayer(features, 'searchResultsLayer', options, false)

  store.dispatch(
    setmappedScenes(store.getState().mainSlice.mappedScenes.concat(features))
  )

  const nextPageLink = data.links.find((link) => link.rel === 'next')
  if (nextPageLink) {
    if (!abortSignal.aborted) {
      if (
        store.getState().mainSlice.mappedScenes.length >=
        DEFAULT_MAX_SCENES_RENDERED
      ) {
        // change this number to increase max number of scenes returned, set to 1000 currently
        return
      }
      const nextFeatures = await fetchFeatures(nextPageLink.href, abortSignal)
      return features.concat(nextFeatures)
    }
  }
}

export async function fetchAllFeatures(url, abortSignal) {
  return await fetchFeatures(url, abortSignal)
}
