import { store } from '../redux/store'
import { setSearchLoading, setMosaicCache } from '../redux/slices/mainSlice'
import { addMosaicLayer } from '../utils/mapHelper'
import {
  normalizeStacErrorResponse,
  normalizeStacNetworkError
} from '../utils/stacErrorHelper'

const DEFAULT_MOSAIC_ERROR_SUMMARY = 'Error Fetching Mosaic'

export async function AddMosaicService(
  reqParams,
  cacheMetadata,
  contextLabel = DEFAULT_MOSAIC_ERROR_SUMMARY,
  signal
) {
  const mosaicTilerURL = store.getState().mainSlice.appConfig.MOSAIC_TILER_URL
  const fetchInit = signal ? { ...reqParams, signal } : reqParams
  try {
    const response = await fetch(
      `${mosaicTilerURL}/mosaicjson/mosaics`,
      fetchInit
    )

    if (!response.ok) {
      const normalizedError = await normalizeStacErrorResponse(
        response,
        contextLabel
      )
      store.dispatch(setSearchLoading(false))
      console.error(contextLabel, normalizedError)
      return normalizedError
    }

    const json = await response.json()
    addMosaicLayer(json)
    if (cacheMetadata) {
      store.dispatch(
        setMosaicCache({
          lastMosaicRequestSignature: cacheMetadata.signature,
          lastMosaicTopItemIds: cacheMetadata.topItemIds,
          lastMosaicCompareCount: cacheMetadata.compareCount
        })
      )
    }
    return undefined
  } catch (error) {
    if (error?.name === 'AbortError') {
      store.dispatch(setSearchLoading(false))
      return undefined
    }
    const normalizedError = normalizeStacNetworkError(error, contextLabel)
    store.dispatch(setSearchLoading(false))
    console.error(contextLabel, normalizedError)
    return normalizedError
  }
}
