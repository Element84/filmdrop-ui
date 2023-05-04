// eslint-disable-next-line import/no-absolute-path
import configEnv from '/public/config.json'

export const MOSAIC_MIN_ZOOM = configEnv.VITE_MOSAIC_MIN_ZOOM_LEVEL || 7
export const APP_NAME = configEnv.VITE_APP_NAME || 'FilmDrop Console'
export const MOSAIC_MAX_ITEMS = configEnv.VITE_MOSAIC_MAX_ITEMS || 100
export const API_MAX_ITEMS = configEnv.VITE_API_MAX_ITEMS || 200
export const DEFAULT_MED_ZOOM = 4
export const DEFAULT_HIGH_ZOOM = 7
export const COLORMAP = configEnv.VITE_COLORMAP || 'viridis'
export const SearchTypes = Object.freeze({
  Scene: Symbol('scene'),
  GridCode: Symbol('gridCode'),
  GridCodeScenes: Symbol('gridCodeScene'),
  GeoHex: Symbol('geoHex')
})
