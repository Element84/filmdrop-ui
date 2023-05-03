export const MOSAIC_MIN_ZOOM = import.meta.env.VITE_MOSAIC_MIN_ZOOM_LEVEL || 7
export const APP_NAME = import.meta.env.VITE_APP_NAME || 'FilmDrop Console'
export const MOSAIC_MAX_ITEMS = import.meta.env.VITE_MOSAIC_MAX_ITEMS || 100
export const API_MAX_ITEMS = import.meta.env.VITE_API_MAX_ITEMS || 200
export const DEFAULT_MED_ZOOM = 4
export const DEFAULT_HIGH_ZOOM = 7
export const COLORMAP = import.meta.env.VITE_COLORMAP || 'viridis'
export const SearchTypes = Object.freeze({
  Scene: Symbol('scene'),
  GridCode: Symbol('gridCode'),
  GridCodeScenes: Symbol('gridCodeScene'),
  GeoHex: Symbol('geoHex')
})
