import { describe, it, expect, vi, beforeEach } from 'vitest'
import { DEFAULT_COLORMAP } from '../constants/defaults'

const mockColormap = vi.fn(() => ['#000000', '#ffffff'])

vi.mock('colormap', () => ({
  default: (...args) => mockColormap(...args)
}))

describe('colorMap', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('uses configured colormap and minimum shade floor of 9', async () => {
    const { colorMap } = await import('./colorMap')
    const result = colorMap(3, { CONFIG_COLORMAP: 'viridis' })

    expect(mockColormap).toHaveBeenCalledWith({
      colormap: 'viridis',
      nshades: 9,
      format: 'hex'
    })
    expect(result).toEqual(['#000000', '#ffffff'])
  })

  it('falls back to default colormap when config value is missing', async () => {
    const { colorMap } = await import('./colorMap')
    colorMap(12.4, {})

    expect(mockColormap).toHaveBeenCalledWith({
      colormap: DEFAULT_COLORMAP,
      nshades: 12,
      format: 'hex'
    })
  })
})
