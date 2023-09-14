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
      !store.getState().mainSlice.appConfig.LAYER_LIST_SERVICES
    ) {
      throw new Error(
        'Invalid configuration format: LAYER_LIST_SERVICES is missing.'
      )
    }
    return store
      .getState()
      .mainSlice.appConfig.LAYER_LIST_SERVICES.flatMap((service) => {
        if (!service.layers || !Array.isArray(service.layers)) {
          throw new Error(
            `Invalid configuration format for service '${service.name}': 'layers' is missing or not an array.`
          )
        }

        return service.layers
          .map((layer) => {
            if (!layer.name) {
              throw new Error(
                `Invalid configuration format for layer in service '${service.name}': 'name' is missing.`
              )
            }

            const validCRS = ['EPSG:4326', 'EPSG:3857']
            const shouldAddLayer = !layer.crs || validCRS.includes(layer.crs)

            if (shouldAddLayer) {
              return {
                combinedLayerName: `${service.name.replace(
                  / /g,
                  '_'
                )}_${layer.name.replace(/ /g, '_')}`,
                layerName: layer.name,
                layerAlias: layer.alias || layer.name,
                visibility: layer.default_visibility || false,
                crs: layer.crs || 'EPSG:3857',
                url: service.url,
                type: service.type
              }
            }

            console.error(
              'Error adding layer: ' +
                `${service.name.replace(/ /g, '_')}_${layer.name.replace(
                  / /g,
                  '_'
                )}` +
                ': unsupported crs'
            )
            return null // Skip adding the layer if error
          })
          .filter((layer) => layer !== null) // Filter out null layers
      })
  } catch (error) {
    console.error('Error loading reference layers', error.message)
    showApplicationAlert('error', 'Error loading reference layers', 5000)
    return []
  }
}

async function loadReferenceLayers() {
  if (
    !store.getState().mainSlice.appConfig.LAYER_LIST_SERVICES ||
    !store.getState().mainSlice.appConfig.LAYER_LIST_ENABLED
  ) {
    return
  }
  const LayerListFromConfig = await parseLayerListConfig()
  if (LayerListFromConfig.length === 0) {
    return
  }

  store.dispatch(setreferenceLayers(LayerListFromConfig))
}

export function InitializeAppFromConfig() {
  loadAppTitle()
  loadAppFavicon()
  loadReferenceLayers()
}

// exports for testing purposes
export { loadAppTitle, loadAppFavicon }
