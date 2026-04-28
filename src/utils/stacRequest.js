import Cookies from 'js-cookie'
import { store } from '../redux/store'

export function buildStacRequestHeaders() {
  const requestHeaders = new Headers()
  const JWT = localStorage.getItem('APP_AUTH_TOKEN')
  const isSTACTokenAuthEnabled =
    store.getState().mainSlice.appConfig.APP_TOKEN_AUTH_ENABLED ?? false
  if (JWT && isSTACTokenAuthEnabled) {
    requestHeaders.append('Authorization', `Bearer ${JWT}`)
  }
  appendStacHeaderCookies(requestHeaders)
  return requestHeaders
}

// STAC_HEADER_COOKIES config can define cookies whose values we want to
// include in STAC API request headers. if any exist, append them to the
// request headers
export function appendStacHeaderCookies(requestHeaders, config = null) {
  const appConfig = config ?? store.getState().mainSlice?.appConfig
  const headerArr = appConfig?.STAC_HEADER_COOKIES ?? []

  if (headerArr.length > 0) {
    const cooks = getStacCookies(headerArr)
    cooks.forEach((el) => {
      requestHeaders.append(
        el.headerName,
        `${el.headerValPrefix}${el.headerValMain}`
      )
    })
  }
}

function getStacCookies(headerArr) {
  const ret = []

  headerArr.forEach((el) => {
    if (!el.header_name?.trim() || !el.cookie_name?.trim()) {
      console.warn('Invalid STAC_HEADER_COOKIES config:', el)
      return
    }

    const val = Cookies.get(el.cookie_name)
    if (val) {
      const x = {
        headerName: el.header_name,
        headerValPrefix:
          el.header_val_prefix === null ? '' : el.header_val_prefix,
        headerValMain: val
      }
      ret.push(x)
    }
  })

  return ret
}
