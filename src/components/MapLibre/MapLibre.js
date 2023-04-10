import React, { useEffect, useRef, useState } from 'react'
import './MapLibre.css'
import maplibregl from 'maplibre-gl'

// redux imports
import { useDispatch } from 'react-redux'
// you need to import each action you need to use
import { setMap } from '../../redux/slices/mainSlice'

const MapLibre = () => {
  // if you are setting redux state, call dispatch
  const dispatch = useDispatch()
  const MapLibreMap = useRef()
  const [map, setmap] = useState()
  const [layerData, setlayerData] = useState({
    type: 'FeatureCollection',
    features: [
      {
        type: 'Feature',
        properties: {},
        geometry: {
          coordinates: [
            [
              [-116.53949181826262, 45.42481480688633],
              [-116.53949181826262, 37.023609526344075],
              [-108.11235169764377, 37.023609526344075],
              [-108.11235169764377, 45.42481480688633],
              [-116.53949181826262, 45.42481480688633]
            ]
          ],
          type: 'Polygon'
        },
        id: 0
      },
      {
        type: 'Feature',
        properties: {},
        geometry: {
          coordinates: [
            [
              [-104.06702119799883, 37.52040643054576],
              [-104.06702119799883, 32.487644408299246],
              [-99.04748859985898, 32.487644408299246],
              [-99.04748859985898, 37.52040643054576],
              [-104.06702119799883, 37.52040643054576]
            ]
          ],
          type: 'Polygon'
        }
      },
      {
        type: 'Feature',
        properties: {},
        geometry: {
          coordinates: [
            [
              [-98.86060781319975, 45.47607083766235],
              [-98.86060781319975, 42.30420943861398],
              [-95.5762125715788, 42.30420943861398],
              [-95.5762125715788, 45.47607083766235],
              [-98.86060781319975, 45.47607083766235]
            ]
          ],
          type: 'Polygon'
        }
      },
      {
        type: 'Feature',
        properties: {},
        geometry: {
          coordinates: [
            [
              [-87.54742233196085, 37.63299308264595],
              [-87.54742233196085, 32.340485655485026],
              [-81.46987106302282, 32.340485655485026],
              [-81.46987106302282, 37.63299308264595],
              [-87.54742233196085, 37.63299308264595]
            ]
          ],
          type: 'Polygon'
        }
      }
    ]
  })

  useEffect(() => {
    if (MapLibreMap) {
      const libreMap = new maplibregl.Map({
        container: MapLibreMap.current,
        style:
          'https://maps.geo.us-west-2.amazonaws.com/maps/v0/maps/open-data-visualization-dark/style-descriptor?key=v1.public.eyJqdGkiOiI4ZjgxYzIxMS01MjhjLTQwMzAtOTczOS00NDVjNDE1OTcyYzEifZ72i02VanB4I6_k7ZjQOwRUG3yuUyXhvvFFvJanbGt82b8hyYRTEfGiwJHf7ZRUR46vqQuBMcspSzqdLVFxflsHa4H68F4ThPvkTKXr9SzSzTfwEB0pXzqRyjYnmy2CsNwaDTGMPcDU4o4--t3nasvFXZvOw7pS2PbK3SjgU2NCCfCApOUNTa6KOohV9fwCHo0ZQRJUSazNZt_wBdSLWRNXBMWnrkb5-hZiFOk6EDmLphjvgIbTHpvGbQ-f--CDLfXqvs6fVAZ548w76kWVXyxV2V0pIFl7MK8XekKF2BGugiHDR7u-zO8A6G25sELqTMCiaC6Y83QuPC-C1RLXlKY.MGFjMDA4ZmUtYWRiYy00NTgyLTg0Y2MtZTY3MzFlZDRmYTQ1',
        center: [-92.5, 40.5],
        zoom: 3
      })

      // push map into redux here
      // then set up layers and call functions from a mapHelper.js file
      setmap(libreMap)
    }
    // eslint-disable-next-line
  }, [MapLibreMap.current])

  useEffect(() => {
    // update the shared map context when the map loads
    dispatch(setMap(map))
    if (map) {
      map.on('load', function () {
        map.addSource('footprints', {
          type: 'geojson',
          data: layerData
        })

        map.addSource('selectedFootprint', {
          type: 'geojson',
          data: null
        })
        map.addLayer({
          id: 'footprintFill',
          type: 'fill',
          source: 'footprints',
          layout: {},
          paint: {
            'fill-color': '#005AFF',
            'fill-opacity': 0.3
          }
        })
        map.addLayer({
          id: 'footprintOutline',
          type: 'line',
          source: 'footprints',
          layout: {},
          paint: {
            'line-color': '#005AFF',
            'line-width': 2
          }
        })

        map.addLayer({
          id: 'selectedFootprintOutline',
          type: 'line',
          source: 'selectedFootprint',
          layout: {},
          paint: {
            'line-color': '#EA871E',
            'line-width': 2
          }
        })

        map.on('click', function () {
          clearSelectedFootrpints()
        })

        map.on('click', 'footprintFill', function (e) {
          // keep for zoom to feature on polygon click
          //   const coordinates = e.features[0].geometry.coordinates[0]
          //   const bounds = coordinates.reduce(function (bounds, coord) {
          //     return bounds.extend(coord)
          //   }, new maplibregl.LngLatBounds(coordinates[0], coordinates[0]))
          //   const center = bounds.getCenter()
          //   map.easeTo({
          //     center: [center.lng, center.lat],
          //     speed: 5
          //   })

          map.getSource('selectedFootprint').setData(e.features[0])
        })

        // Change the cursor to a pointer when the mouse is over the places layer.
        map.on('mouseenter', 'footprintFill', function () {
          map.getCanvas().style.cursor = 'pointer'
        })
        // Change it back to a pointer when it leaves.
        map.on('mouseleave', 'footprintFill', function () {
          map.getCanvas().style.cursor = ''
        })
      })
    }
  }, [map])

  const titilerURL =
    'https://d3pt8yjfnqefj2.cloudfront.net' +
    '/stac/tiles/{z}/{x}/{y}.png?&url=' +
    'https://earth-search.aws.element84.com/v1/collections/sentinel-2-l2a/items/S2B_22NEF_20221030_0_L2A' +
    '&assets=visual&return_mask=true'
  function changeData() {
    clearSelectedFootrpints()
    const newGeojsonData = {
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          properties: {},
          geometry: {
            coordinates: [
              [
                [-104.30927038634836, 34.34740159966165],
                [-104.30927038634836, 29.775633536042818],
                [-99.67608829292722, 29.775633536042818],
                [-99.67608829292722, 34.34740159966165],
                [-104.30927038634836, 34.34740159966165]
              ]
            ],
            type: 'Polygon'
          }
        },
        {
          type: 'Feature',
          properties: {},
          geometry: {
            coordinates: [
              [
                [-93.60102193024854, 35.44312725170555],
                [-93.60102193024854, 30.07945100355218],
                [-88.46790266520217, 30.07945100355218],
                [-88.46790266520217, 35.44312725170555],
                [-93.60102193024854, 35.44312725170555]
              ]
            ],
            type: 'Polygon'
          }
        },
        {
          type: 'Feature',
          properties: {},
          geometry: {
            coordinates: [
              [
                [-84.51258028661871, 31.386656571015678],
                [-84.51258028661871, 27.23568817277581],
                [-81.34934055836607, 27.23568817277581],
                [-81.34934055836607, 31.386656571015678],
                [-84.51258028661871, 31.386656571015678]
              ]
            ],
            type: 'Polygon'
          }
        },
        {
          type: 'Feature',
          properties: {},
          geometry: {
            coordinates: [
              [
                [-79.34386400690039, 35.569188482938756],
                [-79.34386400690039, 33.51805193147976],
                [-77.10562888740897, 33.51805193147976],
                [-77.10562888740897, 35.569188482938756],
                [-79.34386400690039, 35.569188482938756]
              ]
            ],
            type: 'Polygon'
          }
        },
        {
          type: 'Feature',
          properties: {},
          geometry: {
            coordinates: [
              [
                [-107.03373260532209, 49.87362885645325],
                [-107.03373260532209, 47.196269692552704],
                [-104.03743947442464, 47.196269692552704],
                [-104.03743947442464, 49.87362885645325],
                [-107.03373260532209, 49.87362885645325]
              ]
            ],
            type: 'Polygon'
          }
        }
      ]
    }
    map.getSource('footprints').setData(newGeojsonData)
  }
  function addTileLayer() {
    if (!map.getSource('selectedFootprintTiles')) {
      map.addSource('selectedFootprintTiles', {
        type: 'raster',
        tiles: [titilerURL],
        tileSize: 256,
        bounds: [
          -51.000170769358256, -0.08847367992649674, -50.01337071613283,
          0.90490251308068
        ]
      })
      map.addLayer({
        id: 'selectedFootprintTilesLayer',
        type: 'raster',
        source: 'selectedFootprintTiles',
        paint: {}
      })
      map.fitBounds([
        -51.000170769358256, -0.08847367992649674, -50.01337071613283,
        0.90490251308068
      ])
    }
  }

  function removeTileLayer() {
    if (map.getLayer('selectedFootprintTilesLayer')) {
      map.removeLayer('selectedFootprintTilesLayer')
    }
    if (map.getSource('selectedFootprintTiles')) {
      map.removeSource('selectedFootprintTiles')
    }
  }

  function clearSelectedFootrpints() {
    // clear source data for selected
    map.getSource('selectedFootprint').setData({
      type: 'FeatureCollection',
      features: []
    })
  }

  return (
    <div className="MapLibre" ref={MapLibreMap}>
      <div className="testButton">
        <button onClick={changeData}>swtich layer</button>
        <button onClick={addTileLayer}>add tiles</button>
        <button onClick={removeTileLayer}>remove tiles</button>
      </div>
    </div>
  )
}

export default MapLibre
