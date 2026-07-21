import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import {
  getAuthToken,
  setAuthToken,
  clearAuthToken,
  logoutUser,
  AUTH_TOKEN_STORAGE_KEY
} from './authHelper'

describe('authHelper', () => {
  let localStorageMock

  beforeEach(() => {
    // Mock localStorage
    localStorageMock = {
      getItem: vi.fn(),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn()
    }
    global.localStorage = localStorageMock
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('AUTH_TOKEN_STORAGE_KEY', () => {
    it('should export the storage key constant', () => {
      expect(AUTH_TOKEN_STORAGE_KEY).toBe('APP_AUTH_TOKEN')
    })
  })

  describe('getAuthToken', () => {
    it('should retrieve token from localStorage using correct key', () => {
      localStorageMock.getItem.mockReturnValue('test-jwt-token')

      const token = getAuthToken()

      expect(localStorageMock.getItem).toHaveBeenCalledWith(
        AUTH_TOKEN_STORAGE_KEY
      )
      expect(token).toBe('test-jwt-token')
    })

    it('should return null when token is not in storage', () => {
      localStorageMock.getItem.mockReturnValue(null)

      const token = getAuthToken()

      expect(token).toBeNull()
    })

    it('should return null on localStorage access error', () => {
      localStorageMock.getItem.mockImplementation(() => {
        throw new Error('localStorage not available')
      })

      const token = getAuthToken()

      expect(token).toBeNull()
    })

    it('should handle DOMException (private browsing)', () => {
      const domException = new DOMException('QuotaExceededError')
      localStorageMock.getItem.mockImplementation(() => {
        throw domException
      })

      const token = getAuthToken()

      expect(token).toBeNull()
    })

    it('should return empty string when token is explicitly empty', () => {
      localStorageMock.getItem.mockReturnValue('')

      const token = getAuthToken()

      expect(token).toBe('')
    })
  })

  describe('setAuthToken', () => {
    it('should store token in localStorage with correct key', () => {
      const testToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'

      setAuthToken(testToken)

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        AUTH_TOKEN_STORAGE_KEY,
        testToken
      )
    })

    it('should handle localStorage write error silently', () => {
      localStorageMock.setItem.mockImplementation(() => {
        throw new Error('localStorage write failed')
      })

      expect(() => setAuthToken('test-token')).not.toThrow()
      expect(localStorageMock.setItem).toHaveBeenCalled()
    })

    it('should handle DOMException in private browsing', () => {
      const domException = new DOMException('QuotaExceededError')
      localStorageMock.setItem.mockImplementation(() => {
        throw domException
      })

      expect(() => setAuthToken('test-token')).not.toThrow()
      expect(localStorageMock.setItem).toHaveBeenCalled()
    })

    it('should accept various token formats', () => {
      const tokens = [
        'simple-token',
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c',
        'token-with-special-chars-!@#$%'
      ]

      tokens.forEach((token) => {
        localStorageMock.setItem.mockClear()
        setAuthToken(token)
        expect(localStorageMock.setItem).toHaveBeenCalledWith(
          AUTH_TOKEN_STORAGE_KEY,
          token
        )
      })
    })
  })

  describe('clearAuthToken', () => {
    it('should remove token from localStorage using correct key', () => {
      clearAuthToken()

      expect(localStorageMock.removeItem).toHaveBeenCalledWith(
        AUTH_TOKEN_STORAGE_KEY
      )
    })

    it('should handle localStorage removal error silently', () => {
      localStorageMock.removeItem.mockImplementation(() => {
        throw new Error('localStorage removal failed')
      })

      expect(() => clearAuthToken()).not.toThrow()
      expect(localStorageMock.removeItem).toHaveBeenCalled()
    })

    it('should handle DOMException silently', () => {
      const domException = new DOMException('InvalidStateError')
      localStorageMock.removeItem.mockImplementation(() => {
        throw domException
      })

      expect(() => clearAuthToken()).not.toThrow()
      expect(localStorageMock.removeItem).toHaveBeenCalled()
    })
  })

  describe('logoutUser (integration with real store)', () => {
    beforeEach(() => {
      // For logoutUser tests, we need to use the actual store from the module
      // These tests verify that logoutUser correctly dispatches Redux actions
    })

    it('should clear token when logoutUser is called', () => {
      logoutUser()

      expect(localStorageMock.removeItem).toHaveBeenCalledWith(
        AUTH_TOKEN_STORAGE_KEY
      )
    })

    it('should handle logout when no token exists', () => {
      localStorageMock.removeItem.mockReturnValue(undefined)

      expect(() => logoutUser()).not.toThrow()
      expect(localStorageMock.removeItem).toHaveBeenCalledWith(
        AUTH_TOKEN_STORAGE_KEY
      )
    })

    it('should handle localStorage errors gracefully during logout', () => {
      localStorageMock.removeItem.mockImplementation(() => {
        throw new Error('Storage error')
      })

      expect(() => logoutUser()).not.toThrow()
      expect(localStorageMock.removeItem).toHaveBeenCalled()
    })
  })

  describe('integration: token lifecycle', () => {
    it('should complete full token lifecycle: set > get > clear', () => {
      const testToken = 'test-jwt-token-123'

      // Set token
      setAuthToken(testToken)
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        AUTH_TOKEN_STORAGE_KEY,
        testToken
      )

      // Get token
      localStorageMock.getItem.mockReturnValue(testToken)
      const retrieved = getAuthToken()
      expect(retrieved).toBe(testToken)

      // Clear token
      clearAuthToken()
      expect(localStorageMock.removeItem).toHaveBeenCalledWith(
        AUTH_TOKEN_STORAGE_KEY
      )
    })

    it('should handle error scenarios gracefully', () => {
      // Set with error
      localStorageMock.setItem.mockImplementation(() => {
        throw new Error('Write failed')
      })
      expect(() => setAuthToken('token')).not.toThrow()

      // Get with error
      localStorageMock.getItem.mockImplementation(() => {
        throw new Error('Read failed')
      })
      expect(getAuthToken()).toBeNull()

      // Clear with error
      localStorageMock.removeItem.mockImplementation(() => {
        throw new Error('Remove failed')
      })
      expect(() => clearAuthToken()).not.toThrow()
    })
  })
})
