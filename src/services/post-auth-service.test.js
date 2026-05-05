import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'

import { AuthService, applyBasepathToRedirect } from './post-auth-service'
import { store } from '../redux/store'
import { setAppConfig } from '../redux/slices/mainSlice'

const { setAuthTokenMock, getActiveRouterMock } = vi.hoisted(() => ({
  setAuthTokenMock: vi.fn(),
  getActiveRouterMock: vi.fn()
}))

vi.mock('../utils/authHelper', async (importOriginal) => {
  const actual = await importOriginal()
  return { ...actual, setAuthToken: setAuthTokenMock }
})
vi.mock('../router', () => ({
  getActiveRouter: getActiveRouterMock
}))

/**
 * Regression tests for AuthService + post-auth redirect.
 * Verifies sessionStorage handling, basepath-aware redirect, security gates,
 * and dispatched Redux actions.
 */
describe('AuthService', () => {
  let fetchSpy
  let dispatchSpy
  let locationHrefSetter
  let originalLocation

  const buildResponse = ({ ok = true, body = {} } = {}) => ({
    ok,
    json: async () => body
  })

  beforeEach(() => {
    store.dispatch(setAppConfig({ AUTH_URL: 'https://auth.example/login' }))
    fetchSpy = vi.fn()
    vi.stubGlobal('fetch', fetchSpy)
    dispatchSpy = vi.spyOn(store, 'dispatch')

    // Capture window.location.href writes without navigating.
    originalLocation = window.location
    locationHrefSetter = vi.fn()
    delete window.location
    window.location = { href: '/', assign: vi.fn() }
    Object.defineProperty(window.location, 'href', {
      configurable: true,
      get: () => '/',
      set: locationHrefSetter
    })

    sessionStorage.clear()
    getActiveRouterMock
      .mockReset()
      .mockReturnValue({ options: { basepath: '/' } })
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
    window.location = originalLocation
    sessionStorage.clear()
    setAuthTokenMock.mockReset()
  })

  it('stores token and dispatches success actions on 200', async () => {
    fetchSpy.mockResolvedValueOnce(
      buildResponse({ body: { access_token: 'tok-123' } })
    )

    await AuthService('user', 'pass')

    expect(setAuthTokenMock).toHaveBeenCalledWith('tok-123')
    const dispatched = dispatchSpy.mock.calls.map(([a]) => a.type)
    expect(dispatched).toContain('mainSlice/setAuthTokenExists')
    expect(dispatched).toContain('mainSlice/clearApplicationAlert')
  })

  it('applies basepath to stored POST_AUTH_REDIRECT_URL and clears it', async () => {
    sessionStorage.setItem('POST_AUTH_REDIRECT_URL', '/collections/foo')
    getActiveRouterMock.mockReturnValue({ options: { basepath: '/app' } })
    fetchSpy.mockResolvedValueOnce(
      buildResponse({ body: { access_token: 'tok' } })
    )

    await AuthService('u', 'p')

    expect(sessionStorage.getItem('POST_AUTH_REDIRECT_URL')).toBeNull()
    expect(locationHrefSetter).toHaveBeenCalledWith('/app/collections/foo')
  })

  it('rejects javascript: scheme in stored redirect (open-redirect guard)', async () => {
    sessionStorage.setItem('POST_AUTH_REDIRECT_URL', 'javascript:alert(1)')
    fetchSpy.mockResolvedValueOnce(
      buildResponse({ body: { access_token: 'tok' } })
    )
    vi.spyOn(console, 'warn').mockImplementation(() => {})

    await AuthService('u', 'p')

    expect(locationHrefSetter).toHaveBeenCalledWith('/')
  })

  it('falls back to raw redirect when getActiveRouter throws (pre-mount)', async () => {
    sessionStorage.setItem('POST_AUTH_REDIRECT_URL', '/items/a')
    getActiveRouterMock.mockImplementation(() => {
      throw new Error('router not mounted')
    })
    fetchSpy.mockResolvedValueOnce(
      buildResponse({ body: { access_token: 'tok' } })
    )

    await AuthService('u', 'p')

    expect(locationHrefSetter).toHaveBeenCalledWith('/items/a')
  })

  it('does not navigate when no redirect URL is stored', async () => {
    fetchSpy.mockResolvedValueOnce(
      buildResponse({ body: { access_token: 'tok' } })
    )

    await AuthService('u', 'p')

    expect(locationHrefSetter).not.toHaveBeenCalled()
  })

  it('forwards AbortController signal when provided', async () => {
    const controller = new AbortController()
    fetchSpy.mockResolvedValueOnce(
      buildResponse({ body: { access_token: 'tok-123' } })
    )

    await AuthService('user', 'pass', controller.signal)

    expect(fetchSpy).toHaveBeenCalledWith(
      'https://auth.example/login',
      expect.objectContaining({
        signal: controller.signal
      })
    )
  })

  it('surfaces failure alert on network error', async () => {
    fetchSpy.mockRejectedValueOnce(new Error('network down'))

    const result = await AuthService('u', 'p')

    expect(setAuthTokenMock).not.toHaveBeenCalled()
    expect(result).toMatchObject({
      error: true,
      summary: 'Authentication Error'
    })
    const dispatched = dispatchSpy.mock.calls.map(([a]) => a.type)
    expect(dispatched).toContain('mainSlice/setAuthTokenExists')
  })

  it('treats non-OK response as auth failure', async () => {
    fetchSpy.mockResolvedValueOnce(buildResponse({ ok: false, body: {} }))

    const result = await AuthService('u', 'p')

    expect(setAuthTokenMock).not.toHaveBeenCalled()
    expect(result?.error).toBe(true)
    expect(result?.summary).toContain('Authentication Error')
  })

  it('treats missing access_token as auth failure', async () => {
    fetchSpy.mockResolvedValueOnce(buildResponse({ body: {} }))

    const result = await AuthService('u', 'p')

    expect(setAuthTokenMock).not.toHaveBeenCalled()
    expect(result).toMatchObject({
      error: true,
      summary: 'Authentication Error'
    })
  })
})

describe('applyBasepathToRedirect (sanity smoke)', () => {
  it('passes through a relative URL when basepath is "/"', () => {
    expect(applyBasepathToRedirect('/foo', '/')).toBe('/foo')
  })
  it('rejects protocol-relative URLs', () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {})
    expect(applyBasepathToRedirect('//evil.example/x', '/app')).toBe('/')
  })
})
