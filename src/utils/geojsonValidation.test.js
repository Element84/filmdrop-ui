import { describe, it, expect } from 'vitest'
import GeoJSONValidation from './geojsonValidation'

describe('GeoJSONValidation', () => {
  describe('validate', () => {
    it('should return true for valid GeoJSON', () => {
      const geojson = { type: 'Point', coordinates: [0, 0] }
      const result = GeoJSONValidation.validate(geojson)
      expect(result === true)
    })

    it('should return false for invalid GeoJSON', () => {
      const geojson = { type: 'InvalidType', coordinates: [0, 0] }
      const result = GeoJSONValidation.validate(geojson)
      expect(result === false)
    })
  })

  describe('isValidGeoJSON', () => {
    it('should return true for valid GeoJSON', () => {
      const geojson = {
        type: 'Polygon',
        coordinates: [
          [
            [0, 0],
            [1, 1],
            [2, 2],
            [0, 0]
          ]
        ]
      }
      const result = GeoJSONValidation.isValidGeoJSON(geojson)
      expect(result === true)
    })

    it('should return false for invalid GeoJSON', () => {
      const geojson = { type: 'InvalidType', coordinates: [0, 0] }
      const result = GeoJSONValidation.isValidGeoJSON(geojson)
      expect(result === false)
    })
  })

  describe('isValidFeatureCollection', () => {
    it('should return true for valid FeatureCollection', () => {
      const featureCollection = {
        type: 'FeatureCollection',
        features: [
          {
            type: 'Feature',
            properties: { name: 'Feature 1' },
            geometry: { type: 'Point', coordinates: [0, 0] }
          },
          {
            type: 'Feature',
            properties: { name: 'Feature 2' },
            geometry: {
              type: 'LineString',
              coordinates: [
                [0, 0],
                [1, 1]
              ]
            }
          }
        ]
      }
      const result =
        GeoJSONValidation.isValidFeatureCollection(featureCollection)
      expect(result === true)
    })

    it('should return false for invalid FeatureCollection', () => {
      const featureCollection = {
        type: 'FeatureCollection',
        features: [
          {
            type: 'InvalidType',
            properties: { name: 'Feature 1' },
            geometry: { type: 'Point', coordinates: [0, 0] }
          }
        ]
      }
      const result =
        GeoJSONValidation.isValidFeatureCollection(featureCollection)
      expect(result === false)
    })
  })

  describe('isValidFeature', () => {
    it('should return true for valid Feature', () => {
      const feature = {
        type: 'Feature',
        properties: { name: 'Feature 1' },
        geometry: { type: 'Point', coordinates: [0, 0] }
      }
      const result = GeoJSONValidation.isValidFeature(feature)
      expect(result === true)
    })

    it('should return false for invalid Feature', () => {
      const feature = {
        type: 'InvalidType',
        properties: { name: 'Feature 1' },
        geometry: { type: 'Point', coordinates: [0, 0] }
      }
      const result = GeoJSONValidation.isValidFeature(feature)
      expect(result === false)
    })
  })

  describe('isValidGeometry', () => {
    it('should return true for valid Geometry', () => {
      const geometry = { type: 'Point', coordinates: [0, 0] }
      const result = GeoJSONValidation.isValidGeometry(geometry)
      expect(result === true)
    })

    it('should return false for invalid Geometry', () => {
      const geometry = { type: 'InvalidType', coordinates: [0, 0] }
      const result = GeoJSONValidation.isValidGeometry(geometry)
      expect(result === false)
    })
  })

  describe('isValidGeometryCollection', () => {
    it('should return true for valid GeometryCollection', () => {
      const geometryCollection = {
        type: 'GeometryCollection',
        geometries: [
          { type: 'Point', coordinates: [0, 0] },
          {
            type: 'LineString',
            coordinates: [
              [0, 0],
              [1, 1]
            ]
          }
        ]
      }
      const result =
        GeoJSONValidation.isValidGeometryCollection(geometryCollection)
      expect(result === true)
    })

    it('should return false for invalid GeometryCollection', () => {
      const geometryCollection = {
        type: 'GeometryCollection',
        geometries: [{ type: 'InvalidType', coordinates: [0, 0] }]
      }
      const result =
        GeoJSONValidation.isValidGeometryCollection(geometryCollection)
      expect(result === false)
    })
  })
})
