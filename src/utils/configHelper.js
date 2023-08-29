import { DEFAULT_APP_NAME } from '../components/defaults'
import { store } from '../redux/store'
import { DoesFaviconExistService } from '../services/get-config-service'
import { setappName } from '../redux/slices/mainSlice'

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

export function InitializeAppFromConfig() {
  loadAppTitle()
  loadAppFavicon()
}

// exports for testing purposes
export { loadAppTitle, loadAppFavicon }
