import { store } from '../redux/store'
import { setMappedScenes } from '../redux/slices/mainSlice'
import {
  addDataToLayer,
  clearLayer,
  CLICKED_SCENE_IMAGE_LAYER
} from '../utils/mapLayers'
import { footprintLayerStyle } from '../utils/mapStyles'
import { DEFAULT_MAX_SCENES_RENDERED } from '../constants/defaults'
import { appendStacHeaderCookies } from '../utils/stacRequest'
import {
  normalizeStacErrorResponse,
  normalizeStacNetworkError
} from '../utils/stacErrorHelper'

async function fetchFeatures(url, abortSignal) {
  const contextLabel = 'Error Fetching All Scene Results'
  const requestHeaders = new Headers()
  appendStacHeaderCookies(requestHeaders)
  try {
    const response = await fetch(url, {
      signal: abortSignal,
      headers: requestHeaders,
      credentials:
        store.getState().mainSlice.appConfig.FETCH_CREDENTIALS || 'same-origin'
    })

    if (!response.ok) {
      throw await normalizeStacErrorResponse(response, contextLabel)
    }

    const data = await response.json()
    clearLayer(CLICKED_SCENE_IMAGE_LAYER)

    const features = data.features || []

    const options = {
      style: footprintLayerStyle
    }
    addDataToLayer(features, 'searchResultsLayer', options, false)

    store.dispatch(
      setMappedScenes(store.getState().mainSlice.mappedScenes.concat(features))
    )

    const nextPageLink = data.links.find((link) => link.rel === 'next')
    if (nextPageLink) {
      if (!abortSignal.aborted) {
        if (
          store.getState().mainSlice.mappedScenes.length >=
          DEFAULT_MAX_SCENES_RENDERED
        ) {
          // change this number to increase max number of scenes returned, set to 1000 currently
          return features
        }
        const nextFeatures = await fetchFeatures(nextPageLink.href, abortSignal)
        return features.concat(nextFeatures)
      }
    }

    return features
  } catch (error) {
    const normalizedError =
      error?.error === true
        ? error
        : normalizeStacNetworkError(error, contextLabel)
    console.error(contextLabel, normalizedError)
    throw normalizedError
  }
}

export async function fetchAllFeatures(url, abortSignal) {
  return await fetchFeatures(url, abortSignal)
}
