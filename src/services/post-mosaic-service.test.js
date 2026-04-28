import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest'
import { AddMosaicService } from './post-mosaic-service'
import { store } from '../redux/store'
import { setappConfig } from '../redux/slices/mainSlice'

const DEFAULT_MOSAIC_ERROR_SUMMARY = 'Error Fetching Mosaic'

global.fetch = vi.fn()

beforeEach(() => {
  vi.clearAllMocks()
  store.dispatch(
    setappConfig({
      MOSAIC_TILER_URL: 'https://mosaic.example.com',
      FETCH_CREDENTIALS: 'same-origin'
    })
  )
})

afterEach(() => {
  vi.restoreAllMocks()
})

describe('AddMosaicService error handling', () => {
  it('returns normalized error with mosaic-specific summary for non-OK responses', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: false,
      status: 400,
      text: async () => JSON.stringify({ code: 'BadRequest', message: 'bad' })
    })

    const result = await AddMosaicService({ method: 'POST' })

    expect(result).toEqual(
      expect.objectContaining({
        error: true,
        status: 400,
        summary: DEFAULT_MOSAIC_ERROR_SUMMARY,
        details: 'bad'
      })
    )
  })

  it('returns normalized network error with mosaic-specific summary', async () => {
    global.fetch.mockRejectedValueOnce(new Error('Network error'))

    const result = await AddMosaicService({ method: 'POST' })

    expect(result).toEqual(
      expect.objectContaining({
        error: true,
        status: null,
        summary: DEFAULT_MOSAIC_ERROR_SUMMARY,
        details: 'Network error'
      })
    )
  })

  it('returns undefined on fetch abort without normalizing', async () => {
    const consoleErrorSpy = vi
      .spyOn(console, 'error')
      .mockImplementation(() => {})
    const abortError = Object.assign(new Error('Aborted'), {
      name: 'AbortError'
    })

    global.fetch.mockRejectedValueOnce(abortError)

    const controller = new AbortController()
    const result = await AddMosaicService(
      { method: 'POST' },
      null,
      DEFAULT_MOSAIC_ERROR_SUMMARY,
      controller.signal
    )

    expect(result).toBeUndefined()
    expect(consoleErrorSpy).not.toHaveBeenCalled()
  })
})
