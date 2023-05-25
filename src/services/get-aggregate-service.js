import { store } from '../redux/store'
import { setSearchLoading } from '../redux/slices/mainSlice'
import { VITE_STAC_API_URL } from '../assets/config'
import {
  addDataToLayer,
  buildHexGridLayerOptions,
  gridCodeLayerStyle
} from '../utils/mapHelper'
import { mapHexGridFromJson, mapGridCodeFromJson } from '../utils/searchHelper'

export async function AggregateSearchService(searchParams, gridType) {
  // get searchType from redux state
  // searchType = scene | grid_code | geohex
  await fetch(`${VITE_STAC_API_URL}/aggregate?${searchParams}`, {
    method: 'GET'
  })
    .then((response) => {
      if (response.ok) {
        return response.json()
      }
      throw new Error()
    })
    .then((json) => {
      let gridFromJson
      let options
      if (gridType === 'hex') {
        gridFromJson = mapHexGridFromJson(json)
        console.log(json)
        options = buildHexGridLayerOptions(gridFromJson.properties.largestRatio)
      } else {
        gridFromJson = mapGridCodeFromJson(json)
        options = {
          style: gridCodeLayerStyle,
          onEachFeature: function (feature, layer) {
            const scenes = feature.properties.frequency > 1 ? 'scenes' : 'scene'
            layer.bindTooltip(
              `${feature.properties.frequency.toString()} <span>${scenes}</span>`,
              {
                permanent: false,
                direction: 'top',
                className: 'tooltip_style',
                interactive: false
              }
            )
          }
        }
      }

      store.dispatch(setSearchLoading(false))
      addDataToLayer(gridFromJson, 'searchResultsLayer', options)
      // set results in redux state
      //   store.dispatch(setClickedOrganizationDetails(json))
    })
    .catch((error) => {
      store.dispatch(setSearchLoading(false))
      const message = 'Error Fetching Search Results'
      // store.dispatch(setClickedOrganizationDetails(null))
      // log full error for diagnosing client side errors if needed
      console.error(message, error)
      //   showApplicationAlert('error', message, 5000)
    })
}
