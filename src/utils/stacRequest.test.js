import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest'
import Cookies from 'js-cookie'
import { store } from '../redux/store'
import { setAppConfig } from '../redux/slices/mainSlice'
import { buildStacRequestHeaders, appendStacHeaderCookies } from './stacRequest'

import { getAuthToken } from './authHelper'

vi.mock('js-cookie', () => ({
  default: {
    get: vi.fn()
  }
}))

vi.mock('./authHelper', () => ({
  getAuthToken: vi.fn()
}))

describe('stacRequest', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    store.dispatch(
      setAppConfig({
        APP_TOKEN_AUTH_ENABLED: false,
        STAC_HEADER_COOKIES: []
      })
    )
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('adds Authorization header when token auth is enabled and token exists', () => {
    vi.mocked(getAuthToken).mockReturnValue('jwt-token')
    store.dispatch(
      setAppConfig({
        APP_TOKEN_AUTH_ENABLED: true,
        STAC_HEADER_COOKIES: []
      })
    )

    const headers = buildStacRequestHeaders()

    expect(headers.get('Authorization')).toBe('Bearer jwt-token')
  })

  it('does not add Authorization header when token auth is disabled', () => {
    vi.mocked(getAuthToken).mockReturnValue('jwt-token')

    const headers = buildStacRequestHeaders()

    expect(headers.get('Authorization')).toBeNull()
  })

  it('appends configured cookie headers with optional prefix', () => {
    vi.mocked(Cookies.get)
      .mockReturnValueOnce('abc123')
      .mockReturnValueOnce('trace-9')

    const headers = new Headers()
    appendStacHeaderCookies(headers, {
      STAC_HEADER_COOKIES: [
        {
          header_name: 'X-Session',
          cookie_name: 'session',
          header_val_prefix: 'Bearer '
        },
        {
          header_name: 'X-Trace',
          cookie_name: 'trace',
          header_val_prefix: null
        }
      ]
    })

    expect(headers.get('X-Session')).toBe('Bearer abc123')
    expect(headers.get('X-Trace')).toBe('trace-9')
  })

  it('skips invalid cookie mapping config entries', () => {
    const consoleWarnSpy = vi
      .spyOn(console, 'warn')
      .mockImplementation(() => {})
    vi.mocked(Cookies.get).mockReturnValue('abc123')

    const headers = new Headers()
    appendStacHeaderCookies(headers, {
      STAC_HEADER_COOKIES: [
        {
          header_name: '',
          cookie_name: 'session',
          header_val_prefix: 'Bearer '
        }
      ]
    })

    expect(headers.get('X-Session')).toBeNull()
    expect(consoleWarnSpy).toHaveBeenCalled()
  })
})
