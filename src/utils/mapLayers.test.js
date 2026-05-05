import { describe, it, expect, vi, afterEach } from 'vitest'
import { store } from '../redux/store'
import { getLayerByName } from './mapLayers'

describe('mapLayers getLayerByName', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('returns the matching layer when present', () => {
    const targetLayer = { layer_name: 'target-layer' }
    const otherLayer = { layer_name: 'other-layer' }

    vi.spyOn(store, 'getState').mockReturnValue({
      mainSlice: {
        map: {
          eachLayer(callback) {
            callback(otherLayer)
            callback(targetLayer)
          }
        }
      }
    })

    expect(getLayerByName('target-layer')).toBe(targetLayer)
  })

  it('returns null when no matching layer exists', () => {
    vi.spyOn(store, 'getState').mockReturnValue({
      mainSlice: {
        map: {
          eachLayer(callback) {
            callback({ layer_name: 'other-layer' })
          }
        }
      }
    })

    expect(getLayerByName('missing-layer')).toBeNull()
  })

  it('returns null when map is unavailable', () => {
    vi.spyOn(store, 'getState').mockReturnValue({
      mainSlice: { map: null }
    })

    expect(getLayerByName('anything')).toBeNull()
  })
})
