const GeoJSONValidation = {
  validate: function (geojson) {
    if (
      typeof geojson === 'object' &&
      geojson !== null &&
      'type' in geojson &&
      [
        'Point',
        'MultiPoint',
        'LineString',
        'MultiLineString',
        'Polygon',
        'MultiPolygon',
        'GeometryCollection',
        'Feature',
        'FeatureCollection'
      ].includes(geojson.type)
    ) {
      return true
    }
    return false
  },

  isValidGeoJSON: function (geojson) {
    return this.validate(geojson)
  },

  isValidFeatureCollection: function (featureCollection) {
    return (
      featureCollection.type === 'FeatureCollection' &&
      Array.isArray(featureCollection.features) &&
      featureCollection.features.every(
        (feature) =>
          feature.type === 'Feature' &&
          typeof feature.properties === 'object' &&
          feature.properties !== null &&
          typeof feature.geometry === 'object' &&
          feature.geometry !== null &&
          this.isValidGeoJSON(feature.geometry)
      )
    )
  },

  isValidFeature: function (feature) {
    return (
      feature.type === 'Feature' &&
      typeof feature.properties === 'object' &&
      feature.properties !== null &&
      typeof feature.geometry === 'object' &&
      feature.geometry !== null &&
      this.isValidGeoJSON(feature.geometry)
    )
  },

  isValidGeometry: function (geometry) {
    const validTypes = [
      'Point',
      'MultiPoint',
      'LineString',
      'MultiLineString',
      'Polygon',
      'MultiPolygon',
      'GeometryCollection'
    ]

    if (!validTypes.includes(geometry.type)) {
      return false
    }

    if (geometry.type === 'GeometryCollection') {
      return (
        Array.isArray(geometry.geometries) &&
        geometry.geometries.every(this.isValidGeometry)
      )
    }

    return (
      typeof geometry.coordinates !== 'undefined' &&
      Array.isArray(geometry.coordinates)
    )
  },

  isValidGeometryCollection: function (geometryCollection) {
    return (
      this.isValidGeoJSON(geometryCollection) &&
      geometryCollection.type === 'GeometryCollection' &&
      Array.isArray(geometryCollection.geometries) &&
      geometryCollection.geometries.every(this.isValidGeometry)
    )
  }
}

export default GeoJSONValidation
