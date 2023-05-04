import {
  VITE_MOSAIC_TILER_PARAMS,
  VITE_SCENE_TILER_PARAMS,
  VITE_MOSAIC_TILER_URL,
  VITE_SCENE_TILER_URL
  // eslint-disable-next-line import/no-absolute-path
} from '/config.js'

// retrieve tiler URLs from env variable
export const envSceneTilerURL = VITE_SCENE_TILER_URL || ''
export const envMosaicTilerURL = VITE_MOSAIC_TILER_URL || ''

// reusable variables
const envSceneTilerParams = VITE_SCENE_TILER_PARAMS || ''
const envMosaicTilerParams = VITE_MOSAIC_TILER_PARAMS || ''

// retrieve tiler params from env variables for scene and mosaic
export const getTilerParams = (configVariable) => {
  try {
    return JSON.parse(JSON.stringify(configVariable))
  } catch (e) {
    console.log(`Error parsing tiler params: ${e.message}`)
  }
  return {}
}

// construct assets params from env variables for scene mode
const constructSceneAssetsParam = (collection, tilerParams) => {
  const assets = tilerParams[collection]?.assets || ''
  if (!assets) {
    console.log(`Assets not defined for ${collection}`)
    return [null, '']
  }
  // titiler accepts multiple `assets` parameters for compositing
  // multiple files, so add extra params here if there's more than
  // one asset specified
  return [assets[0], `assets=${assets.join('&assets=')}`]
}

// construct assets params from env variables for mosaic mode
export const constructMosaicAssetVal = (collection) => {
  const asset = getTilerParams(envMosaicTilerParams)[collection]?.assets || ''
  if (!asset) {
    console.log(`Assets not defined for ${collection}`)
    return null
  } else {
    return asset.pop()
  }
}

// method to construct tiler parameter values for scene and mosaic
const parameters = {
  colorFormula: (tilerParams, collection) => {
    const value = tilerParams[collection]?.color_formula
    return value && `color_formula=${value}`
  },
  expression: (tilerParams, collection) => {
    const value = tilerParams[collection]?.expression
    return value && `expression=${value}`
  },
  rescale: (tilerParams, collection) => {
    const value = tilerParams[collection]?.rescale
    return value && `rescale=${value}`
  },
  colormapName: (tilerParams, collection) => {
    const value = tilerParams[collection]?.colormap_name
    return value && `colormap_name=${value}`
  },
  bidx: (tilerParams, collection, asset) => {
    const value = tilerParams[collection]?.bidx
    // for scene tiler
    if (asset) {
      const assetBidx = asset && value ? `${asset}|${value}` : null
      return assetBidx && `asset_bidx=${assetBidx}`
    } else {
      return value && `bidx=${value}`
    }
  }
}

// function to construct the Titiler tile query parameters from
// VITE_SCENE_TILER_PARAMS env var
export const constructSceneTilerParams = (collection) => {
  // retrieve mosaic tiler parameters from env variable
  const tilerParams = getTilerParams(envSceneTilerParams)

  const params = []

  const [asset, assetsParam] = constructSceneAssetsParam(
    collection,
    tilerParams
  )

  params.push(assetsParam)

  const assetBidx = parameters.bidx(tilerParams, collection, asset)
  if (assetBidx) params.push(assetBidx)

  const colorFormula = parameters.colorFormula(tilerParams, collection)
  if (colorFormula) params.push(colorFormula)

  const expression = parameters.expression(tilerParams, collection)
  if (expression) params.push(expression)

  const rescale = parameters.rescale(tilerParams, collection)
  if (rescale) params.push(rescale)

  const colormapName = parameters.colormapName(tilerParams, collection)
  if (colormapName) params.push(colormapName)

  return params.join('&')
}

// function to construct the Titiler tile query parameters from
// VITE_MOSAIC_TILER_PARAMS env var
export const constructMosaicTilerParams = (collection) => {
  // retrieve mosaic tiler parameters from env variable
  const tilerParams = getTilerParams(envMosaicTilerParams)

  const params = []

  const bidx = parameters.bidx(tilerParams, collection)
  if (bidx) params.push(bidx)

  const colorFormula = parameters.colorFormula(tilerParams, collection)
  if (colorFormula) params.push(colorFormula)

  const expression = parameters.expression(tilerParams, collection)
  if (expression) params.push(expression)

  const rescale = parameters.rescale(tilerParams, collection)
  if (rescale) params.push(rescale)

  const colormapName = parameters.colormapName(tilerParams, collection)
  if (colormapName) params.push(colormapName)

  return params.join('&')
}
