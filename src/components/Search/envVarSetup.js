// retrieve tiler URLs from env variable
export const envTilerURL = process.env.REACT_APP_TILER_URL || ''
export const envMosaicTilerURL = process.env.REACT_APP_MOSAIC_TILER_URL || ''

// function to construct the Titiler tile query parameters from
// REACT_APP_TILER_PARAMS env var
export const constructTilerParams = (selectedCollection) => {
  let paramStr = ''

  // retrieve tiler parameters from env variable
  const tilerParams = getTilerParams()
  const assets = constructAssetsParam(selectedCollection, tilerParams)
  paramStr = paramStr + `&assets=${assets}`

  const colorFormula = tilerParams[selectedCollection]?.color_formula
  if (colorFormula) {
    paramStr = paramStr + `&color_formula=${colorFormula}`
  }

  const bidx = tilerParams[selectedCollection]?.bidx
  const assetBidx = assets && bidx ? `${assets}|${bidx}` : null
  if (assetBidx) {
    paramStr = paramStr + `&asset_bidx=${assetBidx}`
  }
  return paramStr
}

export const constructMosaicTilerParams = (selectedCollection) => {
  // retrieve tiler parameters from env variable
  const tilerParams = getTilerParams()

  let paramStr = ''

  const colorFormula = tilerParams[selectedCollection]?.color_formula
  if (colorFormula) {
    paramStr = paramStr + `&color_formula=${colorFormula}`
  }

  const bidx = tilerParams[selectedCollection]?.bidx
  if (bidx) {
    paramStr = paramStr + `&bidx=${bidx}`
  }
  return paramStr
}

const getTilerParams = () => {
  try {
    return JSON.parse(process.env.REACT_APP_TILER_PARAMS)
  } catch (e) {
    console.log(`Error parsing tiler params: ${e.message}`)
  }
  return {}
}

export const constructAssetsParam = (selectedCollection, tilerParams) => {
  if (!tilerParams) {
    tilerParams = getTilerParams()
  }
  const assets = tilerParams[selectedCollection]?.assets || []
  if (!assets) {
    console.log(`Assets not defined for ${selectedCollection}`)
  }
  // titiler accepts multiple `assets` parameters for compositing
  // multiple files, so add extra params here if there's more than
  // one asset specified
  const assetsStr = assets.join('&assets=')
  return assetsStr
}
