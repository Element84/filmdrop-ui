export const DEFAULT_MOSAIC_MIN_ZOOM = 7
export const DEFAULT_MOSAIC_MAX_ITEMS = 100
export const DEFAULT_API_MAX_ITEMS = 200
export const DEFAULT_MED_ZOOM = 4
export const DEFAULT_HIGH_ZOOM = 7
export const DEFAULT_COLORMAP = 'viridis'
export const DEFAULT_APP_NAME = 'FilmDrop Console'
export const DEFAULT_MAX_SCENES_RENDERED = 1000
export const DEFAULT_MAP_CENTER = [30, 0]
export const DEFAULT_MAP_ZOOM = 3
// sets default date range (current minus 24hrs * 60min * 60sec * 1000ms per day * 14 days)
const twoWeeksAgo = new Date(Date.now() - 24 * 60 * 60 * 1000 * 14)
export const DEFAULT_DATE_RANGE = [twoWeeksAgo, new Date()]
