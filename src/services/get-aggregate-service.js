import { store } from '../redux/store'
import { setSearchLoading, setSearchResults } from '../redux/slices/mainSlice'
import {
  addDataToLayer,
  buildHexGridLayerOptions,
  gridCodeLayerStyle
} from '../utils/mapHelper'
import { mapHexGridFromJson, mapGridCodeFromJson } from '../utils/searchHelper'

export async function AggregateSearchService(searchParams, gridType) {
  await fetch(
    `${
      store.getState().mainSlice.appConfig.STAC_API_URL
    }/aggregate?${searchParams}`,
    {
      method: 'GET'
    }
  )
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
        store.dispatch(setSearchResults(gridFromJson))
        options = buildHexGridLayerOptions(gridFromJson.properties.largestRatio)
      } else {
        gridFromJson = mapGridCodeFromJson(json)
        store.dispatch(setSearchResults(gridFromJson))
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
            layer.on('mouseout', function (e) {
              const map = store.getState().mainSlice.map
              map.eachLayer(function (layer) {
                if (layer.getTooltip()) {
                  layer.closeTooltip()
                }
              })
            })
          }
        }
      }

      store.dispatch(setSearchLoading(false))
      addDataToLayer(gridFromJson, 'searchResultsLayer', options, true)
    })
    .catch((error) => {
      store.dispatch(setSearchLoading(false))
      const message = 'Error Fetching Aggregate Search Results'
      // log full error for diagnosing client side errors if needed
      console.error(message, error)
    })
}
