// retrieve tiler URLs from env variable
export const envTilerURL = process.env.REACT_APP_TILER_URL || ''
export const envMosaicTilerURL = process.env.REACT_APP_MOSAIC_TILER_URL || ''

// function to construct the Titiler tile query parameters from
// REACT_APP_TILER_PARAMS env var
export const constructTilerParams = (collection) => {
  const params = []

  const tilerParams = getTilerParams()

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

  return params.join('&')
}

export const constructMosaicTilerParams = (collection) => {
  // retrieve tiler parameters from env variable
  const tilerParams = getTilerParams()

  const params = []

  const colorFormula = tilerParams[collection]?.mosaic_color_formula
  if (colorFormula) {
    params.push(`color_formula=${colorFormula}`)
  }

  const bidx = tilerParams[collection]?.bidx
  if (bidx) {
    params.push(`bidx=${bidx}`)
  }

  return params.join('&')
}

const getTilerParams = () => {
  try {
    return JSON.parse(process.env.REACT_APP_TILER_PARAMS)
  } catch (e) {
    console.log(`Error parsing tiler params: ${e.message}`)
  }
  return {}
}

const constructAssetsParam = (collection, tilerParams) => {
  const assets = tilerParams[collection]?.assets || []
  if (!assets) {
    console.log(`Assets not defined for ${collection}`)
    return [null, '']
  }
  // titiler accepts multiple `assets` parameters for compositing
  // multiple files, so add extra params here if there's more than
  // one asset specified
  return [assets[0], `assets=${assets.join('&assets=')}`]
}

export const constructMosaicAssetVal = (collection) => {
  const asset = getTilerParams()[collection]?.mosaic_asset || ''
  if (!asset) {
    console.log(`Assets not defined for ${collection}`)
    return null
  } else {
    return asset
  }
}
