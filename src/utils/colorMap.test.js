import { describe, it, expect, vi, beforeEach } from 'vitest'
import { DEFAULT_COLORMAP } from '../constants/defaults'

const mockColormap = vi.fn(() => ['#000000', '#ffffff'])
const mockGetState = vi.fn()

vi.mock('colormap', () => ({
  default: (...args) => mockColormap(...args)
}))

vi.mock('../redux/store', () => ({
  store: {
    getState: () => mockGetState()
  }
}))

describe('colorMap', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('uses configured colormap and minimum shade floor of 9', async () => {
    mockGetState.mockReturnValue({
      mainSlice: {
        appConfig: {
          CONFIG_COLORMAP: 'viridis'
        }
      }
    })

    const { colorMap } = await import('./colorMap')
    const result = colorMap(3)

    expect(mockColormap).toHaveBeenCalledWith({
      colormap: 'viridis',
      nshades: 9,
      format: 'hex'
    })
    expect(result).toEqual(['#000000', '#ffffff'])
  })

  it('falls back to default colormap when config value is missing', async () => {
    mockGetState.mockReturnValue({
      mainSlice: {
        appConfig: {}
      }
    })

    const { colorMap } = await import('./colorMap')
    colorMap(12.4)

    expect(mockColormap).toHaveBeenCalledWith({
      colormap: DEFAULT_COLORMAP,
      nshades: 12,
      format: 'hex'
    })
  })
})
