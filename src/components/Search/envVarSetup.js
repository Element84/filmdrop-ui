// function to parse through environment variables
const processEnvVars = () => {
  // grab the asset variable
  let assetObj = ''
  try {
    assetObj = JSON.parse(process.env.REACT_APP_TILER_ASSETS)
  } catch (e) {
    console.log(e.message)
  }
  // grab the color formula variable
  let colorFormulaObj = ''
  try {
    colorFormulaObj = JSON.parse(process.env.REACT_APP_TILER_COLOR_FORMULAS)
  } catch (e) {
    console.log(e.message)
  }

  // combine assets and color formulas into one object
  let map = assetObj
  if (assetObj && colorFormulaObj) {
    map = assetObj.map((item, i) => {
      if (colorFormulaObj) {
        // eslint-disable-next-line array-callback-return
        colorFormulaObj.map((colorItem, i) => {
          if (colorItem.collection === item.collection) return (item.color_formula = colorItem.color_formula)
        })
      }
      return item
    })
  }

  // setup object with collection as keys
  const formattedData = map.reduce(
    (obj, { collection, ...rest }) =>
      Object.assign(obj, {
        [collection]: {
          ...rest
        }
      }),
    {}
  )
  return formattedData
}

const envVariables = processEnvVars()

// function to construct the assets and/or color formula portion of the Tiler URL
export const constructAssetsURL = (defaultCollection) => {
  let colorFormula = ''
  let assetsValue = ''
  if (!defaultCollection) defaultCollection = process.env.REACT_APP_DEFAULT_COLLECTION

  if (envVariables) {
    try {
      assetsValue = envVariables[defaultCollection].assets || ''
    } catch (e) {
      console.log(e.message)
    }
    try {
      colorFormula = envVariables[defaultCollection].color_formula || ''
    } catch (e) {
      console.log(e.message)
    }
  }

  return `&assets=${assetsValue}&color_formula=${colorFormula}&return_mask=true`
}

// function to retrieve tiler URL from env variable
export const constructTilerURL = () => {
  return process.env.REACT_APP_TILER_CONFIGURATION || ''
}
