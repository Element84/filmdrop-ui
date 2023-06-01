import { store } from '../redux/store'
import { setSearchLoading } from '../redux/slices/mainSlice'
import { VITE_MOSAIC_TILER_URL } from '../assets/config'
import { addMosaicLayer } from '../utils/mapHelper'

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
      addMosaicLayer(json)
    })
    .catch((error) => {
      store.dispatch(setSearchLoading(false))
      const message = 'Error Fetching Mosaic'
      // log full error for diagnosing client side errors if needed
      console.error(message, error)
      //   showApplicationAlert('error', message, 5000)
    })
}
