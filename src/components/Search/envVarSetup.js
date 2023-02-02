// function to parse through environment variables
let envVariables = {}
export const processEnvVars = () => {
  let envAssets = ''
  try {
    envAssets = JSON.parse(process.env.REACT_APP_ASSET_CONFIGURATIONS)
  } catch (error) {
    if (error instanceof SyntaxError) {
      console.error('Invalid JSON for assets:', error.message)
    } else {
      throw error
    }
  }

  let envColorFormula = ''
  try {
    envColorFormula = JSON.parse(process.env.REACT_APP_COLOR_FORMULA)
  } catch (error) {
    console.log('Invalid JSON for color formula:', error.message)
  }

  // If env variables include both Assets and Color Formula settings
  if (envAssets && envColorFormula) {
    envVariables = [...[envAssets, envColorFormula].reduce((m, a) => (
      a.forEach(
        o => (m.has(o.collection) && Object.assign(m.get(o.collection), o)) || m.set(o.collection, o)
      // eslint-disable-next-line no-sequences
      ), m), new Map()).values()]
  } else {
    envVariables = envAssets
  }
}

// function to construct the assets and/or color formula portion of the Tiler URL
export const constructAssetsURL = (defaultCollection) => {
  let colorFormula = ''
  let assetsValue = ''
  if (!defaultCollection) defaultCollection = process.env.REACT_APP_DEFAULT_COLLECTION
  if (envVariables) {
    const collectionValues = envVariables.filter(element => element.collection === defaultCollection)[0]
    if (collectionValues) {
      if ('assets' in collectionValues) assetsValue = collectionValues.assets
      if ('color_formula' in collectionValues) colorFormula = collectionValues.color_formula
    }
  }
  return (`&assets=${assetsValue}&color_formula=${colorFormula}&return_mask=true`)
}

// function to retrieve tiler URL from env variable
export const constructTilerURL = () => {
  let tilerConfigurationURL = process.env.REACT_APP_TILER_CONFIGURATION
  if (!tilerConfigurationURL) tilerConfigurationURL = ''
  return (tilerConfigurationURL)
}
