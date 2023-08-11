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
  addDataToLayer(cartGeojson, 'cartFootprintsLayer', options)
}

export function processDisplayFieldValues(value) {
  if (typeof value === 'boolean') {
    return value.toString()
  } else if (Array.isArray(value)) {
    return value.map(processDisplayFieldValues).join(', ') // Process each item in the array
  } else if (typeof value === 'number') {
    return value.toString()
  } else if (typeof value === 'string') {
    return value
  } else if (typeof value === 'object' && value !== null) {
    const processedObject = {}
    for (const key in value) {
      processedObject[key] = processDisplayFieldValues(value[key])
    }
    return processedObject
  } else {
    return 'Unsupported Type'
  }
}
