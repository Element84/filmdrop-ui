// retrieve tiler URLs from env variable
export const envTilerURL = process.env.REACT_APP_TILER_URL || ''
export const envMosaicTilerURL = process.env.REACT_APP_MOSAIC_TILER_URL || ''

// retrieve tiler params from env variables for scene and mosaic
const getTilerParams = () => {
  try {
    return JSON.parse(process.env.REACT_APP_TILER_PARAMS)
  } catch (e) {
    console.log(`Error parsing tiler params: ${e.message}`)
  }
  return {}
}

const getMosaicTilerParams = () => {
  try {
    return JSON.parse(process.env.REACT_APP_MOSAIC_TILER_PARAMS)
  } catch (e) {
    console.log(`Error parsing tiler params: ${e.message}`)
  }
  return {}
}

// construct assets params from env variables for scene and mosaic
const constructAssetsParam = (collection, tilerParams) => {
  const assets = tilerParams[collection]?.assets || []
  if (!assets || assets.length < 1) {
    console.log(`Assets not defined for ${collection}`)
    return [null, '']
  }
  // titiler accepts multiple `assets` parameters for compositing
  // multiple files, so add extra params here if there's more than
  // one asset specified
  return [assets[0], `assets=${assets.join('&assets=')}`]
}
export const constructMosaicAssetVal = (collection) => {
  const asset = getMosaicTilerParams()[collection]?.assets || ''
  if (!asset) {
    console.log(`Assets not defined for ${collection}`)
    return null
  } else {
    return asset.toString()
  }
}

// function to construct the Titiler tile query parameters from
// REACT_APP_TILER_PARAMS env var
export const constructTilerParams = (collection) => {
  // retrieve mosaic tiler parameters from env variable
  const tilerParams = getTilerParams()

  const params = []

  const [asset, assetsParam] = constructAssetsParam(collection, tilerParams)

  params.push(assetsParam)

  const colorFormula = tilerParams[collection]?.color_formula
  if (colorFormula) {
    params.push(`color_formula=${colorFormula}`)
  }

  const bidx = tilerParams[collection]?.bidx
  const assetBidx = asset && bidx ? `${asset}|${bidx}` : null
  if (assetBidx) {
    params.push(`asset_bidx=${assetBidx}`)
  }

  const expression = tilerParams[collection]?.expression
  if (expression) {
    params.push(`expression=${expression}`)
  }

  const rescale = tilerParams[collection]?.rescale
  if (rescale) {
    params.push(`rescale=${rescale}`)
  }

  const colormap = tilerParams[collection]?.colormap_name
  if (colormap) {
    params.push(`colormap_name=${colormap}`)
  }

  return params.join('&')
}

export const constructMosaicTilerParams = (collection) => {
  // retrieve mosaic tiler parameters from env variable
  const tilerParams = getMosaicTilerParams()

  const params = []

  const colorFormula = tilerParams[collection]?.color_formula
  if (colorFormula) {
    params.push(`color_formula=${colorFormula}`)
  }

  const bidx = tilerParams[collection]?.bidx
  if (bidx) {
    params.push(`bidx=${bidx}`)
  }

  const rescale = tilerParams[collection]?.rescale
  if (rescale) {
    params.push(`rescale=${rescale}`)
  }

  const colormap = tilerParams[collection]?.colormap_name
  if (colormap) {
    params.push(`colormap_name=${colormap}`)
  }

  return params.join('&')
}
