import {
  VITE_COLORMAP,
  VITE_API_MAX_ITEMS,
  VITE_MOSAIC_MAX_ITEMS,
  VITE_APP_NAME,
  VITE_MOSAIC_MIN_ZOOM_LEVEL
  // eslint-disable-next-line import/no-absolute-path
} from '/public/config.js'

export const MOSAIC_MIN_ZOOM = VITE_MOSAIC_MIN_ZOOM_LEVEL || 7
export const APP_NAME = VITE_APP_NAME || 'FilmDrop Console'
export const MOSAIC_MAX_ITEMS = VITE_MOSAIC_MAX_ITEMS || 100
export const API_MAX_ITEMS = VITE_API_MAX_ITEMS || 200
export const DEFAULT_MED_ZOOM = 4
export const DEFAULT_HIGH_ZOOM = 7
export const COLORMAP = VITE_COLORMAP || 'viridis'
export const SearchTypes = Object.freeze({
  Scene: Symbol('scene'),
  GridCode: Symbol('gridCode'),
  GridCodeScenes: Symbol('gridCodeScene'),
  GeoHex: Symbol('geoHex')
})
