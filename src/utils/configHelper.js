import { DEFAULT_APP_NAME } from '../components/defaults'
import { store } from '../redux/store'
import { DoesFaviconExistService } from '../services/get-config-service'
import { setappName, setreferenceLayers } from '../redux/slices/mainSlice'
import { showApplicationAlert } from './alertHelper'

function loadAppTitle() {
  if (!store.getState().mainSlice.appConfig.APP_NAME) {
    document.title = DEFAULT_APP_NAME
    store.dispatch(setappName(DEFAULT_APP_NAME))
    return
  }
  document.title = store.getState().mainSlice.appConfig.APP_NAME
  store.dispatch(setappName(store.getState().mainSlice.appConfig.APP_NAME))
}

async function loadAppFavicon() {
  if (!store.getState().mainSlice.appConfig.APP_FAVICON) {
    return
  }
  const doesFaviconFileExist = await DoesFaviconExistService()
  if (!doesFaviconFileExist) {
    return
  }
  if (
    store
      .getState()
      .mainSlice.appConfig.APP_FAVICON.toLowerCase()
      .endsWith('.png') ||
    store
      .getState()
      .mainSlice.appConfig.APP_FAVICON.toLowerCase()
      .endsWith('.ico')
  ) {
    const faviconFromConfig =
      '/config/' +
      store.getState().mainSlice.appConfig.APP_FAVICON +
      `?_cb=${Date.now()}`
    const newFaviconLink = document.querySelector("link[rel~='icon']")
    newFaviconLink.href = faviconFromConfig
  }
}

async function parseLayerListConfig(config) {
  try {
    if (
      !store.getState().mainSlice.appConfig ||
      !store.getState().mainSlice.appConfig.Layer_List_Services
    ) {
      throw new Error(
        'Invalid configuration format: Layer_List_Services is missing.'
      )
    }
    return store
      .getState()
      .mainSlice.appConfig.Layer_List_Services.flatMap((service) => {
        if (!service.layers || !Array.isArray(service.layers)) {
          throw new Error(
            `Invalid configuration format for service '${service.name}': 'layers' is missing or not an array.`
          )
        }

        return service.layers.map((layer) => {
          if (!layer.name) {
            throw new Error(
              `Invalid configuration format for layer in service '${service.name}': 'name' is missing.`
            )
          }

          return {
            layerName: `${service.name.replace(/ /g, '_')}_${layer.name.replace(
              / /g,
              '_'
            )}`,
            layerAlias: layer.alias || layer.name,
            visibility: layer.default_visibility || false
          }
        })
      })
  } catch (error) {
    console.error('Error loading reference layers', error.message)
    showApplicationAlert('error', 'Error loading reference layers', 5000)
    return []
  }
}

async function loadReferenceLayers() {
  if (
    !store.getState().mainSlice.appConfig.Layer_List_Services ||
    !store.getState().mainSlice.appConfig.Layer_List_Enabled
  ) {
    return
  }
  const LayerListFromConfig = await parseLayerListConfig()
  if (LayerListFromConfig.length === 0) {
    return
  }

  console.log(LayerListFromConfig)
  // set refLayer in redux store
  store.dispatch(setreferenceLayers(LayerListFromConfig))

  // call function to add reference layers to map from mapHelper
}

export function InitializeAppFromConfig() {
  loadAppTitle()
  loadAppFavicon()
  loadReferenceLayers()
}

// exports for testing purposes
export { loadAppTitle, loadAppFavicon }
