import { GetCollectionQueryablesService } from '../services/get-queryables-service'
import { GetCollectionAggregationsService } from '../services/get-aggregations-service'
import { LoadLocalGridDataService } from '../services/get-local-grid-data-json-service'
import { store } from '../redux/store'
import {
  cartFootprintLayerStyle,
  addDataToLayer,
  clearLayer
} from './mapHelper'

export async function buildCollectionsData(collections) {
  for (const collection of collections.collections) {
    const [queryables, aggregations] = await Promise.all([
      GetCollectionQueryablesService(collection.id),
      GetCollectionAggregationsService(collection.id)
    ])
    collection.queryables = queryables
    collection.aggregations = aggregations
  }

  collections.collections = collections.collections.sort((a, b) =>
    a.id > b.id ? 1 : b.id > a.id ? -1 : 0
  )

  return collections.collections
}

export async function loadLocalGridData() {
  const dataFiles = ['cdem', 'doqq', 'mgrs', 'wrs2']
  dataFiles.map(async function (d) {
    await LoadLocalGridDataService(d)
  })
}

export function isSceneInCart(sceneObject) {
  const cartItems = store.getState().mainSlice.cartItems
  return cartItems.some((cartItem) => cartItem.id === sceneObject.id)
}

export function numberOfSelectedInCart(results) {
  const cartItems = store.getState().mainSlice.cartItems
  return results.reduce((count, result) => {
    if (cartItems.some((cartItem) => cartItem.id === result.id)) {
      return count + 1
    }
    return count
  }, 0)
}

export function areAllScenesSelectedInCart(results) {
  const cartItems = store.getState().mainSlice.cartItems
  return results.every((result) =>
    cartItems.some((cartItem) => cartItem.id === result.id)
  )
}

export function setScenesForCartLayer() {
  if (store.getState().mainSlice.cartItems.length === 0) {
    clearLayer('cartFootprintsLayer')
    return
  }
  const cartGeojson = {
    type: 'FeatureCollection',
    features: store.getState().mainSlice.cartItems
  }
  const options = {
    style: cartFootprintLayerStyle,
    interactive: false
  }
  addDataToLayer(cartGeojson, 'cartFootprintsLayer', options, true)
}

export function processDisplayFieldValues(value) {
  switch (true) {
    case value === null:
    case value === undefined:
      return 'No Data'
    case typeof value === 'boolean':
    case typeof value === 'number':
    case typeof value === 'string':
      return value.toString()
    case Array.isArray(value):
      return value.map(processDisplayFieldValues).join(', ')
    case typeof value === 'object':
      return formatNestedObjectDisplayFieldValues(value)
    default:
      return 'Unsupported Type'
  }
}

function formatNestedObjectDisplayFieldValues(inputObject) {
  function formatValue(value) {
    if (Array.isArray(value)) {
      return `[${value.map(formatValue).join(', ')}]`
    } else if (typeof value === 'object') {
      return `{${formatObject(value)}}`
    } else {
      return value
    }
  }
  function formatObject(obj) {
    return Object.entries(obj)
      .map(([key, value]) => `${key}: ${formatValue(value)}`)
      .join(', ')
  }
  return `${formatObject(inputObject)}`
}
