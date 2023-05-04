export const PUBLIC_URL = 'http://example.com/'
export const VITE_LOGO_ALT = 'Alt description for my custom logo'
export const VITE_SHOW_PUBLISH_BTN = false
export const VITE_DEFAULT_COLLECTION = 'collection-name'
export const VITE_STAC_API_URL = 'https://api-endpoint.example.com'
export const VITE_API_MAX_ITEMS = 200
export const VITE_SCENE_TILER_URL = 'https://titiler.example.com'
export const VITE_DASHBOARD_BTN_URL = 'https://dashboard.example.com'
export const VITE_ANALYZE_BTN_URL = 'https://dashboard.example.com'
export const VITE_SCENE_TILER_PARAMS = {
  'sentinel-2-l2a': { assets: ['visual'] },
  'landsat-c2-l2': {
    assets: ['red', 'green', 'blue'],
    color_formula: 'Gamma+RGB+1.7+Saturation+1.7+Sigmoidal+RGB+15+0.35'
  },
  naip: { assets: ['image'], bidx: '1,2,3' },
  'cop-dem-glo-30': {
    assets: ['data'],
    colormap_name: 'terrain',
    rescale: ['-1000,4000']
  },
  'cop-dem-glo-90': {
    assets: ['data'],
    colormap_name: 'terrain',
    rescale: ['-1000,4000']
  },
  'sentinel-1-grd': {
    assets: ['vv'],
    rescale: ['0,250'],
    colormap_name: 'plasma'
  }
}
export const VITE_MOSAIC_TILER_URL = 'https://titiler-mosaic.example.com'
export const VITE_MOSAIC_TILER_PARAMS = {
  'sentinel-2-l2a': { assets: ['visual'] },
  'landsat-c2-l2': {
    assets: ['red'],
    color_formula: 'Gamma+R+1.7+Sigmoidal+R+15+0.35'
  },
  naip: { assets: ['image'], bidx: '1,2,3' },
  'cop-dem-glo-30': {
    assets: ['data'],
    colormap_name: 'terrain',
    rescale: ['-1000,4000']
  },
  'cop-dem-glo-90': {
    assets: ['data'],
    colormap_name: 'terrain',
    rescale: ['-1000,4000']
  },
  'sentinel-1-grd': {
    assets: ['vv'],
    rescale: ['0,250'],
    colormap_name: 'plasma'
  }
}
export const VITE_MOSAIC_MAX_ITEMS = 100
export const VITE_MOSAIC_MIN_ZOOM_LEVEL = 7
export const VITE_MIN_ZOOM_LEVEL = 10
export const VITE_COLORMAP = 'viridis'
export const VITE_SEARCH_MIN_ZOOM_LEVELS = {
  'sentinel-2-l2a': { medium: 4, high: 7 },
  'landsat-c2-l2': { medium: 4, high: 7 },
  naip: { medium: 10, high: 14 },
  'cop-dem-glo-30': { medium: 6, high: 8 },
  'cop-dem-glo-90': { medium: 6, high: 8 },
  'sentinel-1-grd': { medium: 4, high: 7 }
}
export const VITE_APP_NAME = 'App Name'
export const VITE_CF_TEMPLATE_URL = 'https://cf-template.example.com'
export const VITE_LOGO_URL = './logo.png'
