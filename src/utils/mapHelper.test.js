import { describe, it, expect, vi } from 'vitest'
import { store } from '../redux/store'
import {
  roundCoord,
  bboxFromMapBounds,
  clampAndRoundBbox,
  zoomToCollectionExtent
} from './mapHelper'

describe('mapHelper bbox precision', () => {
  describe('roundCoord', () => {
    it('rounds to 6 decimal places', () => {
      expect(roundCoord(1.123456789012)).toBe(1.123457)
      expect(roundCoord(-45.987654321)).toBe(-45.987654)
    })

    it('returns integers unchanged when within precision', () => {
      expect(roundCoord(0)).toBe(0)
      expect(roundCoord(180)).toBe(180)
      expect(roundCoord(-180)).toBe(-180)
    })

    it('rounds trailing precision beyond 6 decimals', () => {
      expect(roundCoord(10.1234561)).toBe(10.123456)
      expect(roundCoord(10.1234569)).toBe(10.123457)
    })
  })

  describe('bboxFromMapBounds', () => {
    it('returns undefined when map is not available', () => {
      vi.spyOn(store, 'getState').mockReturnValue({
        mainSlice: { map: null }
      })
      expect(bboxFromMapBounds()).toBeUndefined()
    })

    it('returns undefined when map is empty object', () => {
      vi.spyOn(store, 'getState').mockReturnValue({
        mainSlice: { map: {} }
      })
      expect(bboxFromMapBounds()).toBeUndefined()
    })

    it('returns bbox rounded to 6 decimal places when map has bounds', () => {
      const rawBounds = {
        _southWest: { lng: -122.123456789012, lat: 37.987654321098 },
        _northEast: { lng: -121.111222333444, lat: 38.555666777888 }
      }
      vi.spyOn(store, 'getState').mockReturnValue({
        mainSlice: {
          map: {
            getBounds: () => rawBounds
          }
        }
      })
      const result = bboxFromMapBounds()
      expect(result).toEqual([-122.123457, 37.987654, -121.111222, 38.555667])
    })
  })

  describe('clampAndRoundBbox', () => {
    it('returns original value when bbox is missing or too short', () => {
      expect(clampAndRoundBbox(undefined)).toBeUndefined()
      expect(clampAndRoundBbox([1, 2, 3])).toEqual([1, 2, 3])
    })

    it('clamps longitudes to [-180, 180] and rounds all coordinates', () => {
      const input = [-190.1234567, 10.1234567, 200.9876543, -5.9876543]
      const result = clampAndRoundBbox(input)
      expect(result).toEqual([-180, 10.123457, 180, -5.987654])
    })
  })

  describe('zoomToCollectionExtent', () => {
    it('does not throw when map is missing', () => {
      vi.spyOn(store, 'getState').mockReturnValue({
        mainSlice: { map: null }
      })
      const collection = {
        extent: {
          spatial: {
            bbox: [[-10, -10, 10, 10]]
          }
        }
      }
      expect(() => zoomToCollectionExtent(collection, {})).not.toThrow()
    })
  })
})
