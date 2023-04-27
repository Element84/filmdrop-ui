import { getTilerParams } from './envVarSetup'
import { DEFAULT_MED_ZOOM, DEFAULT_HIGH_ZOOM, SearchTypes } from '../defaults'

export const setSearchType = (
  zoomLevelRef,
  selectedCollectionRef,
  fullCollectionDataRef
) => {
  // Setup Zoom levels from ENV VARIABLES
  const mediumZoom =
    getTilerParams('REACT_APP_SEARCH_MIN_ZOOM_LEVELS')[
      selectedCollectionRef.current
    ]?.medium || DEFAULT_MED_ZOOM
  const highZoom =
    getTilerParams('REACT_APP_SEARCH_MIN_ZOOM_LEVELS')[
      selectedCollectionRef.current
    ]?.high || DEFAULT_HIGH_ZOOM

  // Setup collection values for different searches
  const thisCollection = fullCollectionDataRef.current?.find(
    (el) => el.id === selectedCollectionRef.current
  )
  const geoHexSearch = thisCollection.queryables?.grid_geohex_frequency
  const gridCodeSearch = thisCollection.queryables?.grid_code_frequency
  const gridCodeLandsatSearch =
    thisCollection.queryables?.grid_code_landsat_frequency

  let typeOfSearch = SearchTypes.Scene
  let zoomLevelNeeded = null
  if (zoomLevelRef.current < mediumZoom) {
    // Low Zoom Level - Geo Hex Aggregated Results View
    if (geoHexSearch) {
      typeOfSearch = SearchTypes.GeoHex
    } else if (gridCodeSearch) {
      zoomLevelNeeded = mediumZoom
      typeOfSearch = null
    } else if (gridCodeLandsatSearch) {
      zoomLevelNeeded = mediumZoom
      typeOfSearch = null
    } else {
      zoomLevelNeeded = highZoom
      typeOfSearch = null
    }
  } else if (
    zoomLevelRef.current >= mediumZoom &&
    zoomLevelRef.current < highZoom
  ) {
    // Medium Zoom Level - Grid Code Aggregated Results View
    if (gridCodeSearch) {
      typeOfSearch = SearchTypes.GridCode
    } else if (gridCodeLandsatSearch) {
      typeOfSearch = SearchTypes.GridCode
    } else {
      zoomLevelNeeded = highZoom
      typeOfSearch = null
    }
  } else if (zoomLevelRef.current >= highZoom) {
    // High Zoom Level - Scene View
    typeOfSearch = SearchTypes.Scene
  }

  return { typeOfSearch, zoomLevelNeeded }
}
