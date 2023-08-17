import { store } from '../redux/store'
import { setmappedScenes } from '../redux/slices/mainSlice'
import { addDataToLayer, footprintLayerStyle } from '../utils/mapHelper'

// export async function FetchAllScenesService(searchParams, typeOfSearch) {
//   await fetch(
//     `${
//       store.getState().mainSlice.appConfig.STAC_API_URL
//     }/search?${searchParams}`,
//     {
//       method: 'GET'
//     }
//   )
//     .then((response) => {
//       if (response.ok) {
//         return response.json()
//       }
//       throw new Error()
//     })
//     .then((json) => {
//       if (typeOfSearch === 'scene') {
//         store.dispatch(setSearchResults(json))
//         console.log(json.links[0].href)
//         const options = {
//           style: footprintLayerStyle
//         }
//         store.dispatch(setSearchLoading(false))
//         addDataToLayer(json, 'searchResultsLayer', options)
//       } else {
//         store.dispatch(setSearchLoading(false))
//         store.dispatch(setClickResults(json.features))
//         store.dispatch(setShowPopupModal(true))
//       }
//     })
//     .catch((error) => {
//       store.dispatch(setSearchLoading(false))
//       const message = 'Error Fetching All Search Results'
//       // log full error for diagnosing client side errors if needed
//       console.error(message, error)
//     })
// }

// const apiUrl =
//   'https://earth-search.aws.element84.com/v1/search?datetime=2020-08-01T00%3A00%3A00Z%2F2023-08-15T23%3A59%3A59.999Z&limit=200&collections=sentinel-2-l2a&bbox=-80.68634033203126,37.05956083025126,-75.41290283203126,37.88569271818349&query=%7B%22eo%3Acloud_cover%22%3A%7B%22gte%22%3A0%2C%22lte%22%3A30%7D%7D'

async function fetchFeatures(url, abortSignal) {
  const response = await fetch(url, { signal: abortSignal })
  const data = await response.json()

  // if mappedScenes >= 1000, return

  const features = data.features || []

  console.log('Fetched features:', features)
  const options = {
    style: footprintLayerStyle
  }
  addDataToLayer(features, 'searchResultsLayer', options, false)

  store.dispatch(
    setmappedScenes(store.getState().mainSlice.mappedScenes.concat(features))
  )
  console.log('total feched:', store.getState().mainSlice.mappedScenes.length)

  const nextPageLink = data.links.find((link) => link.rel === 'next')
  if (nextPageLink) {
    if (!abortSignal.aborted) {
      if (store.getState().mainSlice.mappedScenes.length >= 1000) {
        return
      }
      const nextFeatures = await fetchFeatures(nextPageLink.href, abortSignal)
      return features.concat(nextFeatures)
      // push to mappedScenes array
    }
  }
}

export async function fetchAllFeatures(url, abortSignal) {
  return await fetchFeatures(url, abortSignal)
}

// const apiUrl = "https://earth-search.aws.element84.com/v1/search?datetime=2023-08-01T00%3A00%3A00Z%2F2023-08-15T23%3A59%3A59.999Z&limit=200&collections=sentinel-2-l2a&bbox=-80.68634033203126,37.05956083025126,-75.41290283203126,37.88569271818349&query=%7B%22eo%3Acloud_cover%22%3A%7B%22gte%22%3A0%2C%22lte%22%3A30%7D%7D";

// Example of canceling the fetch after 5 seconds (you can replace this with a user interaction)
// setTimeout(() => {

// }, 5000);
