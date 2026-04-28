/**
 * Basepath end-to-end regression. Exercises the contract that makes
 * FilmDrop safe to embed at a non-root path:
 *
 *  1. `createFilmDropRouter({ basepath })` stores the prop on
 *     `router.options` where `post-auth-service` reads it.
 *  2. TanStack's `buildLocation` prefixes the basepath when producing
 *     hrefs for path-param routes.
 *  3. `applyBasepathToRedirect` prefixes stored redirect URLs across
 *     the documented matrix.
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { createFilmDropRouter } from './router'
import { applyBasepathToRedirect } from './services/post-auth-service'

describe('createFilmDropRouter basepath wiring', () => {
  it('records the basepath on router.options', () => {
    const router = createFilmDropRouter({ basepath: '/app' })
    expect(router.options.basepath).toBe('/app')
  })

  it('defaults to no basepath when unspecified', () => {
    const router = createFilmDropRouter()
    expect(router.options.basepath ?? '/').toBe('/')
  })

  it('builds collection hrefs under the basepath', () => {
    const router = createFilmDropRouter({ basepath: '/app' })
    const built = router.buildLocation({
      to: '/$collectionId',
      params: { collectionId: 'sentinel-2' }
    })
    expect(built.href.startsWith('/app/')).toBe(true)
    expect(built.href).toContain('sentinel-2')
  })
})

describe('applyBasepathToRedirect', () => {
  it('leaves urls untouched when basepath is empty', () => {
    expect(applyBasepathToRedirect('/foo', undefined)).toBe('/foo')
    expect(applyBasepathToRedirect('/foo', '')).toBe('/foo')
    expect(applyBasepathToRedirect('/foo', '/')).toBe('/foo')
  })

  it('prefixes relative-root urls with the basepath', () => {
    expect(applyBasepathToRedirect('/collection/id', '/app')).toBe(
      '/app/collection/id'
    )
  })

  it('normalizes trailing slash on basepath', () => {
    expect(applyBasepathToRedirect('/collection/id', '/app/')).toBe(
      '/app/collection/id'
    )
  })

  it('does not double-prefix when the path already includes the basepath', () => {
    expect(applyBasepathToRedirect('/app/collection/id', '/app')).toBe(
      '/app/collection/id'
    )
    expect(applyBasepathToRedirect('/app', '/app')).toBe('/app')
  })

  it('handles paths without a leading slash', () => {
    expect(applyBasepathToRedirect('collection/id', '/app')).toBe(
      '/app/collection/id'
    )
  })
})

describe('applyBasepathToRedirect security', () => {
  let warnSpy
  beforeEach(() => {
    warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
  })
  afterEach(() => {
    warnSpy.mockRestore()
  })

  it('rejects javascript: scheme (case-insensitive, whitespace-trimmed)', () => {
    expect(applyBasepathToRedirect('javascript:alert(1)', '/app')).toBe('/')
    expect(applyBasepathToRedirect('JaVaScRiPt:alert(1)', '/app')).toBe('/')
    expect(applyBasepathToRedirect('  javascript:alert(1)  ', '/app')).toBe('/')
    expect(warnSpy).toHaveBeenCalled()
  })

  it('rejects data:, vbscript:, blob:, file: schemes', () => {
    expect(
      applyBasepathToRedirect(
        'data:text/html,<script>alert(1)</script>',
        '/app'
      )
    ).toBe('/')
    expect(applyBasepathToRedirect('vbscript:msgbox 1', '/app')).toBe('/')
    expect(applyBasepathToRedirect('blob:http://x/abc', '/app')).toBe('/')
    expect(applyBasepathToRedirect('file:///etc/passwd', '/app')).toBe('/')
  })

  it('rejects control-character smuggling', () => {
    expect(applyBasepathToRedirect('jav\u0000ascript:alert(1)', '/app')).toBe(
      '/'
    )
    expect(applyBasepathToRedirect('\u0009javascript:alert(1)', '/app')).toBe(
      '/'
    )
  })

  it('rejects absolute http(s) URLs (open-redirect hardening)', () => {
    expect(applyBasepathToRedirect('https://evil.com', '/app')).toBe('/')
    expect(applyBasepathToRedirect('HTTP://evil.com/x', '/app')).toBe('/')
    expect(applyBasepathToRedirect('http://evil.com/', '/app')).toBe('/')
  })

  it('rejects protocol-relative URLs', () => {
    expect(applyBasepathToRedirect('//evil.com', '/app')).toBe('/')
    expect(applyBasepathToRedirect('//evil.com/path', '/app')).toBe('/')
  })

  it('rejects backslash-smuggled protocol-relative URLs', () => {
    expect(applyBasepathToRedirect('\\\\evil.com', '/app')).toBe('/')
    expect(applyBasepathToRedirect('/\\evil.com', '/app')).toBe('/')
  })

  it('accepts clean relative paths after hardening', () => {
    expect(applyBasepathToRedirect('/items/abc', '/app')).toBe('/app/items/abc')
    expect(applyBasepathToRedirect('items/abc', '/app')).toBe('/app/items/abc')
    expect(applyBasepathToRedirect('/', '/app')).toBe('/app/')
  })
})
