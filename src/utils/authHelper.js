import { store } from '../redux/store'
import { setAuthTokenExists } from '../redux/slices/mainSlice'

/**
 * Storage key for the FilmDrop auth JWT. Centralized here so a future
 * consumer-injected token path has a single call site to replace.
 */
export const AUTH_TOKEN_STORAGE_KEY = 'APP_AUTH_TOKEN'

export function getAuthToken() {
  try {
    return localStorage.getItem(AUTH_TOKEN_STORAGE_KEY)
  } catch {
    return null
  }
}

export function setAuthToken(token) {
  try {
    localStorage.setItem(AUTH_TOKEN_STORAGE_KEY, token)
  } catch {
    // localStorage unavailable (private browsing, SSR)
  }
}

export function clearAuthToken() {
  try {
    localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY)
  } catch {
    // localStorage unavailable
  }
}

export function logoutUser() {
  clearAuthToken()
  store.dispatch(setAuthTokenExists(false))
}
