// function to construct the assets and/or color formula portion of the Tiler URL
export const constructAssetsURL = (selectedCollection) => {
  let colorFormula = ''
  let assetsValue = ''

  // retrieve tiler parameters from env variable
  let tilerParams = {}
  try {
    tilerParams = JSON.parse(process.env.REACT_APP_TILER_PARAMS)
  } catch (e) {
    console.log(e.message)
  }

  if (tilerParams) {
    assetsValue = tilerParams[selectedCollection]?.assets || ''
    if (assetsValue.length > 1) {
      assetsValue = assetsValue.join('&assets=')
    }
    colorFormula = tilerParams[selectedCollection]?.color_formula || ''
  }
  return `&assets=${assetsValue}&color_formula=${colorFormula}`
}

// retrieve tiler URL from env variable
export const envTilerURL = process.env.REACT_APP_TILER_URL || ''
