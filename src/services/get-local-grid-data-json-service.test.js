import { beforeEach, describe, expect, it, vi } from 'vitest'

describe('LoadLocalGridDataService signal forwarding', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('forwards AbortController signal in local grid fetch options', async () => {
    const controller = new AbortController()
    const fetchSpy = vi
      .spyOn(globalThis, 'fetch')
      .mockRejectedValueOnce(new Error('network down'))
    const { LoadLocalGridDataService } = await vi.importActual(
      './get-local-grid-data-json-service'
    )

    await LoadLocalGridDataService('mgrs', controller.signal)

    expect(fetchSpy).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        signal: controller.signal
      })
    )
  })
})
