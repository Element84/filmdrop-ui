import { vi } from 'vitest'
import { setappConfig } from '../redux/slices/mainSlice'
import { store } from '../redux/store'
import { mockAppConfig } from '../testing/shared-mocks'
import { loadAppTitle, loadAppFavicon } from './configHelper'
import { DoesFaviconExistService } from '../services/get-config-service'

describe('ConfigHelper', () => {
  afterEach(() => {
    vi.resetAllMocks()
  })
  describe('loadAppTitle', () => {
    it('sets document title and appName from config if present', () => {
      const mockAppConfigAppTitle = {
        ...mockAppConfig,
        APP_NAME: 'Demo App'
      }
      store.dispatch(setappConfig(mockAppConfigAppTitle))
      loadAppTitle()
      expect(global.window.document.title).toBe('Demo App')
      expect(store.getState().mainSlice.appName).toBe('Demo App')
    })
    it('sets document title and appName from default if App_Name not present in config', () => {
      store.dispatch(setappConfig(mockAppConfig))
      loadAppTitle()
      expect(global.window.document.title).toBe('FilmDrop Console')
      expect(store.getState().mainSlice.appName).toBe('FilmDrop Console')
    })
  })
  describe('loadAppFavicon', () => {
    const originalQuerySelector = document.querySelector
    beforeEach(() => {
      vi.clearAllMocks()
      vi.mock('../services/get-config-service', () => ({
        DoesFaviconExistService: vi.fn()
      }))
    })
    afterEach(() => {
      document.querySelector = originalQuerySelector
    })

    it('should do nothing when APP_FAVICON is not provided', async () => {
      store.dispatch(setappConfig(mockAppConfig))
      await loadAppFavicon()
      expect(DoesFaviconExistService).not.toHaveBeenCalled()
    })
    it('should do nothing when DoesFaviconExistService returns false', async () => {
      DoesFaviconExistService.mockResolvedValueOnce(false)
      const mockAppConfigFavicon = {
        ...mockAppConfig,
        APP_FAVICON: 'favicon.ico'
      }
      store.dispatch(setappConfig(mockAppConfigFavicon))
      await loadAppFavicon()
      expect(DoesFaviconExistService).toHaveBeenCalled()
    })
    it('should call DoesFaviconExistService but not query for link if Favicon set in config but file does not exist', async () => {
      DoesFaviconExistService.mockResolvedValueOnce(false)
      const mockAppConfigFavicon = {
        ...mockAppConfig,
        APP_FAVICON: 'favicon.ico'
      }
      store.dispatch(setappConfig(mockAppConfigFavicon))
      const mockLink = document.createElement('link')
      mockLink.rel = 'icon'
      mockLink.href = '/favicon.ico'
      document.querySelector = vi.fn(() => mockLink)
      await loadAppFavicon()
      expect(DoesFaviconExistService).toHaveBeenCalled()
      expect(document.querySelector).not.toHaveBeenCalledWith(
        "link[rel~='icon']"
      )
    })
    it('should call DoesFaviconExistService and query for link if favicon set in config and file exists', async () => {
      DoesFaviconExistService.mockResolvedValueOnce(true)
      const mockAppConfigFavicon = {
        ...mockAppConfig,
        APP_FAVICON: 'favicon.ico'
      }
      store.dispatch(setappConfig(mockAppConfigFavicon))
      const mockLink = document.createElement('link')
      mockLink.rel = 'icon'
      mockLink.href = '/config/favicon.ico?_cb=123'
      document.querySelector = vi.fn(() => mockLink)
      await loadAppFavicon()
      expect(DoesFaviconExistService).toHaveBeenCalled()
      expect(document.querySelector).toHaveBeenCalledWith("link[rel~='icon']")
      expect(mockLink.href).toContain(
        'http://localhost:3000/config/favicon.ico?_cb='
      )
      expect(mockLink.href).toMatch(/_cb=\d+/)
    })
  })
})
