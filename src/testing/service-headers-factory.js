import { describe, it, expect, vi, beforeEach } from 'vitest'
import { store } from '../redux/store'
import { setAppConfig } from '../redux/slices/mainSlice'

/**
 * Shared test utility factory for service header validation.
 * Ensures that a service correctly passes Headers object and credentials to fetch.
 *
 * Usage: createHeaderValidationTest(serviceName, serviceFunction, mockResponse)
 *
 * @param {string} serviceName - Name of the service being tested
 * @param {Function} serviceFunction - The service function to test
 * @param {*} mockResponse - The response object to mock fetch with
 * @param {*} callArgs - Arguments to pass to the service function
 */
export function createHeaderValidationTest(
  serviceName,
  serviceFunction,
  mockResponse,
  callArgs,
  options = {}
) {
  describe(`${serviceName} header validation`, () => {
    beforeEach(() => {
      vi.clearAllMocks()
      store.dispatch(
        setAppConfig({
          STAC_API_URL: 'https://stac-api.example.com',
          APP_TOKEN_AUTH_ENABLED: false,
          FETCH_CREDENTIALS: 'same-origin'
        })
      )
      global.fetch = vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: async () => mockResponse
        })
      )
    })

    it('passes Headers object and credentials to fetch', async () => {
      await serviceFunction(...callArgs)

      // Verify fetch was called with proper options
      const fetchCalls = global.fetch.mock.calls
      expect(fetchCalls.length).toBeGreaterThan(0)

      // Find the call with fetch options (second argument)
      const callWithOptions = fetchCalls.find((call) => call[1])
      expect(callWithOptions).toBeDefined()

      const fetchOptions = callWithOptions[1]
      expect(fetchOptions.headers).toBeInstanceOf(Headers)
      expect(fetchOptions.credentials).toBe('same-origin')

      if (options.expectedSignal) {
        expect(fetchOptions.signal).toBe(options.expectedSignal)
      }
    })
  })
}
