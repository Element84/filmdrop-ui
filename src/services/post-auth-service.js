import { store } from '../redux/store'
import {
  setAuthTokenExists,
  clearApplicationAlert
} from '../redux/slices/mainSlice'
import { setAuthToken } from '../utils/authHelper'
import { showApplicationAlert } from '../utils/alertHelper'
import { getActiveRouter } from '../router'

/**
 * Prefix a stored redirect URL with the active router's basepath so
 * embedded hosts (mounted at e.g. "/app/filmdrop") don't navigate back
 * to the origin root and lose their route state.
 *
 * Security: the return value is assigned to `window.location.href`, so
 * unknown input is treated as hostile. Reject control characters,
 * dangerous schemes (`javascript:`, `data:`, `vbscript:`, `blob:`,
 * `file:`), and any absolute / protocol-relative / backslash-smuggled
 * URL. On rejection, return '/' so login still completes; cross-origin
 * redirects must use the `onOpenExternal` prop instead.
 */
const UNSAFE_SCHEME_RE = /^(?:javascript|data|vbscript|blob|file):/i
// eslint-disable-next-line no-control-regex -- intentional: reject null-byte / tab smuggling
const CONTROL_CHAR_RE = /[\u0000-\u001f]/
const ABSOLUTE_OR_PROTOCOL_RELATIVE_RE = /^(?:https?:)?\/\//i

export function applyBasepathToRedirect(url, basepath) {
  if (!url) return url
  const trimmed = String(url).trim().replace(/\\/g, '/')
  if (
    CONTROL_CHAR_RE.test(trimmed) ||
    UNSAFE_SCHEME_RE.test(trimmed) ||
    ABSOLUTE_OR_PROTOCOL_RELATIVE_RE.test(trimmed)
  ) {
    console.warn(
      'applyBasepathToRedirect: rejected unsafe redirect target; falling back to "/"'
    )
    return '/'
  }
  if (!basepath || basepath === '/' || basepath === '') return trimmed
  const normalizedBase = basepath.endsWith('/')
    ? basepath.slice(0, -1)
    : basepath
  // If the caller already prefixed the basepath, don't double-prefix.
  if (trimmed === normalizedBase || trimmed.startsWith(normalizedBase + '/'))
    return trimmed
  if (trimmed.startsWith('/')) return normalizedBase + trimmed
  return normalizedBase + '/' + trimmed
}

export async function AuthService(username, password) {
  const AuthServiceURL = store.getState().mainSlice.appConfig.AUTH_URL

  const myHeaders = new Headers()
  myHeaders.append('Content-Type', 'application/x-www-form-urlencoded')

  const urlencoded = new URLSearchParams()
  urlencoded.append('grant_type', 'password')
  urlencoded.append('username', username)
  urlencoded.append('password', password)

  const reqParams = {
    method: 'POST',
    headers: myHeaders,
    body: urlencoded
  }

  await fetch(`${AuthServiceURL}`, reqParams)
    .then((response) => {
      if (response.ok) {
        return response.json()
      }
      throw new Error()
    })
    .then((json) => {
      if (!json.access_token) {
        throw new Error('No Auth Token Found')
      }
      setAuthToken(json.access_token)
      store.dispatch(setAuthTokenExists(true))
      store.dispatch(clearApplicationAlert())

      // Check for post-auth redirect URL
      const redirectUrl = sessionStorage.getItem('POST_AUTH_REDIRECT_URL')
      if (redirectUrl) {
        sessionStorage.removeItem('POST_AUTH_REDIRECT_URL')
        let target = redirectUrl
        try {
          const basepath = getActiveRouter()?.options?.basepath
          target = applyBasepathToRedirect(redirectUrl, basepath)
        } catch (_err) {
          // Router not mounted (e.g. pre-mount auth flow) — fall back.
        }
        window.location.href = target
      }
    })
    .catch((error) => {
      store.dispatch(setAuthTokenExists(false))
      const message = 'Authentication Error'
      showApplicationAlert('warning', 'Login Failed', 5000)
      // log full error for diagnosing client side errors if needed
      console.error(message, error)
    })
}
