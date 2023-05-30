import { store } from '../redux/store'
import { setSearchLoading } from '../redux/slices/mainSlice'
import { VITE_MOSAIC_TILER_URL } from '../assets/config'
// import { addDataToLayer, footprintLayerStyle } from '../utils/mapHelper'

export async function AddMosaicService(reqParams) {
  const mosaicTilerURL = VITE_MOSAIC_TILER_URL || ''
  await fetch(`${mosaicTilerURL}/mosaicjson/mosaics`, reqParams)
    .then((response) => {
      if (response.ok) {
        return response.json()
      }
      throw new Error()
    })
    .then((json) => {
      console.log('worked')
      store.dispatch(setSearchLoading(false))
      // TODO: build mosaic layer and add to map here
      //
      // if (typeOfSearch === 'scene') {
      //   store.dispatch(setSearchResults(json))
      //   const options = {
      //     style: footprintLayerStyle
      //   }
      //   store.dispatch(setSearchLoading(false))
      //   addDataToLayer(json, 'searchResultsLayer', options)
      // } else {
      //   store.dispatch(setSearchLoading(false))
      //   store.dispatch(setClickResults(json.features))
      //   store.dispatch(setShowPopupModal(true))
      // }
    })
    .catch((error) => {
      store.dispatch(setSearchLoading(false))
      const message = 'Error Fetching Search Results'
      // log full error for diagnosing client side errors if needed
      console.error(message, error)
      //   showApplicationAlert('error', message, 5000)
    })
}
