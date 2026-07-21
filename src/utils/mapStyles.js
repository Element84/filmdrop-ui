import * as L from 'leaflet'
import markerIconUrl from '../assets/marker-icon.png'
import markerShadowUrl from '../assets/marker-shadow.png'
import { getMapGeometryColors } from './themeHelper'

/**
 * Gets the style for search result footprint layers.
 */
export function getFootprintLayerStyle() {
  const colors = getMapGeometryColors()
  return {
    color: colors.searchResult,
    weight: 1,
    opacity: 1,
    fillOpacity: 0.1,
    fillColor: colors.searchResult,
    pane: 'searchResults'
  }
}

/**
 * Gets the style for grid code aggregation layers.
 */
export function getGridCodeLayerStyle() {
  const colors = getMapGeometryColors()
  return {
    color: colors.searchResult,
    weight: 1,
    opacity: 1,
    fillOpacity: 0.1,
    fillColor: colors.searchResult,
    pane: 'searchResults'
  }
}

/**
 * Gets the style for clicked/highlighted scene footprints.
 */
export function getClickedFootprintLayerStyle() {
  const colors = getMapGeometryColors()
  return {
    color: colors.highlighted,
    weight: 4,
    opacity: 0.65,
    fillOpacity: 0,
    pane: 'searchResults'
  }
}

/**
 * Gets the style for cart item footprints.
 */
export function getCartFootprintLayerStyle() {
  const colors = getMapGeometryColors()
  return {
    color: colors.cartItem,
    weight: 3,
    opacity: 1,
    fillOpacity: 0.1,
    fillColor: colors.cartItem,
    pane: 'searchResults'
  }
}

export const customSearchPointIconStyle =
  typeof document !== 'undefined'
    ? L.icon({
        iconSize: [25, 41],
        iconAnchor: [10, 41],
        popupAnchor: [2, -40],
        iconUrl: markerIconUrl,
        shadowUrl: markerShadowUrl
      })
    : null

/**
 * Gets the style for user-drawn line boundaries.
 */
export function getCustomSearchLineStyle() {
  const colors = getMapGeometryColors()
  return {
    color: colors.aoiBoundary,
    weight: 2,
    opacity: 1,
    dashArray: '4, 4',
    dashOffset: '0',
    pane: 'drawPane'
  }
}

/**
 * Gets the style for user-drawn polygon boundaries.
 */
export function getCustomSearchPolygonStyle() {
  const colors = getMapGeometryColors()
  return {
    color: colors.aoiBoundary,
    weight: 2,
    opacity: 1,
    fillOpacity: 0,
    dashArray: '4, 4',
    dashOffset: '0',
    pane: 'drawPane'
  }
}

const hasDom = typeof document !== 'undefined' && typeof window !== 'undefined'
export const footprintLayerStyle = hasDom ? getFootprintLayerStyle() : {}
export const gridCodeLayerStyle = hasDom ? getGridCodeLayerStyle() : {}
export const clickedFootprintLayerStyle = hasDom
  ? getClickedFootprintLayerStyle()
  : {}
export const cartFootprintLayerStyle = hasDom
  ? getCartFootprintLayerStyle()
  : {}
export const customSearchLineStyle = hasDom ? getCustomSearchLineStyle() : {}
export const customSearchPolygonStyle = hasDom
  ? getCustomSearchPolygonStyle()
  : {}
