import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest'
import { fetchAllFeatures } from './get-all-scenes-service'
import { store } from '../redux/store'
import {
  mainSliceReset,
  setAppConfig,
  setMappedScenes
} from '../redux/slices/mainSlice'
import { DEFAULT_MAX_SCENES_RENDERED } from '../constants/defaults'
import { createAbortableRequest } from '../testing/abort-test-helper'

const {
  addDataToLayerMock,
  clearLayerMock,
  appendStacHeaderCookiesMock,
  footprintLayerStyleMock
} = vi.hoisted(() => ({
  addDataToLayerMock: vi.fn(),
  clearLayerMock: vi.fn(),
  appendStacHeaderCookiesMock: vi.fn((headers) => {
    headers.append('x-test-cookie', 'session=abc')
  }),
  footprintLayerStyleMock: { color: '#00ff00' }
}))

vi.mock('../utils/mapLayers', () => ({
  addDataToLayer: addDataToLayerMock,
  clearLayer: clearLayerMock,
  CLICKED_SCENE_IMAGE_LAYER: 'clickedSceneImageLayer'
}))

vi.mock('../utils/mapStyles', () => ({
  footprintLayerStyle: footprintLayerStyleMock
}))

vi.mock('../utils/stacRequest', () => ({
  appendStacHeaderCookies: appendStacHeaderCookiesMock
}))

describe('fetchAllFeatures', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    store.dispatch(mainSliceReset())
    store.dispatch(
      setAppConfig({
        FETCH_CREDENTIALS: 'same-origin'
      })
    )
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('fetches a single page, updates mapped scenes, and returns features', async () => {
    const signal = new AbortController().signal
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        features: [{ id: 'scene-1' }],
        links: []
      })
    })

    const result = await fetchAllFeatures('https://example.com/search', signal)

    expect(result).toEqual([{ id: 'scene-1' }])
    expect(global.fetch).toHaveBeenCalledWith(
      'https://example.com/search',
      expect.objectContaining({
        signal,
        credentials: 'same-origin',
        headers: expect.any(Headers)
      })
    )

    const [{ headers }] = global.fetch.mock.calls[0].slice(1)
    expect(headers.get('x-test-cookie')).toBe('session=abc')

    expect(clearLayerMock).toHaveBeenCalledWith('clickedSceneImageLayer')
    expect(addDataToLayerMock).toHaveBeenCalledWith(
      [{ id: 'scene-1' }],
      'searchResultsLayer',
      { style: footprintLayerStyleMock },
      false
    )
    expect(store.getState().mainSlice.mappedScenes).toEqual([{ id: 'scene-1' }])
  })

  it('follows next links recursively and returns combined features', async () => {
    const signal = new AbortController().signal
    global.fetch = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          features: [{ id: 'scene-1' }],
          links: [{ rel: 'next', href: 'https://example.com/search?page=2' }]
        })
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          features: [{ id: 'scene-2' }],
          links: []
        })
      })

    const result = await fetchAllFeatures('https://example.com/search', signal)

    expect(global.fetch).toHaveBeenCalledTimes(2)
    expect(result).toEqual([{ id: 'scene-1' }, { id: 'scene-2' }])
    expect(store.getState().mainSlice.mappedScenes).toEqual([
      { id: 'scene-1' },
      { id: 'scene-2' }
    ])
  })

  it('stops recursion at max scene limit', async () => {
    const signal = new AbortController().signal
    const existing = Array.from(
      { length: DEFAULT_MAX_SCENES_RENDERED },
      (_, i) => ({
        id: `existing-${i}`
      })
    )
    store.dispatch(setMappedScenes(existing))

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        features: [{ id: 'scene-new' }],
        links: [{ rel: 'next', href: 'https://example.com/search?page=2' }]
      })
    })

    const result = await fetchAllFeatures('https://example.com/search', signal)

    expect(global.fetch).toHaveBeenCalledTimes(1)
    expect(result).toEqual([{ id: 'scene-new' }])
  })

  it('throws normalized error object for non-OK responses', async () => {
    const signal = new AbortController().signal
    const consoleErrorSpy = vi
      .spyOn(console, 'error')
      .mockImplementation(() => {})
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error',
      text: async () => 'All scenes failed'
    })

    await expect(
      fetchAllFeatures('https://example.com/search', signal)
    ).rejects.toEqual(
      expect.objectContaining({
        error: true,
        summary: 'Error Fetching All Scene Results'
      })
    )
    expect(consoleErrorSpy).toHaveBeenCalled()
  })

  it('returns undefined and does not log on initial abort', async () => {
    const { signal, abortError } = createAbortableRequest()
    const consoleErrorSpy = vi
      .spyOn(console, 'error')
      .mockImplementation(() => {})

    global.fetch = vi.fn().mockRejectedValue(abortError)

    const result = await fetchAllFeatures('https://example.com/search', signal)

    expect(result).toBeUndefined()
    expect(consoleErrorSpy).not.toHaveBeenCalled()
  })

  it('returns undefined when abort happens on a later recursive page', async () => {
    const { signal, abortError } = createAbortableRequest()
    const consoleErrorSpy = vi
      .spyOn(console, 'error')
      .mockImplementation(() => {})

    global.fetch = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          features: [{ id: 'scene-1' }],
          links: [{ rel: 'next', href: 'https://example.com/search?page=2' }]
        })
      })
      .mockRejectedValueOnce(abortError)

    const result = await fetchAllFeatures('https://example.com/search', signal)

    expect(result).toBeUndefined()
    expect(global.fetch).toHaveBeenCalledTimes(2)
    expect(consoleErrorSpy).not.toHaveBeenCalled()
  })
})
