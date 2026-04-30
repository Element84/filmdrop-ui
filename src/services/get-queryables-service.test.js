import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { resolveRefs } from './get-queryables-service'

/**
 * Regression tests for the JSON-Schema $ref resolver.
 * Covers cycle detection, depth guard, fetch caching, and fragment paths.
 */
describe('resolveRefs', () => {
  let fetchSpy
  let warnSpy

  beforeEach(() => {
    fetchSpy = vi.fn()
    vi.stubGlobal('fetch', fetchSpy)
    warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
  })

  const jsonResponse = (body) => ({ ok: true, json: async () => body })

  it('resolves a simple absolute-URL $ref', async () => {
    fetchSpy.mockResolvedValueOnce(
      jsonResponse({ type: 'string', minLength: 1 })
    )
    const result = await resolveRefs({
      $ref: 'https://schema.example/name.json'
    })
    expect(fetchSpy).toHaveBeenCalledTimes(1)
    expect(result).toEqual({ type: 'string', minLength: 1 })
  })

  it('drills into a JSON-pointer fragment on an absolute URL', async () => {
    fetchSpy.mockResolvedValueOnce(
      jsonResponse({
        $defs: {
          Foo: { type: 'integer', minimum: 0 }
        }
      })
    )
    const result = await resolveRefs({
      $ref: 'https://schema.example/s.json#/$defs/Foo'
    })
    expect(result).toEqual({ type: 'integer', minimum: 0 })
  })

  it('resolves nested array-branch $refs in parallel', async () => {
    fetchSpy
      .mockResolvedValueOnce(jsonResponse({ type: 'string' }))
      .mockResolvedValueOnce(jsonResponse({ type: 'number' }))
    const input = {
      anyOf: [{ $ref: 'https://a.example/x' }, { $ref: 'https://b.example/y' }]
    }
    const result = await resolveRefs(input)
    expect(result.anyOf).toEqual([{ type: 'string' }, { type: 'number' }])
    expect(fetchSpy).toHaveBeenCalledTimes(2)
  })

  it('detects cycles (A → B → A) and leaves the second hop unresolved', async () => {
    // A returns a $ref to B, B returns a $ref back to A.
    fetchSpy.mockImplementation((url) => {
      if (url === 'https://x/A')
        return Promise.resolve(jsonResponse({ $ref: 'https://x/B' }))
      if (url === 'https://x/B')
        return Promise.resolve(jsonResponse({ $ref: 'https://x/A' }))
      throw new Error(`unexpected url ${url}`)
    })
    const result = await resolveRefs({ $ref: 'https://x/A' })
    // The cycle back to A is left unresolved (kept as { $ref: 'https://x/A' }).
    expect(result).toEqual({ $ref: 'https://x/A' })
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringMatching(/cycle detected at https:\/\/x\/A/)
    )
  })

  it('aborts resolution past MAX_REF_DEPTH (10) without throwing', async () => {
    // Build a long unique chain: step-0 → step-1 → … → step-15 → { ok: true }
    fetchSpy.mockImplementation((url) => {
      const m = /step-(\d+)/.exec(url)
      if (!m) throw new Error(`unexpected url ${url}`)
      const n = Number(m[1])
      if (n >= 15) return Promise.resolve(jsonResponse({ leaf: true }))
      return Promise.resolve(jsonResponse({ $ref: `https://x/step-${n + 1}` }))
    })
    const result = await resolveRefs({ $ref: 'https://x/step-0' })
    // Depth guard kicks in — final result is the last schema that
    // couldn't be dereferenced (still has a $ref). Should not hang or throw.
    expect(result).toBeDefined()
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining('depth exceeded')
    )
  })

  it('reuses the per-resolve fetch cache for duplicate URLs across resolution layers', async () => {
    // Sequential reuse: A → inline schema that later refers to same URL
    // through a second hop. The array-branch runs in parallel so we
    // exercise cache reuse across a nested structure where the second
    // reference arrives after the first fetch has populated the cache.
    fetchSpy.mockImplementation((url) => {
      if (url === 'https://same.example/s') {
        return Promise.resolve(
          jsonResponse({
            type: 'object',
            properties: {
              // Inner ref points back to the same URL — should hit cache.
              inner: { $ref: 'https://same.example/s' }
            }
          })
        )
      }
      throw new Error(`unexpected url ${url}`)
    })
    const result = await resolveRefs({ $ref: 'https://same.example/s' })
    // First fetch populates the cache; the inner $ref reuses it and
    // is then cycle-detected (same URL already on the visited stack).
    expect(fetchSpy).toHaveBeenCalledTimes(1)
    expect(result.type).toBe('object')
  })

  it('returns the original schema when fetch responds with non-OK', async () => {
    fetchSpy.mockResolvedValueOnce({
      ok: false,
      status: 500,
      statusText: 'Server Error'
    })
    const original = { $ref: 'https://bad.example/s' }
    const result = await resolveRefs(original)
    expect(result).toBe(original)
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringMatching(/Failed to resolve \$ref/),
      expect.any(Error)
    )
  })

  it('returns the original schema when fetch rejects (network error)', async () => {
    fetchSpy.mockRejectedValueOnce(new Error('offline'))
    const original = { $ref: 'https://bad.example/s' }
    const result = await resolveRefs(original)
    expect(result).toBe(original)
  })

  it('passes through primitives and null without fetching', async () => {
    expect(await resolveRefs(null)).toBe(null)
    expect(await resolveRefs('plain')).toBe('plain')
    expect(await resolveRefs(42)).toBe(42)
    expect(fetchSpy).not.toHaveBeenCalled()
  })
})
