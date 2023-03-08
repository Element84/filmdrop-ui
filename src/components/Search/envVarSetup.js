// function to construct the Titiler tile query parameters from
// REACT_APP_TILER_PARAMS env var
export const constructTilerParams = (selectedCollection) => {
  // retrieve tiler parameters from env variable
  let tilerParams = {}
  try {
    tilerParams = JSON.parse(process.env.REACT_APP_TILER_PARAMS)
  } catch (e) {
    console.log(`Error parsing tiler params: ${e.message}`)
  }

  const assets = tilerParams[selectedCollection]?.assets || []
  if (!assets) {
    console.log(`Assets not defined for ${selectedCollection}`)
  }

  // titiler accepts multiple `assets` parameters for compositing
  // multiple files, so add extra params here if there's more than
  // one asset specified
  const assetsStr = assets.join('&assets=')

  const colorFormula = tilerParams[selectedCollection]?.color_formula
  const assetBidx = tilerParams[selectedCollection]?.asset_bidx

  let paramStr = `&assets=${assetsStr}`
  if (colorFormula) {
    paramStr = paramStr + `&color_formula=${colorFormula}`
  }
  if (assetBidx) {
    paramStr = paramStr + `&asset_bidx=${assetBidx}`
  }
  return paramStr
}

// retrieve tiler URLs from env variable
export const envTilerURL = process.env.REACT_APP_TILER_URL || ''
export const envMosaicTilerURL = process.env.REACT_APP_MOSAIC_TILER_URL || ''
