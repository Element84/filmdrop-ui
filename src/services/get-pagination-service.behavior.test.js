import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest'
import { store } from '../redux/store'
import { setAppConfig, mainSliceReset } from '../redux/slices/mainSlice'
import { FetchPageService } from './get-pagination-service'

const {
  addDataToLayerMock,
  clearLayerMock,
  clearMapSelectionMock,
  navigateMock,
  getPathParamsMock,
  footprintLayerStyleMock
} = vi.hoisted(() => ({
  addDataToLayerMock: vi.fn(),
  clearLayerMock: vi.fn(),
  clearMapSelectionMock: vi.fn(),
  navigateMock: vi.fn(),
  getPathParamsMock: vi.fn(() => ({ collectionId: 'demo-collection' })),
  footprintLayerStyleMock: { color: '#fff' }
}))

vi.mock('../utils/mapLayers', () => ({
  addDataToLayer: addDataToLayerMock,
  clearLayer: clearLayerMock,
  clearMapSelection: clearMapSelectionMock,
  CLICKED_SCENE_IMAGE_LAYER: 'clickedSceneImageLayer'
}))

vi.mock('../utils/mapStyles', () => ({
  footprintLayerStyle: footprintLayerStyleMock
}))

vi.mock('../router', () => ({
  getActiveRouter: () => ({ navigate: navigateMock }),
  getPathParams: getPathParamsMock,
  ROUTE_COLLECTION: '/$collectionId'
}))

describe('FetchPageService behavior', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    store.dispatch(mainSliceReset())
    store.dispatch(
      setAppConfig({
        FETCH_CREDENTIALS: 'same-origin',
        API_MAX_ITEMS: 10
      })
    )
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('navigates out of item route, updates pagination state, and maps results', async () => {
    getPathParamsMock.mockReturnValue({
      collectionId: 'demo-collection',
      itemId: 'scene-1'
    })
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        features: [{ id: 'scene-2' }],
        links: [{ rel: 'next', href: 'https://example.com/page/3' }],
        context: { matched: 25 }
      })
    })

    await FetchPageService('https://example.com/page/2', 2)

    expect(navigateMock).toHaveBeenCalledWith({
      to: '/$collectionId',
      params: { collectionId: 'demo-collection' },
      search: expect.any(Function),
      replace: true
    })
    expect(clearMapSelectionMock).toHaveBeenCalled()
    expect(clearLayerMock).toHaveBeenCalledWith('searchResultsLayer')
    expect(clearLayerMock).toHaveBeenCalledWith('clickedSceneImageLayer')

    const state = store.getState().mainSlice
    expect(state.currentPage).toBe(2)
    expect(state.totalPages).toBe(3)
    expect(state.searchResults.features).toEqual([{ id: 'scene-2' }])
    expect(state.mappedScenes).toEqual([{ id: 'scene-2' }])
    expect(state.searchLoading).toBe(false)
    expect(addDataToLayerMock).toHaveBeenCalledWith(
      expect.objectContaining({
        features: [{ id: 'scene-2' }]
      }),
      'searchResultsLayer',
      { style: footprintLayerStyleMock },
      true
    )
  })

  it('handles non-OK fetch responses by clearing loading and logging normalized error', async () => {
    const consoleErrorSpy = vi
      .spyOn(console, 'error')
      .mockImplementation(() => {})
    getPathParamsMock.mockReturnValue({ collectionId: 'demo-collection' })
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error',
      text: async () => 'pagination failed'
    })

    await FetchPageService('https://example.com/page/2', 2)

    expect(store.getState().mainSlice.searchLoading).toBe(false)
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'Error Fetching Paginated Results',
      expect.objectContaining({
        error: true,
        summary: 'Error Fetching Paginated Results'
      })
    )
    expect(addDataToLayerMock).not.toHaveBeenCalled()
  })

  it('returns undefined and avoids logging on abort errors', async () => {
    const consoleErrorSpy = vi
      .spyOn(console, 'error')
      .mockImplementation(() => {})
    const controller = new AbortController()
    const abortError = Object.assign(new Error('aborted'), {
      name: 'AbortError'
    })

    global.fetch = vi.fn().mockRejectedValue(abortError)

    const result = await FetchPageService(
      'https://example.com/page/2',
      2,
      controller.signal
    )

    expect(result).toBeUndefined()
    expect(store.getState().mainSlice.searchLoading).toBe(false)
    expect(consoleErrorSpy).not.toHaveBeenCalled()
  })
})
