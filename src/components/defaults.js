export const DEFAULT_MOSAIC_MAX_ITEMS = 100
// Top N item IDs used for mosaic cache comparison only (not mosaic creation limit).
export const DEFAULT_MOSAIC_TOP_COMPARE_ITEMS = 100
export const DEFAULT_API_MAX_ITEMS = 200
export const DEFAULT_SCENE_MIN_ZOOM = 7
export const DEFAULT_MAP_ZOOM_MAX = 18
export const DEFAULT_COLORMAP = 'viridis'
export const DEFAULT_APP_NAME = 'FilmDrop UI'
export const DEFAULT_MAX_SCENES_RENDERED = 1000
export const DEFAULT_MAP_CENTER = [30, 0]
export const DEFAULT_MAP_ZOOM = 3
export const DEFAULT_BASEMAP = {
  url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
  attribution:
    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}
// UI feature flags - changing defaults to true for better out-of-box experience
export const DEFAULT_THEME_SWITCHING_ENABLED = true
export const DEFAULT_EXPORT_ENABLED = true
export const DEFAULT_SHOW_ITEM_AUTO_ZOOM = true
export const DEFAULT_STAC_LINK_ENABLED = true
export const DEFAULT_STAC_LINKS_SECTION_ENABLED = true
export const DEFAULT_RIGHT_SIDEBAR_ENABLED = false
// sets default date range (current minus 24hrs * 60min * 60sec * 1000ms per day * 14 days)
const twoWeeksAgo = new Date(Date.now() - 24 * 60 * 60 * 1000 * 14)
export const DEFAULT_DATE_RANGE = [
  twoWeeksAgo.toISOString(),
  new Date().toISOString()
]
export const DEFAULT_TILE_LAYER_PARAMS = {
  tileSize: 256,
  pane: 'imagery'
}
