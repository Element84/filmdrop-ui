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
  let itemInCart = false
  store.getState().mainSlice.cartItems.forEach((cartItem) => {
    if (cartItem.id === sceneObject.id) {
      itemInCart = true
    }
  })
  return itemInCart
}

export function numberOfSelectedInCart(results) {
  let count = 0
  results.forEach((result) => {
    const sceneInCart = isSceneInCart(result)
    if (sceneInCart) {
      count++
    }
  })
  return count
}

export function areAllScenesSelectedInCart(results) {
  let allInCart = true
  results.forEach((result) => {
    const sceneInCart = isSceneInCart(result)
    if (!sceneInCart) {
      allInCart = false
    }
  })
  return allInCart
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
