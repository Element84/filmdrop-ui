export const mockCollectionsData = [
  {
    id: 'cop-dem-glo-30',
    type: 'Collection',
    links: [
      {
        rel: 'self',
        type: 'application/json',
        href: 'https://earth-search.aws.element84.com/v1/collections/cop-dem-glo-30'
      },
      {
        rel: 'license',
        href: 'https://spacedata.copernicus.eu/documents/20126/0/CSCDA_ESA_Mission-specific+Annex.pdf',
        title: 'Copernicus DEM License'
      },
      {
        rel: 'parent',
        type: 'application/json',
        href: 'https://earth-search.aws.element84.com/v1'
      },
      {
        rel: 'root',
        type: 'application/json',
        href: 'https://earth-search.aws.element84.com/v1'
      },
      {
        rel: 'items',
        type: 'application/geo+json',
        href: 'https://earth-search.aws.element84.com/v1/collections/cop-dem-glo-30/items'
      },
      {
        rel: 'http://www.opengis.net/def/rel/ogc/1.0/queryables',
        type: 'application/schema+json',
        href: 'https://earth-search.aws.element84.com/v1/collections/cop-dem-glo-30/queryables'
      },
      {
        rel: 'aggregate',
        type: 'application/json',
        href: 'https://earth-search.aws.element84.com/v1/collections/cop-dem-glo-30/aggregate',
        method: 'GET'
      },
      {
        rel: 'aggregations',
        type: 'application/json',
        href: 'https://earth-search.aws.element84.com/v1/collections/cop-dem-glo-30/aggregations'
      }
    ],
    title: 'Copernicus DEM GLO-30',
    extent: {
      spatial: {
        bbox: [[-180, -90, 180, 90]]
      },
      temporal: {
        interval: [['2021-04-22T00:00:00Z', '2021-04-22T00:00:00Z']]
      }
    },
    license: 'proprietary',
    keywords: ['Copernicus', 'DEM', 'DSM', 'Elevation'],
    providers: [
      {
        url: 'https://spacedata.copernicus.eu/documents/20123/121286/CSCDA_ESA_Mission-specific+Annex_31_Oct_22.pdf',
        name: 'European Space Agency',
        roles: ['licensor']
      },
      {
        url: 'https://registry.opendata.aws/copernicus-dem/',
        name: 'Sinergise',
        roles: ['producer', 'processor']
      },
      {
        url: 'https://doi.org/10.5069/G9028PQB',
        name: 'OpenTopography',
        roles: ['host']
      },
      {
        name: 'AWS',
        roles: ['host'],
        url: 'https://registry.opendata.aws/sentinel-1'
      },
      {
        name: 'Element 84',
        roles: ['processor'],
        url: 'https://element84.com'
      }
    ],
    summaries: {
      gsd: [30],
      platform: ['tandem-x'],
      'proj:epsg': [4326],
      'storage:platform': ['AWS'],
      'storage:region': ['eu-central-1'],
      'storage:requester_pays': [false]
    },
    description:
      'The Copernicus DEM is a Digital Surface Model (DSM) which represents the surface of the Earth including buildings, infrastructure and vegetation. GLO-30 Public provides limited worldwide coverage at 30 meters because a small subset of tiles covering specific countries are not yet released to the public by the Copernicus Programme.',
    item_assets: {
      data: {
        type: 'image/tiff; application=geotiff; profile=cloud-optimized',
        roles: ['data'],
        title: 'Data',
        'raster:bands': [
          {
            sampling: 'point',
            data_type: 'float32',
            spatial_resolution: 30,
            unit: 'meter'
          }
        ]
      }
    },
    stac_version: '1.0.0',
    stac_extensions: [
      'https://stac-extensions.github.io/item-assets/v1.0.0/schema.json'
    ],
    queryables: {},
    aggregations: [
      {
        name: 'total_count',
        data_type: 'integer'
      },
      {
        name: 'datetime_max',
        data_type: 'datetime'
      },
      {
        name: 'datetime_min',
        data_type: 'datetime'
      },
      {
        name: 'datetime_frequency',
        data_type: 'frequency_distribution',
        frequency_distribution_data_type: 'datetime'
      },
      {
        name: 'grid_code_frequency',
        data_type: 'frequency_distribution',
        frequency_distribution_data_type: 'string'
      },
      {
        name: 'grid_geohex_frequency',
        data_type: 'frequency_distribution',
        frequency_distribution_data_type: 'string'
      },
      {
        name: 'grid_geohash_frequency',
        data_type: 'frequency_distribution',
        frequency_distribution_data_type: 'string'
      },
      {
        name: 'grid_geotile_frequency',
        data_type: 'frequency_distribution',
        frequency_distribution_data_type: 'string'
      }
    ]
  },
  {
    id: 'cop-dem-glo-90',
    type: 'Collection',
    links: [
      {
        rel: 'self',
        type: 'application/json',
        href: 'https://earth-search.aws.element84.com/v1/collections/cop-dem-glo-90'
      },
      {
        rel: 'license',
        href: 'https://spacedata.copernicus.eu/documents/20123/121286/CSCDA_ESA_Mission-specific+Annex_31_Oct_22.pdf',
        title: 'Copernicus DEM License'
      },
      {
        rel: 'parent',
        type: 'application/json',
        href: 'https://earth-search.aws.element84.com/v1'
      },
      {
        rel: 'root',
        type: 'application/json',
        href: 'https://earth-search.aws.element84.com/v1'
      },
      {
        rel: 'items',
        type: 'application/geo+json',
        href: 'https://earth-search.aws.element84.com/v1/collections/cop-dem-glo-90/items'
      },
      {
        rel: 'http://www.opengis.net/def/rel/ogc/1.0/queryables',
        type: 'application/schema+json',
        href: 'https://earth-search.aws.element84.com/v1/collections/cop-dem-glo-90/queryables'
      },
      {
        rel: 'aggregate',
        type: 'application/json',
        href: 'https://earth-search.aws.element84.com/v1/collections/cop-dem-glo-90/aggregate',
        method: 'GET'
      },
      {
        rel: 'aggregations',
        type: 'application/json',
        href: 'https://earth-search.aws.element84.com/v1/collections/cop-dem-glo-90/aggregations'
      }
    ],
    title: 'Copernicus DEM GLO-90',
    extent: {
      spatial: {
        bbox: [[-180, -90, 180, 90]]
      },
      temporal: {
        interval: [['2021-04-22T00:00:00Z', '2021-04-22T00:00:00Z']]
      }
    },
    license: 'proprietary',
    keywords: ['Copernicus', 'DEM', 'Elevation'],
    providers: [
      {
        url: 'https://spacedata.copernicus.eu/documents/20126/0/CSCDA_ESA_Mission-specific+Annex.pdf',
        name: 'European Space Agency',
        roles: ['licensor']
      },
      {
        url: 'https://registry.opendata.aws/copernicus-dem/',
        name: 'Sinergise',
        roles: ['producer', 'processor']
      },
      {
        url: 'https://doi.org/10.5069/G9028PQB',
        name: 'OpenTopography',
        roles: ['host']
      },
      {
        name: 'AWS',
        roles: ['host'],
        url: 'https://registry.opendata.aws/sentinel-1'
      },
      {
        name: 'Element 84',
        roles: ['processor'],
        url: 'https://element84.com'
      }
    ],
    summaries: {
      gsd: [90],
      platform: ['tandem-x'],
      'proj:epsg': [4326],
      'storage:platform': ['AWS'],
      'storage:region': ['eu-central-1'],
      'storage:requester_pays': [false]
    },
    description:
      'The Copernicus DEM is a Digital Surface Model (DSM) which represents the surface of the Earth including buildings, infrastructure and vegetation. GLO-90 provides worldwide coverage at 90 meters.',
    item_assets: {
      data: {
        type: 'image/tiff; application=geotiff; profile=cloud-optimized',
        roles: ['data'],
        title: 'Data',
        'raster:bands': [
          {
            sampling: 'point',
            data_type: 'float32',
            spatial_resolution: 30,
            unit: 'meter'
          }
        ]
      }
    },
    stac_version: '1.0.0',
    stac_extensions: [
      'https://stac-extensions.github.io/item-assets/v1.0.0/schema.json'
    ],
    queryables: {},
    aggregations: [
      {
        name: 'total_count',
        data_type: 'integer'
      },
      {
        name: 'datetime_max',
        data_type: 'datetime'
      },
      {
        name: 'datetime_min',
        data_type: 'datetime'
      },
      {
        name: 'datetime_frequency',
        data_type: 'frequency_distribution',
        frequency_distribution_data_type: 'datetime'
      },
      {
        name: 'grid_code_frequency',
        data_type: 'frequency_distribution',
        frequency_distribution_data_type: 'string'
      },
      {
        name: 'grid_geohex_frequency',
        data_type: 'frequency_distribution',
        frequency_distribution_data_type: 'string'
      },
      {
        name: 'grid_geohash_frequency',
        data_type: 'frequency_distribution',
        frequency_distribution_data_type: 'string'
      },
      {
        name: 'grid_geotile_frequency',
        data_type: 'frequency_distribution',
        frequency_distribution_data_type: 'string'
      }
    ]
  },
  {
    type: 'Collection',
    id: 'sentinel-2-l2a',
    stac_version: '1.0.0',
    description:
      'Global Sentinel-2 data from the Multispectral Instrument (MSI) onboard Sentinel-2',
    links: [
      {
        rel: 'self',
        type: 'application/json',
        href: 'https://earth-search.aws.element84.com/v1/collections/sentinel-2-l2a'
      },
      {
        rel: 'cite-as',
        href: 'https://doi.org/10.5270/S2_-742ikth',
        title:
          'Copernicus Sentinel-2 MSI Level-2A (L2A) Bottom-of-Atmosphere Radiance'
      },
      {
        rel: 'license',
        href: 'https://sentinel.esa.int/documents/247904/690755/Sentinel_Data_Legal_Notice',
        title: 'proprietary'
      },
      {
        rel: 'parent',
        type: 'application/json',
        href: 'https://earth-search.aws.element84.com/v1'
      },
      {
        rel: 'root',
        type: 'application/json',
        href: 'https://earth-search.aws.element84.com/v1'
      },
      {
        rel: 'items',
        type: 'application/geo+json',
        href: 'https://earth-search.aws.element84.com/v1/collections/sentinel-2-l2a/items'
      },
      {
        rel: 'http://www.opengis.net/def/rel/ogc/1.0/queryables',
        type: 'application/schema+json',
        href: 'https://earth-search.aws.element84.com/v1/collections/sentinel-2-l2a/queryables'
      },
      {
        rel: 'aggregate',
        type: 'application/json',
        href: 'https://earth-search.aws.element84.com/v1/collections/sentinel-2-l2a/aggregate',
        method: 'GET'
      },
      {
        rel: 'aggregations',
        type: 'application/json',
        href: 'https://earth-search.aws.element84.com/v1/collections/sentinel-2-l2a/aggregations'
      }
    ],
    stac_extensions: [
      'https://stac-extensions.github.io/item-assets/v1.0.0/schema.json',
      'https://stac-extensions.github.io/view/v1.0.0/schema.json',
      'https://stac-extensions.github.io/scientific/v1.0.0/schema.json',
      'https://stac-extensions.github.io/raster/v1.1.0/schema.json',
      'https://stac-extensions.github.io/eo/v1.0.0/schema.json'
    ],
    item_assets: {
      aot: {
        type: 'image/tiff; application=geotiff; profile=cloud-optimized',
        title: 'Aerosol optical thickness (AOT)',
        'proj:shape': [5490, 5490],
        'proj:transform': [20, 0, 399960, 0, -20, 4900020],
        'raster:bands': [
          {
            nodata: 0,
            data_type: 'uint16',
            bits_per_sample: 15,
            spatial_resolution: 20,
            scale: 0.001,
            offset: 0
          }
        ],
        roles: ['data', 'reflectance']
      },
      blue: {
        type: 'image/tiff; application=geotiff; profile=cloud-optimized',
        title: 'Blue (band 2) - 10m',
        'eo:bands': [
          {
            name: 'blue',
            common_name: 'blue',
            description: 'Blue (band 2)',
            center_wavelength: 0.49,
            full_width_half_max: 0.098
          }
        ],
        gsd: 10,
        'proj:shape': [10980, 10980],
        'proj:transform': [10, 0, 399960, 0, -10, 4900020],
        'raster:bands': [
          {
            nodata: 0,
            data_type: 'uint16',
            bits_per_sample: 15,
            spatial_resolution: 10,
            scale: 0.0001,
            offset: 0
          }
        ],
        roles: ['data', 'reflectance']
      },
      coastal: {
        type: 'image/tiff; application=geotiff; profile=cloud-optimized',
        title: 'Coastal aerosol (band 1) - 60m',
        'eo:bands': [
          {
            name: 'coastal',
            common_name: 'coastal',
            description: 'Coastal aerosol (band 1)',
            center_wavelength: 0.443,
            full_width_half_max: 0.027
          }
        ],
        gsd: 60,
        'proj:shape': [1830, 1830],
        'proj:transform': [60, 0, 399960, 0, -60, 4900020],
        'raster:bands': [
          {
            nodata: 0,
            data_type: 'uint16',
            bits_per_sample: 15,
            spatial_resolution: 60,
            scale: 0.0001,
            offset: 0
          }
        ],
        roles: ['data', 'reflectance']
      },
      granule_metadata: {
        type: 'application/xml',
        roles: ['metadata']
      },
      green: {
        type: 'image/tiff; application=geotiff; profile=cloud-optimized',
        title: 'Green (band 3) - 10m',
        'eo:bands': [
          {
            name: 'green',
            common_name: 'green',
            description: 'Green (band 3)',
            center_wavelength: 0.56,
            full_width_half_max: 0.045
          }
        ],
        gsd: 10,
        'proj:shape': [10980, 10980],
        'proj:transform': [10, 0, 399960, 0, -10, 4900020],
        'raster:bands': [
          {
            nodata: 0,
            data_type: 'uint16',
            bits_per_sample: 15,
            spatial_resolution: 10,
            scale: 0.0001,
            offset: 0
          }
        ],
        roles: ['data', 'reflectance']
      },
      nir: {
        type: 'image/tiff; application=geotiff; profile=cloud-optimized',
        title: 'NIR 1 (band 8) - 10m',
        'eo:bands': [
          {
            name: 'nir',
            common_name: 'nir',
            description: 'NIR 1 (band 8)',
            center_wavelength: 0.842,
            full_width_half_max: 0.145
          }
        ],
        gsd: 10,
        'proj:shape': [10980, 10980],
        'proj:transform': [10, 0, 399960, 0, -10, 4900020],
        'raster:bands': [
          {
            nodata: 0,
            data_type: 'uint16',
            bits_per_sample: 15,
            spatial_resolution: 10,
            scale: 0.0001,
            offset: 0
          }
        ],
        roles: ['data', 'reflectance']
      },
      nir08: {
        type: 'image/tiff; application=geotiff; profile=cloud-optimized',
        title: 'NIR 2 (band 8A) - 20m',
        'eo:bands': [
          {
            name: 'nir08',
            common_name: 'nir08',
            description: 'NIR 2 (band 8A)',
            center_wavelength: 0.865,
            full_width_half_max: 0.033
          }
        ],
        gsd: 20,
        'proj:shape': [5490, 5490],
        'proj:transform': [20, 0, 399960, 0, -20, 4900020],
        'raster:bands': [
          {
            nodata: 0,
            data_type: 'uint16',
            bits_per_sample: 15,
            spatial_resolution: 20,
            scale: 0.0001,
            offset: 0
          }
        ],
        roles: ['data', 'reflectance']
      },
      nir09: {
        type: 'image/tiff; application=geotiff; profile=cloud-optimized',
        title: 'NIR 3 (band 9) - 60m',
        'eo:bands': [
          {
            name: 'nir09',
            common_name: 'nir09',
            description: 'NIR 3 (band 9)',
            center_wavelength: 0.945,
            full_width_half_max: 0.026
          }
        ],
        gsd: 60,
        'proj:shape': [1830, 1830],
        'proj:transform': [60, 0, 399960, 0, -60, 4900020],
        'raster:bands': [
          {
            nodata: 0,
            data_type: 'uint16',
            bits_per_sample: 15,
            spatial_resolution: 60,
            scale: 0.0001,
            offset: 0
          }
        ],
        roles: ['data', 'reflectance']
      },
      red: {
        type: 'image/tiff; application=geotiff; profile=cloud-optimized',
        title: 'Red (band 4) - 10m',
        'eo:bands': [
          {
            name: 'red',
            common_name: 'red',
            description: 'Red (band 4)',
            center_wavelength: 0.665,
            full_width_half_max: 0.038
          }
        ],
        gsd: 10,
        'proj:shape': [10980, 10980],
        'proj:transform': [10, 0, 399960, 0, -10, 4900020],
        'raster:bands': [
          {
            nodata: 0,
            data_type: 'uint16',
            bits_per_sample: 15,
            spatial_resolution: 10,
            scale: 0.0001,
            offset: 0
          }
        ],
        roles: ['data', 'reflectance']
      },
      rededge1: {
        type: 'image/tiff; application=geotiff; profile=cloud-optimized',
        title: 'Red edge 1 (band 5) - 20m',
        'eo:bands': [
          {
            name: 'rededge1',
            common_name: 'rededge',
            description: 'Red edge 1 (band 5)',
            center_wavelength: 0.704,
            full_width_half_max: 0.019
          }
        ],
        gsd: 20,
        'proj:shape': [5490, 5490],
        'proj:transform': [20, 0, 399960, 0, -20, 4900020],
        'raster:bands': [
          {
            nodata: 0,
            data_type: 'uint16',
            bits_per_sample: 15,
            spatial_resolution: 20,
            scale: 0.0001,
            offset: 0
          }
        ],
        roles: ['data', 'reflectance']
      },
      rededge2: {
        type: 'image/tiff; application=geotiff; profile=cloud-optimized',
        title: 'Red edge 2 (band 6) - 20m',
        'eo:bands': [
          {
            name: 'rededge2',
            common_name: 'rededge',
            description: 'Red edge 2 (band 6)',
            center_wavelength: 0.74,
            full_width_half_max: 0.018
          }
        ],
        gsd: 20,
        'proj:shape': [5490, 5490],
        'proj:transform': [20, 0, 399960, 0, -20, 4900020],
        'raster:bands': [
          {
            nodata: 0,
            data_type: 'uint16',
            bits_per_sample: 15,
            spatial_resolution: 20,
            scale: 0.0001,
            offset: 0
          }
        ],
        roles: ['data', 'reflectance']
      },
      rededge3: {
        type: 'image/tiff; application=geotiff; profile=cloud-optimized',
        title: 'Red edge 3 (band 7) - 20m',
        'eo:bands': [
          {
            name: 'rededge3',
            common_name: 'rededge',
            description: 'Red edge 3 (band 7)',
            center_wavelength: 0.783,
            full_width_half_max: 0.028
          }
        ],
        gsd: 20,
        'proj:shape': [5490, 5490],
        'proj:transform': [20, 0, 399960, 0, -20, 4900020],
        'raster:bands': [
          {
            nodata: 0,
            data_type: 'uint16',
            bits_per_sample: 15,
            spatial_resolution: 20,
            scale: 0.0001,
            offset: 0
          }
        ],
        roles: ['data', 'reflectance']
      },
      scl: {
        type: 'image/tiff; application=geotiff; profile=cloud-optimized',
        title: 'Scene classification map (SCL)',
        'proj:shape': [5490, 5490],
        'proj:transform': [20, 0, 399960, 0, -20, 4900020],
        'raster:bands': [
          {
            nodata: 0,
            data_type: 'uint8',
            spatial_resolution: 20
          }
        ],
        roles: ['data', 'reflectance']
      },
      swir16: {
        type: 'image/tiff; application=geotiff; profile=cloud-optimized',
        title: 'SWIR 1 (band 11) - 20m',
        'eo:bands': [
          {
            name: 'swir16',
            common_name: 'swir16',
            description: 'SWIR 1 (band 11)',
            center_wavelength: 1.61,
            full_width_half_max: 0.143
          }
        ],
        gsd: 20,
        'proj:shape': [5490, 5490],
        'proj:transform': [20, 0, 399960, 0, -20, 4900020],
        'raster:bands': [
          {
            nodata: 0,
            data_type: 'uint16',
            bits_per_sample: 15,
            spatial_resolution: 20,
            scale: 0.0001,
            offset: 0
          }
        ],
        roles: ['data', 'reflectance']
      },
      swir22: {
        type: 'image/tiff; application=geotiff; profile=cloud-optimized',
        title: 'SWIR 2 (band 12) - 20m',
        'eo:bands': [
          {
            name: 'swir22',
            common_name: 'swir22',
            description: 'SWIR 2 (band 12)',
            center_wavelength: 2.19,
            full_width_half_max: 0.242
          }
        ],
        gsd: 20,
        'proj:shape': [5490, 5490],
        'proj:transform': [20, 0, 399960, 0, -20, 4900020],
        'raster:bands': [
          {
            nodata: 0,
            data_type: 'uint16',
            bits_per_sample: 15,
            spatial_resolution: 20,
            scale: 0.0001,
            offset: 0
          }
        ],
        roles: ['data', 'reflectance']
      },
      thumbnail: {
        type: 'image/jpeg',
        title: 'Thumbnail image',
        roles: ['thumbnail']
      },
      tileinfo_metadata: {
        type: 'application/json',
        roles: ['metadata']
      },
      visual: {
        type: 'image/tiff; application=geotiff; profile=cloud-optimized',
        title: 'True color image',
        'eo:bands': [
          {
            name: 'red',
            common_name: 'red',
            description: 'Red (band 4)',
            center_wavelength: 0.665,
            full_width_half_max: 0.038
          },
          {
            name: 'green',
            common_name: 'green',
            description: 'Green (band 3)',
            center_wavelength: 0.56,
            full_width_half_max: 0.045
          },
          {
            name: 'blue',
            common_name: 'blue',
            description: 'Blue (band 2)',
            center_wavelength: 0.49,
            full_width_half_max: 0.098
          }
        ],
        'proj:shape': [10980, 10980],
        'proj:transform': [10, 0, 399960, 0, -10, 4900020],
        roles: ['visual']
      },
      wvp: {
        type: 'image/tiff; application=geotiff; profile=cloud-optimized',
        title: 'Water vapour (WVP)',
        'proj:shape': [5490, 5490],
        'proj:transform': [20, 0, 399960, 0, -20, 4900020],
        'raster:bands': [
          {
            nodata: 0,
            data_type: 'uint16',
            bits_per_sample: 15,
            spatial_resolution: 20,
            unit: 'cm',
            scale: 0.001,
            offset: 0
          }
        ],
        roles: ['data', 'reflectance']
      },
      'aot-jp2': {
        type: 'image/jp2',
        title: 'Aerosol optical thickness (AOT)',
        'proj:shape': [5490, 5490],
        'proj:transform': [20, 0, 399960, 0, -20, 4900020],
        'raster:bands': [
          {
            nodata: 0,
            data_type: 'uint16',
            bits_per_sample: 15,
            spatial_resolution: 20,
            scale: 0.001,
            offset: 0
          }
        ],
        roles: ['data', 'reflectance']
      },
      'blue-jp2': {
        type: 'image/jp2',
        title: 'Blue (band 2) - 10m',
        'eo:bands': [
          {
            name: 'blue',
            common_name: 'blue',
            description: 'Blue (band 2)',
            center_wavelength: 0.49,
            full_width_half_max: 0.098
          }
        ],
        gsd: 10,
        'proj:shape': [10980, 10980],
        'proj:transform': [10, 0, 399960, 0, -10, 4900020],
        'raster:bands': [
          {
            nodata: 0,
            data_type: 'uint16',
            bits_per_sample: 15,
            spatial_resolution: 10,
            scale: 0.0001,
            offset: 0
          }
        ],
        roles: ['data', 'reflectance']
      },
      'coastal-jp2': {
        type: 'image/jp2',
        title: 'Coastal aerosol (band 1) - 60m',
        'eo:bands': [
          {
            name: 'coastal',
            common_name: 'coastal',
            description: 'Coastal aerosol (band 1)',
            center_wavelength: 0.443,
            full_width_half_max: 0.027
          }
        ],
        gsd: 60,
        'proj:shape': [1830, 1830],
        'proj:transform': [60, 0, 399960, 0, -60, 4900020],
        'raster:bands': [
          {
            nodata: 0,
            data_type: 'uint16',
            bits_per_sample: 15,
            spatial_resolution: 60,
            scale: 0.0001,
            offset: 0
          }
        ],
        roles: ['data', 'reflectance']
      },
      'green-jp2': {
        type: 'image/jp2',
        title: 'Green (band 3) - 10m',
        'eo:bands': [
          {
            name: 'green',
            common_name: 'green',
            description: 'Green (band 3)',
            center_wavelength: 0.56,
            full_width_half_max: 0.045
          }
        ],
        gsd: 10,
        'proj:shape': [10980, 10980],
        'proj:transform': [10, 0, 399960, 0, -10, 4900020],
        'raster:bands': [
          {
            nodata: 0,
            data_type: 'uint16',
            bits_per_sample: 15,
            spatial_resolution: 10,
            scale: 0.0001,
            offset: 0
          }
        ],
        roles: ['data', 'reflectance']
      },
      'nir-jp2': {
        type: 'image/jp2',
        title: 'NIR 1 (band 8) - 10m',
        'eo:bands': [
          {
            name: 'nir',
            common_name: 'nir',
            description: 'NIR 1 (band 8)',
            center_wavelength: 0.842,
            full_width_half_max: 0.145
          }
        ],
        gsd: 10,
        'proj:shape': [10980, 10980],
        'proj:transform': [10, 0, 399960, 0, -10, 4900020],
        'raster:bands': [
          {
            nodata: 0,
            data_type: 'uint16',
            bits_per_sample: 15,
            spatial_resolution: 10,
            scale: 0.0001,
            offset: 0
          }
        ],
        roles: ['data', 'reflectance']
      },
      'nir08-jp2': {
        type: 'image/jp2',
        title: 'NIR 2 (band 8A) - 20m',
        'eo:bands': [
          {
            name: 'nir08',
            common_name: 'nir08',
            description: 'NIR 2 (band 8A)',
            center_wavelength: 0.865,
            full_width_half_max: 0.033
          }
        ],
        gsd: 20,
        'proj:shape': [5490, 5490],
        'proj:transform': [20, 0, 399960, 0, -20, 4900020],
        'raster:bands': [
          {
            nodata: 0,
            data_type: 'uint16',
            bits_per_sample: 15,
            spatial_resolution: 20,
            scale: 0.0001,
            offset: 0
          }
        ],
        roles: ['data', 'reflectance']
      },
      'nir09-jp2': {
        type: 'image/jp2',
        title: 'NIR 3 (band 9) - 60m',
        'eo:bands': [
          {
            name: 'nir09',
            common_name: 'nir09',
            description: 'NIR 3 (band 9)',
            center_wavelength: 0.945,
            full_width_half_max: 0.026
          }
        ],
        gsd: 60,
        'proj:shape': [1830, 1830],
        'proj:transform': [60, 0, 399960, 0, -60, 4900020],
        'raster:bands': [
          {
            nodata: 0,
            data_type: 'uint16',
            bits_per_sample: 15,
            spatial_resolution: 60,
            scale: 0.0001,
            offset: 0
          }
        ],
        roles: ['data', 'reflectance']
      },
      'red-jp2': {
        type: 'image/jp2',
        title: 'Red (band 4) - 10m',
        'eo:bands': [
          {
            name: 'red',
            common_name: 'red',
            description: 'Red (band 4)',
            center_wavelength: 0.665,
            full_width_half_max: 0.038
          }
        ],
        gsd: 10,
        'proj:shape': [10980, 10980],
        'proj:transform': [10, 0, 399960, 0, -10, 4900020],
        'raster:bands': [
          {
            nodata: 0,
            data_type: 'uint16',
            bits_per_sample: 15,
            spatial_resolution: 10,
            scale: 0.0001,
            offset: 0
          }
        ],
        roles: ['data', 'reflectance']
      },
      'rededge1-jp2': {
        type: 'image/jp2',
        title: 'Red edge 1 (band 5) - 20m',
        'eo:bands': [
          {
            name: 'rededge1',
            common_name: 'rededge',
            description: 'Red edge 1 (band 5)',
            center_wavelength: 0.704,
            full_width_half_max: 0.019
          }
        ],
        gsd: 20,
        'proj:shape': [5490, 5490],
        'proj:transform': [20, 0, 399960, 0, -20, 4900020],
        'raster:bands': [
          {
            nodata: 0,
            data_type: 'uint16',
            bits_per_sample: 15,
            spatial_resolution: 20,
            scale: 0.0001,
            offset: 0
          }
        ],
        roles: ['data', 'reflectance']
      },
      'rededge2-jp2': {
        type: 'image/jp2',
        title: 'Red edge 2 (band 6) - 20m',
        'eo:bands': [
          {
            name: 'rededge2',
            common_name: 'rededge',
            description: 'Red edge 2 (band 6)',
            center_wavelength: 0.74,
            full_width_half_max: 0.018
          }
        ],
        gsd: 20,
        'proj:shape': [5490, 5490],
        'proj:transform': [20, 0, 399960, 0, -20, 4900020],
        'raster:bands': [
          {
            nodata: 0,
            data_type: 'uint16',
            bits_per_sample: 15,
            spatial_resolution: 20,
            scale: 0.0001,
            offset: 0
          }
        ],
        roles: ['data', 'reflectance']
      },
      'rededge3-jp2': {
        type: 'image/jp2',
        title: 'Red edge 3 (band 7) - 20m',
        'eo:bands': [
          {
            name: 'rededge3',
            common_name: 'rededge',
            description: 'Red edge 3 (band 7)',
            center_wavelength: 0.783,
            full_width_half_max: 0.028
          }
        ],
        gsd: 20,
        'proj:shape': [5490, 5490],
        'proj:transform': [20, 0, 399960, 0, -20, 4900020],
        'raster:bands': [
          {
            nodata: 0,
            data_type: 'uint16',
            bits_per_sample: 15,
            spatial_resolution: 20,
            scale: 0.0001,
            offset: 0
          }
        ],
        roles: ['data', 'reflectance']
      },
      'scl-jp2': {
        type: 'image/jp2',
        title: 'Scene classification map (SCL)',
        'proj:shape': [5490, 5490],
        'proj:transform': [20, 0, 399960, 0, -20, 4900020],
        'raster:bands': [
          {
            nodata: 0,
            data_type: 'uint8',
            spatial_resolution: 20
          }
        ],
        roles: ['data', 'reflectance']
      },
      'swir16-jp2': {
        type: 'image/jp2',
        title: 'SWIR 1 (band 11) - 20m',
        'eo:bands': [
          {
            name: 'swir16',
            common_name: 'swir16',
            description: 'SWIR 1 (band 11)',
            center_wavelength: 1.61,
            full_width_half_max: 0.143
          }
        ],
        gsd: 20,
        'proj:shape': [5490, 5490],
        'proj:transform': [20, 0, 399960, 0, -20, 4900020],
        'raster:bands': [
          {
            nodata: 0,
            data_type: 'uint16',
            bits_per_sample: 15,
            spatial_resolution: 20,
            scale: 0.0001,
            offset: 0
          }
        ],
        roles: ['data', 'reflectance']
      },
      'swir22-jp2': {
        type: 'image/jp2',
        title: 'SWIR 2 (band 12) - 20m',
        'eo:bands': [
          {
            name: 'swir22',
            common_name: 'swir22',
            description: 'SWIR 2 (band 12)',
            center_wavelength: 2.19,
            full_width_half_max: 0.242
          }
        ],
        gsd: 20,
        'proj:shape': [5490, 5490],
        'proj:transform': [20, 0, 399960, 0, -20, 4900020],
        'raster:bands': [
          {
            nodata: 0,
            data_type: 'uint16',
            bits_per_sample: 15,
            spatial_resolution: 20,
            scale: 0.0001,
            offset: 0
          }
        ],
        roles: ['data', 'reflectance']
      },
      'visual-jp2': {
        type: 'image/jp2',
        title: 'True color image',
        'eo:bands': [
          {
            name: 'red',
            common_name: 'red',
            description: 'Red (band 4)',
            center_wavelength: 0.665,
            full_width_half_max: 0.038
          },
          {
            name: 'green',
            common_name: 'green',
            description: 'Green (band 3)',
            center_wavelength: 0.56,
            full_width_half_max: 0.045
          },
          {
            name: 'blue',
            common_name: 'blue',
            description: 'Blue (band 2)',
            center_wavelength: 0.49,
            full_width_half_max: 0.098
          }
        ],
        'proj:shape': [10980, 10980],
        'proj:transform': [10, 0, 399960, 0, -10, 4900020],
        roles: ['visual']
      },
      'wvp-jp2': {
        type: 'image/jp2',
        title: 'Water vapour (WVP)',
        'proj:shape': [5490, 5490],
        'proj:transform': [20, 0, 399960, 0, -20, 4900020],
        'raster:bands': [
          {
            nodata: 0,
            data_type: 'uint16',
            bits_per_sample: 15,
            spatial_resolution: 20,
            unit: 'cm',
            scale: 0.001,
            offset: 0
          }
        ],
        roles: ['data', 'reflectance']
      }
    },
    title: 'Sentinel-2 Level 2A',
    extent: {
      spatial: {
        bbox: [[-180, -90, 180, 90]]
      },
      temporal: {
        interval: [['2015-06-27T10:25:31.456000Z', null]]
      }
    },
    license: 'proprietary',
    keywords: ['sentinel', 'earth observation', 'esa'],
    providers: [
      {
        name: 'ESA',
        roles: ['producer'],
        url: 'https://earth.esa.int/web/guest/home'
      },
      {
        name: 'Sinergise',
        roles: ['processor'],
        url: 'https://registry.opendata.aws/sentinel-2/'
      },
      {
        name: 'AWS',
        roles: ['host'],
        url: 'http://sentinel-pds.s3-website.eu-central-1.amazonaws.com/'
      },
      {
        name: 'Element 84',
        roles: ['processor'],
        url: 'https://element84.com'
      }
    ],
    summaries: {
      platform: ['sentinel-2a', 'sentinel-2b'],
      constellation: ['sentinel-2'],
      instruments: ['msi'],
      gsd: [10, 20, 60],
      'view:off_nadir': [0],
      'sci:doi': ['10.5270/s2_-znk9xsj'],
      'eo:bands': [
        {
          name: 'coastal',
          common_name: 'coastal',
          description: 'Coastal aerosol (band 1)',
          center_wavelength: 0.443,
          full_width_half_max: 0.027
        },
        {
          name: 'blue',
          common_name: 'blue',
          description: 'Blue (band 2)',
          center_wavelength: 0.49,
          full_width_half_max: 0.098
        },
        {
          name: 'green',
          common_name: 'green',
          description: 'Green (band 3)',
          center_wavelength: 0.56,
          full_width_half_max: 0.045
        },
        {
          name: 'red',
          common_name: 'red',
          description: 'Red (band 4)',
          center_wavelength: 0.665,
          full_width_half_max: 0.038
        },
        {
          name: 'rededge1',
          common_name: 'rededge',
          description: 'Red edge 1 (band 5)',
          center_wavelength: 0.704,
          full_width_half_max: 0.019
        },
        {
          name: 'rededge2',
          common_name: 'rededge',
          description: 'Red edge 2 (band 6)',
          center_wavelength: 0.74,
          full_width_half_max: 0.018
        },
        {
          name: 'rededge3',
          common_name: 'rededge',
          description: 'Red edge 3 (band 7)',
          center_wavelength: 0.783,
          full_width_half_max: 0.028
        },
        {
          name: 'nir',
          common_name: 'nir',
          description: 'NIR 1 (band 8)',
          center_wavelength: 0.842,
          full_width_half_max: 0.145
        },
        {
          name: 'nir08',
          common_name: 'nir08',
          description: 'NIR 2 (band 8A)',
          center_wavelength: 0.865,
          full_width_half_max: 0.033
        },
        {
          name: 'nir09',
          common_name: 'nir09',
          description: 'NIR 3 (band 9)',
          center_wavelength: 0.945,
          full_width_half_max: 0.026
        },
        {
          name: 'cirrus',
          common_name: 'cirrus',
          description: 'Cirrus (band 10)',
          center_wavelength: 1.3735,
          full_width_half_max: 0.075
        },
        {
          name: 'swir16',
          common_name: 'swir16',
          description: 'SWIR 1 (band 11)',
          center_wavelength: 1.61,
          full_width_half_max: 0.143
        },
        {
          name: 'swir22',
          common_name: 'swir22',
          description: 'SWIR 2 (band 12)',
          center_wavelength: 2.19,
          full_width_half_max: 0.242
        }
      ]
    },
    queryables: {
      'eo:cloud_cover': {
        $ref: 'https://stac-extensions.github.io/eo/v1.0.0/schema.json#/definitions/fields/properties/eo:cloud_cover'
      }
    },
    aggregations: [
      {
        name: 'total_count',
        data_type: 'integer'
      },
      {
        name: 'datetime_max',
        data_type: 'datetime'
      },
      {
        name: 'datetime_min',
        data_type: 'datetime'
      },
      {
        name: 'datetime_frequency',
        data_type: 'frequency_distribution',
        frequency_distribution_data_type: 'datetime'
      },
      {
        name: 'cloud_cover_frequency',
        data_type: 'frequency_distribution',
        frequency_distribution_data_type: 'numeric_range'
      },
      {
        name: 'grid_code_frequency',
        data_type: 'frequency_distribution',
        frequency_distribution_data_type: 'string'
      },
      {
        name: 'sun_elevation_frequency',
        data_type: 'frequency_distribution',
        frequency_distribution_data_type: 'numeric'
      },
      {
        name: 'sun_azimuth_frequency',
        data_type: 'frequency_distribution',
        frequency_distribution_data_type: 'numeric'
      }
    ]
  }
]

export const mockHexAggregateSearchResult = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [-80.01080290275773, 38.436980628495995],
            [-80.65177495480032, 38.08929821612251],
            [-80.54985392691755, 37.512571407425945],
            [-79.82307511536334, 37.28115642854936],
            [-79.18663376488544, 37.620239009723846],
            [-79.27234864709443, 38.199240001504954],
            [-80.01080290275773, 38.436980628495995]
          ]
        ]
      },
      properties: {
        frequency: 2,
        colorRatio: 5000,
        largestRatio: 5000
      }
    }
  ],
  numberMatched: 2,
  searchType: 'AggregatedResults',
  properties: {
    largestRatio: 5000,
    largestFrequency: 2,
    overflow: 0
  }
}

export const mockGridAggregateSearchResult = {
  type: 'FeatureCollection',
  features: [
    {
      geometry: {
        type: 'MultiPolygon',
        coordinates: [
          [
            [
              [-81, 37.948],
              [-79.751, 37.941],
              [-79.767, 36.951],
              [-81, 36.958],
              [-81, 37.948]
            ]
          ]
        ]
      },
      type: 'Feature',
      properties: {
        'grid:code': 'MGRS-17SNB',
        frequency: 1
      }
    },
    {
      geometry: {
        type: 'MultiPolygon',
        coordinates: [
          [
            [
              [-79.862, 37.942],
              [-78.613, 37.923],
              [-78.644, 36.935],
              [-79.877, 36.953],
              [-79.862, 37.942]
            ]
          ]
        ]
      },
      type: 'Feature',
      properties: {
        'grid:code': 'MGRS-17SPB',
        frequency: 1
      }
    }
  ],
  numberMatched: 2,
  searchType: 'AggregatedResults',
  properties: {
    overflow: 0
  }
}

export const mockSceneSearchResult = {
  type: 'FeatureCollection',
  stac_version: '1.0.0',
  stac_extensions: [],
  context: {
    limit: 200,
    matched: 2,
    returned: 2
  },
  numberMatched: 2,
  numberReturned: 2,
  features: [
    {
      type: 'Feature',
      stac_version: '1.0.0',
      id: 'S2A_17SNB_20230617_0_L2A',
      properties: {
        created: '2023-06-18T03:56:32.136Z',
        platform: 'sentinel-2a',
        constellation: 'sentinel-2',
        instruments: ['msi'],
        'eo:cloud_cover': 8.338974,
        'proj:epsg': 32617,
        'mgrs:utm_zone': 17,
        'mgrs:latitude_band': 'S',
        'mgrs:grid_square': 'NB',
        'grid:code': 'MGRS-17SNB',
        'view:sun_azimuth': 128.501676552951,
        'view:sun_elevation': 69.5330161202619,
        's2:degraded_msi_data_percentage': 0.0128,
        's2:nodata_pixel_percentage': 12.665635,
        's2:saturated_defective_pixel_percentage': 0,
        's2:dark_features_percentage': 0.049144,
        's2:cloud_shadow_percentage': 2.890608,
        's2:vegetation_percentage': 85.403728,
        's2:not_vegetated_percentage': 2.816873,
        's2:water_percentage': 0.232108,
        's2:unclassified_percentage': 0.268571,
        's2:medium_proba_clouds_percentage': 3.02945,
        's2:high_proba_clouds_percentage': 1.173141,
        's2:thin_cirrus_percentage': 4.136382,
        's2:snow_ice_percentage': 0,
        's2:product_type': 'S2MSI2A',
        's2:processing_baseline': '05.09',
        's2:product_uri':
          'S2A_MSIL2A_20230617T155821_N0509_R097_T17SNB_20230617T231852.SAFE',
        's2:generation_time': '2023-06-17T23:18:52.000000Z',
        's2:datatake_id': 'GS2A_20230617T155821_041707_N05.09',
        's2:datatake_type': 'INS-NOBS',
        's2:datastrip_id':
          'S2A_OPER_MSI_L2A_DS_2APS_20230617T231852_S20230617T161043_N05.09',
        's2:granule_id':
          'S2A_OPER_MSI_L2A_TL_2APS_20230617T231852_A041707_T17SNB_N05.09',
        's2:reflectance_conversion_factor': 0.969515541547683,
        datetime: '2023-06-17T16:13:04.731000Z',
        's2:sequence': '0',
        'earthsearch:s3_path':
          's3://sentinel-cogs/sentinel-s2-l2a-cogs/17/S/NB/2023/6/S2A_17SNB_20230617_0_L2A',
        'earthsearch:payload_id':
          'roda-sentinel2/workflow-sentinel2-to-stac/4657103f0b5df4700838c7430ec8d084',
        'earthsearch:boa_offset_applied': true,
        'processing:software': {
          'sentinel2-to-stac': '0.1.0'
        },
        updated: '2023-06-18T03:56:32.136Z'
      },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [-80.69925789708786, 37.94719620724708],
            [-79.75065723902863, 37.94094734012891],
            [-79.76700583572914, 36.951488600423914],
            [-80.9828826562716, 36.957888875773584],
            [-80.89468016417891, 37.26375638212279],
            [-80.69925789708786, 37.94719620724708]
          ]
        ]
      },
      links: [
        {
          rel: 'self',
          type: 'application/geo+json',
          href: 'https://earth-search.aws.element84.com/v1/collections/sentinel-2-l2a/items/S2A_17SNB_20230617_0_L2A'
        },
        {
          rel: 'canonical',
          href: 's3://sentinel-cogs/sentinel-s2-l2a-cogs/17/S/NB/2023/6/S2A_17SNB_20230617_0_L2A/S2A_17SNB_20230617_0_L2A.json',
          type: 'application/json'
        },
        {
          rel: 'license',
          href: 'https://sentinel.esa.int/documents/247904/690755/Sentinel_Data_Legal_Notice'
        },
        {
          rel: 'derived_from',
          href: 'https://earth-search.aws.element84.com/v1/collections/sentinel-2-l1c/items/S2A_17SNB_20230617_0_L1C',
          type: 'application/geo+json'
        },
        {
          rel: 'parent',
          type: 'application/json',
          href: 'https://earth-search.aws.element84.com/v1/collections/sentinel-2-l2a'
        },
        {
          rel: 'collection',
          type: 'application/json',
          href: 'https://earth-search.aws.element84.com/v1/collections/sentinel-2-l2a'
        },
        {
          rel: 'root',
          type: 'application/json',
          href: 'https://earth-search.aws.element84.com/v1'
        },
        {
          rel: 'thumbnail',
          href: 'https://earth-search.aws.element84.com/v1/collections/sentinel-2-l2a/items/S2A_17SNB_20230617_0_L2A/thumbnail'
        }
      ],
      assets: {
        aot: {
          href: 'https://sentinel-cogs.s3.us-west-2.amazonaws.com/sentinel-s2-l2a-cogs/17/S/NB/2023/6/S2A_17SNB_20230617_0_L2A/AOT.tif',
          type: 'image/tiff; application=geotiff; profile=cloud-optimized',
          title: 'Aerosol optical thickness (AOT)',
          'proj:shape': [5490, 5490],
          'proj:transform': [20, 0, 499980, 0, -20, 4200000],
          'raster:bands': [
            {
              nodata: 0,
              data_type: 'uint16',
              bits_per_sample: 15,
              spatial_resolution: 20,
              scale: 0.001,
              offset: 0
            }
          ],
          roles: ['data', 'reflectance']
        },
        blue: {
          href: 'https://sentinel-cogs.s3.us-west-2.amazonaws.com/sentinel-s2-l2a-cogs/17/S/NB/2023/6/S2A_17SNB_20230617_0_L2A/B02.tif',
          type: 'image/tiff; application=geotiff; profile=cloud-optimized',
          title: 'Blue (band 2) - 10m',
          'eo:bands': [
            {
              name: 'blue',
              common_name: 'blue',
              description: 'Blue (band 2)',
              center_wavelength: 0.49,
              full_width_half_max: 0.098
            }
          ],
          gsd: 10,
          'proj:shape': [10980, 10980],
          'proj:transform': [10, 0, 499980, 0, -10, 4200000],
          'raster:bands': [
            {
              nodata: 0,
              data_type: 'uint16',
              bits_per_sample: 15,
              spatial_resolution: 10,
              scale: 0.0001,
              offset: -0.1
            }
          ],
          roles: ['data', 'reflectance']
        },
        coastal: {
          href: 'https://sentinel-cogs.s3.us-west-2.amazonaws.com/sentinel-s2-l2a-cogs/17/S/NB/2023/6/S2A_17SNB_20230617_0_L2A/B01.tif',
          type: 'image/tiff; application=geotiff; profile=cloud-optimized',
          title: 'Coastal aerosol (band 1) - 60m',
          'eo:bands': [
            {
              name: 'coastal',
              common_name: 'coastal',
              description: 'Coastal aerosol (band 1)',
              center_wavelength: 0.443,
              full_width_half_max: 0.027
            }
          ],
          gsd: 60,
          'proj:shape': [1830, 1830],
          'proj:transform': [60, 0, 499980, 0, -60, 4200000],
          'raster:bands': [
            {
              nodata: 0,
              data_type: 'uint16',
              bits_per_sample: 15,
              spatial_resolution: 60,
              scale: 0.0001,
              offset: -0.1
            }
          ],
          roles: ['data', 'reflectance']
        },
        granule_metadata: {
          href: 'https://sentinel-cogs.s3.us-west-2.amazonaws.com/sentinel-s2-l2a-cogs/17/S/NB/2023/6/S2A_17SNB_20230617_0_L2A/granule_metadata.xml',
          type: 'application/xml',
          roles: ['metadata']
        },
        green: {
          href: 'https://sentinel-cogs.s3.us-west-2.amazonaws.com/sentinel-s2-l2a-cogs/17/S/NB/2023/6/S2A_17SNB_20230617_0_L2A/B03.tif',
          type: 'image/tiff; application=geotiff; profile=cloud-optimized',
          title: 'Green (band 3) - 10m',
          'eo:bands': [
            {
              name: 'green',
              common_name: 'green',
              description: 'Green (band 3)',
              center_wavelength: 0.56,
              full_width_half_max: 0.045
            }
          ],
          gsd: 10,
          'proj:shape': [10980, 10980],
          'proj:transform': [10, 0, 499980, 0, -10, 4200000],
          'raster:bands': [
            {
              nodata: 0,
              data_type: 'uint16',
              bits_per_sample: 15,
              spatial_resolution: 10,
              scale: 0.0001,
              offset: -0.1
            }
          ],
          roles: ['data', 'reflectance']
        },
        nir: {
          href: 'https://sentinel-cogs.s3.us-west-2.amazonaws.com/sentinel-s2-l2a-cogs/17/S/NB/2023/6/S2A_17SNB_20230617_0_L2A/B08.tif',
          type: 'image/tiff; application=geotiff; profile=cloud-optimized',
          title: 'NIR 1 (band 8) - 10m',
          'eo:bands': [
            {
              name: 'nir',
              common_name: 'nir',
              description: 'NIR 1 (band 8)',
              center_wavelength: 0.842,
              full_width_half_max: 0.145
            }
          ],
          gsd: 10,
          'proj:shape': [10980, 10980],
          'proj:transform': [10, 0, 499980, 0, -10, 4200000],
          'raster:bands': [
            {
              nodata: 0,
              data_type: 'uint16',
              bits_per_sample: 15,
              spatial_resolution: 10,
              scale: 0.0001,
              offset: -0.1
            }
          ],
          roles: ['data', 'reflectance']
        },
        nir08: {
          href: 'https://sentinel-cogs.s3.us-west-2.amazonaws.com/sentinel-s2-l2a-cogs/17/S/NB/2023/6/S2A_17SNB_20230617_0_L2A/B8A.tif',
          type: 'image/tiff; application=geotiff; profile=cloud-optimized',
          title: 'NIR 2 (band 8A) - 20m',
          'eo:bands': [
            {
              name: 'nir08',
              common_name: 'nir08',
              description: 'NIR 2 (band 8A)',
              center_wavelength: 0.865,
              full_width_half_max: 0.033
            }
          ],
          gsd: 20,
          'proj:shape': [5490, 5490],
          'proj:transform': [20, 0, 499980, 0, -20, 4200000],
          'raster:bands': [
            {
              nodata: 0,
              data_type: 'uint16',
              bits_per_sample: 15,
              spatial_resolution: 20,
              scale: 0.0001,
              offset: -0.1
            }
          ],
          roles: ['data', 'reflectance']
        },
        nir09: {
          href: 'https://sentinel-cogs.s3.us-west-2.amazonaws.com/sentinel-s2-l2a-cogs/17/S/NB/2023/6/S2A_17SNB_20230617_0_L2A/B09.tif',
          type: 'image/tiff; application=geotiff; profile=cloud-optimized',
          title: 'NIR 3 (band 9) - 60m',
          'eo:bands': [
            {
              name: 'nir09',
              common_name: 'nir09',
              description: 'NIR 3 (band 9)',
              center_wavelength: 0.945,
              full_width_half_max: 0.026
            }
          ],
          gsd: 60,
          'proj:shape': [1830, 1830],
          'proj:transform': [60, 0, 499980, 0, -60, 4200000],
          'raster:bands': [
            {
              nodata: 0,
              data_type: 'uint16',
              bits_per_sample: 15,
              spatial_resolution: 60,
              scale: 0.0001,
              offset: -0.1
            }
          ],
          roles: ['data', 'reflectance']
        },
        red: {
          href: 'https://sentinel-cogs.s3.us-west-2.amazonaws.com/sentinel-s2-l2a-cogs/17/S/NB/2023/6/S2A_17SNB_20230617_0_L2A/B04.tif',
          type: 'image/tiff; application=geotiff; profile=cloud-optimized',
          title: 'Red (band 4) - 10m',
          'eo:bands': [
            {
              name: 'red',
              common_name: 'red',
              description: 'Red (band 4)',
              center_wavelength: 0.665,
              full_width_half_max: 0.038
            }
          ],
          gsd: 10,
          'proj:shape': [10980, 10980],
          'proj:transform': [10, 0, 499980, 0, -10, 4200000],
          'raster:bands': [
            {
              nodata: 0,
              data_type: 'uint16',
              bits_per_sample: 15,
              spatial_resolution: 10,
              scale: 0.0001,
              offset: -0.1
            }
          ],
          roles: ['data', 'reflectance']
        },
        rededge1: {
          href: 'https://sentinel-cogs.s3.us-west-2.amazonaws.com/sentinel-s2-l2a-cogs/17/S/NB/2023/6/S2A_17SNB_20230617_0_L2A/B05.tif',
          type: 'image/tiff; application=geotiff; profile=cloud-optimized',
          title: 'Red edge 1 (band 5) - 20m',
          'eo:bands': [
            {
              name: 'rededge1',
              common_name: 'rededge',
              description: 'Red edge 1 (band 5)',
              center_wavelength: 0.704,
              full_width_half_max: 0.019
            }
          ],
          gsd: 20,
          'proj:shape': [5490, 5490],
          'proj:transform': [20, 0, 499980, 0, -20, 4200000],
          'raster:bands': [
            {
              nodata: 0,
              data_type: 'uint16',
              bits_per_sample: 15,
              spatial_resolution: 20,
              scale: 0.0001,
              offset: -0.1
            }
          ],
          roles: ['data', 'reflectance']
        },
        rededge2: {
          href: 'https://sentinel-cogs.s3.us-west-2.amazonaws.com/sentinel-s2-l2a-cogs/17/S/NB/2023/6/S2A_17SNB_20230617_0_L2A/B06.tif',
          type: 'image/tiff; application=geotiff; profile=cloud-optimized',
          title: 'Red edge 2 (band 6) - 20m',
          'eo:bands': [
            {
              name: 'rededge2',
              common_name: 'rededge',
              description: 'Red edge 2 (band 6)',
              center_wavelength: 0.74,
              full_width_half_max: 0.018
            }
          ],
          gsd: 20,
          'proj:shape': [5490, 5490],
          'proj:transform': [20, 0, 499980, 0, -20, 4200000],
          'raster:bands': [
            {
              nodata: 0,
              data_type: 'uint16',
              bits_per_sample: 15,
              spatial_resolution: 20,
              scale: 0.0001,
              offset: -0.1
            }
          ],
          roles: ['data', 'reflectance']
        },
        rededge3: {
          href: 'https://sentinel-cogs.s3.us-west-2.amazonaws.com/sentinel-s2-l2a-cogs/17/S/NB/2023/6/S2A_17SNB_20230617_0_L2A/B07.tif',
          type: 'image/tiff; application=geotiff; profile=cloud-optimized',
          title: 'Red edge 3 (band 7) - 20m',
          'eo:bands': [
            {
              name: 'rededge3',
              common_name: 'rededge',
              description: 'Red edge 3 (band 7)',
              center_wavelength: 0.783,
              full_width_half_max: 0.028
            }
          ],
          gsd: 20,
          'proj:shape': [5490, 5490],
          'proj:transform': [20, 0, 499980, 0, -20, 4200000],
          'raster:bands': [
            {
              nodata: 0,
              data_type: 'uint16',
              bits_per_sample: 15,
              spatial_resolution: 20,
              scale: 0.0001,
              offset: -0.1
            }
          ],
          roles: ['data', 'reflectance']
        },
        scl: {
          href: 'https://sentinel-cogs.s3.us-west-2.amazonaws.com/sentinel-s2-l2a-cogs/17/S/NB/2023/6/S2A_17SNB_20230617_0_L2A/SCL.tif',
          type: 'image/tiff; application=geotiff; profile=cloud-optimized',
          title: 'Scene classification map (SCL)',
          'proj:shape': [5490, 5490],
          'proj:transform': [20, 0, 499980, 0, -20, 4200000],
          'raster:bands': [
            {
              nodata: 0,
              data_type: 'uint8',
              spatial_resolution: 20
            }
          ],
          roles: ['data', 'reflectance']
        },
        swir16: {
          href: 'https://sentinel-cogs.s3.us-west-2.amazonaws.com/sentinel-s2-l2a-cogs/17/S/NB/2023/6/S2A_17SNB_20230617_0_L2A/B11.tif',
          type: 'image/tiff; application=geotiff; profile=cloud-optimized',
          title: 'SWIR 1 (band 11) - 20m',
          'eo:bands': [
            {
              name: 'swir16',
              common_name: 'swir16',
              description: 'SWIR 1 (band 11)',
              center_wavelength: 1.61,
              full_width_half_max: 0.143
            }
          ],
          gsd: 20,
          'proj:shape': [5490, 5490],
          'proj:transform': [20, 0, 499980, 0, -20, 4200000],
          'raster:bands': [
            {
              nodata: 0,
              data_type: 'uint16',
              bits_per_sample: 15,
              spatial_resolution: 20,
              scale: 0.0001,
              offset: -0.1
            }
          ],
          roles: ['data', 'reflectance']
        },
        swir22: {
          href: 'https://sentinel-cogs.s3.us-west-2.amazonaws.com/sentinel-s2-l2a-cogs/17/S/NB/2023/6/S2A_17SNB_20230617_0_L2A/B12.tif',
          type: 'image/tiff; application=geotiff; profile=cloud-optimized',
          title: 'SWIR 2 (band 12) - 20m',
          'eo:bands': [
            {
              name: 'swir22',
              common_name: 'swir22',
              description: 'SWIR 2 (band 12)',
              center_wavelength: 2.19,
              full_width_half_max: 0.242
            }
          ],
          gsd: 20,
          'proj:shape': [5490, 5490],
          'proj:transform': [20, 0, 499980, 0, -20, 4200000],
          'raster:bands': [
            {
              nodata: 0,
              data_type: 'uint16',
              bits_per_sample: 15,
              spatial_resolution: 20,
              scale: 0.0001,
              offset: -0.1
            }
          ],
          roles: ['data', 'reflectance']
        },
        thumbnail: {
          href: 'https://sentinel-cogs.s3.us-west-2.amazonaws.com/sentinel-s2-l2a-cogs/17/S/NB/2023/6/S2A_17SNB_20230617_0_L2A/thumbnail.jpg',
          type: 'image/jpeg',
          title: 'Thumbnail image',
          roles: ['thumbnail']
        },
        tileinfo_metadata: {
          href: 'https://sentinel-cogs.s3.us-west-2.amazonaws.com/sentinel-s2-l2a-cogs/17/S/NB/2023/6/S2A_17SNB_20230617_0_L2A/tileinfo_metadata.json',
          type: 'application/json',
          roles: ['metadata']
        },
        visual: {
          href: 'https://sentinel-cogs.s3.us-west-2.amazonaws.com/sentinel-s2-l2a-cogs/17/S/NB/2023/6/S2A_17SNB_20230617_0_L2A/TCI.tif',
          type: 'image/tiff; application=geotiff; profile=cloud-optimized',
          title: 'True color image',
          'eo:bands': [
            {
              name: 'red',
              common_name: 'red',
              description: 'Red (band 4)',
              center_wavelength: 0.665,
              full_width_half_max: 0.038
            },
            {
              name: 'green',
              common_name: 'green',
              description: 'Green (band 3)',
              center_wavelength: 0.56,
              full_width_half_max: 0.045
            },
            {
              name: 'blue',
              common_name: 'blue',
              description: 'Blue (band 2)',
              center_wavelength: 0.49,
              full_width_half_max: 0.098
            }
          ],
          'proj:shape': [10980, 10980],
          'proj:transform': [10, 0, 499980, 0, -10, 4200000],
          roles: ['visual']
        },
        wvp: {
          href: 'https://sentinel-cogs.s3.us-west-2.amazonaws.com/sentinel-s2-l2a-cogs/17/S/NB/2023/6/S2A_17SNB_20230617_0_L2A/WVP.tif',
          type: 'image/tiff; application=geotiff; profile=cloud-optimized',
          title: 'Water vapour (WVP)',
          'proj:shape': [5490, 5490],
          'proj:transform': [20, 0, 499980, 0, -20, 4200000],
          'raster:bands': [
            {
              nodata: 0,
              data_type: 'uint16',
              bits_per_sample: 15,
              spatial_resolution: 20,
              unit: 'cm',
              scale: 0.001,
              offset: 0
            }
          ],
          roles: ['data', 'reflectance']
        },
        'aot-jp2': {
          href: 's3://sentinel-s2-l2a/tiles/17/S/NB/2023/6/17/0/AOT.jp2',
          type: 'image/jp2',
          title: 'Aerosol optical thickness (AOT)',
          'proj:shape': [5490, 5490],
          'proj:transform': [20, 0, 499980, 0, -20, 4200000],
          'raster:bands': [
            {
              nodata: 0,
              data_type: 'uint16',
              bits_per_sample: 15,
              spatial_resolution: 20,
              scale: 0.001,
              offset: 0
            }
          ],
          roles: ['data', 'reflectance']
        },
        'blue-jp2': {
          href: 's3://sentinel-s2-l2a/tiles/17/S/NB/2023/6/17/0/B02.jp2',
          type: 'image/jp2',
          title: 'Blue (band 2) - 10m',
          'eo:bands': [
            {
              name: 'blue',
              common_name: 'blue',
              description: 'Blue (band 2)',
              center_wavelength: 0.49,
              full_width_half_max: 0.098
            }
          ],
          gsd: 10,
          'proj:shape': [10980, 10980],
          'proj:transform': [10, 0, 499980, 0, -10, 4200000],
          'raster:bands': [
            {
              nodata: 0,
              data_type: 'uint16',
              bits_per_sample: 15,
              spatial_resolution: 10,
              scale: 0.0001,
              offset: -0.1
            }
          ],
          roles: ['data', 'reflectance']
        },
        'coastal-jp2': {
          href: 's3://sentinel-s2-l2a/tiles/17/S/NB/2023/6/17/0/B01.jp2',
          type: 'image/jp2',
          title: 'Coastal aerosol (band 1) - 60m',
          'eo:bands': [
            {
              name: 'coastal',
              common_name: 'coastal',
              description: 'Coastal aerosol (band 1)',
              center_wavelength: 0.443,
              full_width_half_max: 0.027
            }
          ],
          gsd: 60,
          'proj:shape': [1830, 1830],
          'proj:transform': [60, 0, 499980, 0, -60, 4200000],
          'raster:bands': [
            {
              nodata: 0,
              data_type: 'uint16',
              bits_per_sample: 15,
              spatial_resolution: 60,
              scale: 0.0001,
              offset: -0.1
            }
          ],
          roles: ['data', 'reflectance']
        },
        'green-jp2': {
          href: 's3://sentinel-s2-l2a/tiles/17/S/NB/2023/6/17/0/B03.jp2',
          type: 'image/jp2',
          title: 'Green (band 3) - 10m',
          'eo:bands': [
            {
              name: 'green',
              common_name: 'green',
              description: 'Green (band 3)',
              center_wavelength: 0.56,
              full_width_half_max: 0.045
            }
          ],
          gsd: 10,
          'proj:shape': [10980, 10980],
          'proj:transform': [10, 0, 499980, 0, -10, 4200000],
          'raster:bands': [
            {
              nodata: 0,
              data_type: 'uint16',
              bits_per_sample: 15,
              spatial_resolution: 10,
              scale: 0.0001,
              offset: -0.1
            }
          ],
          roles: ['data', 'reflectance']
        },
        'nir-jp2': {
          href: 's3://sentinel-s2-l2a/tiles/17/S/NB/2023/6/17/0/B08.jp2',
          type: 'image/jp2',
          title: 'NIR 1 (band 8) - 10m',
          'eo:bands': [
            {
              name: 'nir',
              common_name: 'nir',
              description: 'NIR 1 (band 8)',
              center_wavelength: 0.842,
              full_width_half_max: 0.145
            }
          ],
          gsd: 10,
          'proj:shape': [10980, 10980],
          'proj:transform': [10, 0, 499980, 0, -10, 4200000],
          'raster:bands': [
            {
              nodata: 0,
              data_type: 'uint16',
              bits_per_sample: 15,
              spatial_resolution: 10,
              scale: 0.0001,
              offset: -0.1
            }
          ],
          roles: ['data', 'reflectance']
        },
        'nir08-jp2': {
          href: 's3://sentinel-s2-l2a/tiles/17/S/NB/2023/6/17/0/B8A.jp2',
          type: 'image/jp2',
          title: 'NIR 2 (band 8A) - 20m',
          'eo:bands': [
            {
              name: 'nir08',
              common_name: 'nir08',
              description: 'NIR 2 (band 8A)',
              center_wavelength: 0.865,
              full_width_half_max: 0.033
            }
          ],
          gsd: 20,
          'proj:shape': [5490, 5490],
          'proj:transform': [20, 0, 499980, 0, -20, 4200000],
          'raster:bands': [
            {
              nodata: 0,
              data_type: 'uint16',
              bits_per_sample: 15,
              spatial_resolution: 20,
              scale: 0.0001,
              offset: -0.1
            }
          ],
          roles: ['data', 'reflectance']
        },
        'nir09-jp2': {
          href: 's3://sentinel-s2-l2a/tiles/17/S/NB/2023/6/17/0/B09.jp2',
          type: 'image/jp2',
          title: 'NIR 3 (band 9) - 60m',
          'eo:bands': [
            {
              name: 'nir09',
              common_name: 'nir09',
              description: 'NIR 3 (band 9)',
              center_wavelength: 0.945,
              full_width_half_max: 0.026
            }
          ],
          gsd: 60,
          'proj:shape': [1830, 1830],
          'proj:transform': [60, 0, 499980, 0, -60, 4200000],
          'raster:bands': [
            {
              nodata: 0,
              data_type: 'uint16',
              bits_per_sample: 15,
              spatial_resolution: 60,
              scale: 0.0001,
              offset: -0.1
            }
          ],
          roles: ['data', 'reflectance']
        },
        'red-jp2': {
          href: 's3://sentinel-s2-l2a/tiles/17/S/NB/2023/6/17/0/B04.jp2',
          type: 'image/jp2',
          title: 'Red (band 4) - 10m',
          'eo:bands': [
            {
              name: 'red',
              common_name: 'red',
              description: 'Red (band 4)',
              center_wavelength: 0.665,
              full_width_half_max: 0.038
            }
          ],
          gsd: 10,
          'proj:shape': [10980, 10980],
          'proj:transform': [10, 0, 499980, 0, -10, 4200000],
          'raster:bands': [
            {
              nodata: 0,
              data_type: 'uint16',
              bits_per_sample: 15,
              spatial_resolution: 10,
              scale: 0.0001,
              offset: -0.1
            }
          ],
          roles: ['data', 'reflectance']
        },
        'rededge1-jp2': {
          href: 's3://sentinel-s2-l2a/tiles/17/S/NB/2023/6/17/0/B05.jp2',
          type: 'image/jp2',
          title: 'Red edge 1 (band 5) - 20m',
          'eo:bands': [
            {
              name: 'rededge1',
              common_name: 'rededge',
              description: 'Red edge 1 (band 5)',
              center_wavelength: 0.704,
              full_width_half_max: 0.019
            }
          ],
          gsd: 20,
          'proj:shape': [5490, 5490],
          'proj:transform': [20, 0, 499980, 0, -20, 4200000],
          'raster:bands': [
            {
              nodata: 0,
              data_type: 'uint16',
              bits_per_sample: 15,
              spatial_resolution: 20,
              scale: 0.0001,
              offset: -0.1
            }
          ],
          roles: ['data', 'reflectance']
        },
        'rededge2-jp2': {
          href: 's3://sentinel-s2-l2a/tiles/17/S/NB/2023/6/17/0/B06.jp2',
          type: 'image/jp2',
          title: 'Red edge 2 (band 6) - 20m',
          'eo:bands': [
            {
              name: 'rededge2',
              common_name: 'rededge',
              description: 'Red edge 2 (band 6)',
              center_wavelength: 0.74,
              full_width_half_max: 0.018
            }
          ],
          gsd: 20,
          'proj:shape': [5490, 5490],
          'proj:transform': [20, 0, 499980, 0, -20, 4200000],
          'raster:bands': [
            {
              nodata: 0,
              data_type: 'uint16',
              bits_per_sample: 15,
              spatial_resolution: 20,
              scale: 0.0001,
              offset: -0.1
            }
          ],
          roles: ['data', 'reflectance']
        },
        'rededge3-jp2': {
          href: 's3://sentinel-s2-l2a/tiles/17/S/NB/2023/6/17/0/B07.jp2',
          type: 'image/jp2',
          title: 'Red edge 3 (band 7) - 20m',
          'eo:bands': [
            {
              name: 'rededge3',
              common_name: 'rededge',
              description: 'Red edge 3 (band 7)',
              center_wavelength: 0.783,
              full_width_half_max: 0.028
            }
          ],
          gsd: 20,
          'proj:shape': [5490, 5490],
          'proj:transform': [20, 0, 499980, 0, -20, 4200000],
          'raster:bands': [
            {
              nodata: 0,
              data_type: 'uint16',
              bits_per_sample: 15,
              spatial_resolution: 20,
              scale: 0.0001,
              offset: -0.1
            }
          ],
          roles: ['data', 'reflectance']
        },
        'scl-jp2': {
          href: 's3://sentinel-s2-l2a/tiles/17/S/NB/2023/6/17/0/SCL.jp2',
          type: 'image/jp2',
          title: 'Scene classification map (SCL)',
          'proj:shape': [5490, 5490],
          'proj:transform': [20, 0, 499980, 0, -20, 4200000],
          'raster:bands': [
            {
              nodata: 0,
              data_type: 'uint8',
              spatial_resolution: 20
            }
          ],
          roles: ['data', 'reflectance']
        },
        'swir16-jp2': {
          href: 's3://sentinel-s2-l2a/tiles/17/S/NB/2023/6/17/0/B11.jp2',
          type: 'image/jp2',
          title: 'SWIR 1 (band 11) - 20m',
          'eo:bands': [
            {
              name: 'swir16',
              common_name: 'swir16',
              description: 'SWIR 1 (band 11)',
              center_wavelength: 1.61,
              full_width_half_max: 0.143
            }
          ],
          gsd: 20,
          'proj:shape': [5490, 5490],
          'proj:transform': [20, 0, 499980, 0, -20, 4200000],
          'raster:bands': [
            {
              nodata: 0,
              data_type: 'uint16',
              bits_per_sample: 15,
              spatial_resolution: 20,
              scale: 0.0001,
              offset: -0.1
            }
          ],
          roles: ['data', 'reflectance']
        },
        'swir22-jp2': {
          href: 's3://sentinel-s2-l2a/tiles/17/S/NB/2023/6/17/0/B12.jp2',
          type: 'image/jp2',
          title: 'SWIR 2 (band 12) - 20m',
          'eo:bands': [
            {
              name: 'swir22',
              common_name: 'swir22',
              description: 'SWIR 2 (band 12)',
              center_wavelength: 2.19,
              full_width_half_max: 0.242
            }
          ],
          gsd: 20,
          'proj:shape': [5490, 5490],
          'proj:transform': [20, 0, 499980, 0, -20, 4200000],
          'raster:bands': [
            {
              nodata: 0,
              data_type: 'uint16',
              bits_per_sample: 15,
              spatial_resolution: 20,
              scale: 0.0001,
              offset: -0.1
            }
          ],
          roles: ['data', 'reflectance']
        },
        'visual-jp2': {
          href: 's3://sentinel-s2-l2a/tiles/17/S/NB/2023/6/17/0/TCI.jp2',
          type: 'image/jp2',
          title: 'True color image',
          'eo:bands': [
            {
              name: 'red',
              common_name: 'red',
              description: 'Red (band 4)',
              center_wavelength: 0.665,
              full_width_half_max: 0.038
            },
            {
              name: 'green',
              common_name: 'green',
              description: 'Green (band 3)',
              center_wavelength: 0.56,
              full_width_half_max: 0.045
            },
            {
              name: 'blue',
              common_name: 'blue',
              description: 'Blue (band 2)',
              center_wavelength: 0.49,
              full_width_half_max: 0.098
            }
          ],
          'proj:shape': [10980, 10980],
          'proj:transform': [10, 0, 499980, 0, -10, 4200000],
          roles: ['visual']
        },
        'wvp-jp2': {
          href: 's3://sentinel-s2-l2a/tiles/17/S/NB/2023/6/17/0/WVP.jp2',
          type: 'image/jp2',
          title: 'Water vapour (WVP)',
          'proj:shape': [5490, 5490],
          'proj:transform': [20, 0, 499980, 0, -20, 4200000],
          'raster:bands': [
            {
              nodata: 0,
              data_type: 'uint16',
              bits_per_sample: 15,
              spatial_resolution: 20,
              unit: 'cm',
              scale: 0.001,
              offset: 0
            }
          ],
          roles: ['data', 'reflectance']
        }
      },
      bbox: [
        -80.9828826562716, 36.951488600423914, -79.75065723902863,
        37.94719620724708
      ],
      stac_extensions: [
        'https://stac-extensions.github.io/grid/v1.0.0/schema.json',
        'https://stac-extensions.github.io/mgrs/v1.0.0/schema.json',
        'https://stac-extensions.github.io/eo/v1.0.0/schema.json',
        'https://stac-extensions.github.io/projection/v1.0.0/schema.json',
        'https://stac-extensions.github.io/processing/v1.1.0/schema.json',
        'https://stac-extensions.github.io/raster/v1.1.0/schema.json',
        'https://stac-extensions.github.io/view/v1.0.0/schema.json'
      ],
      collection: 'sentinel-2-l2a'
    },
    {
      type: 'Feature',
      stac_version: '1.0.0',
      id: 'S2A_17SPB_20230617_0_L2A',
      properties: {
        created: '2023-06-18T03:58:41.291Z',
        platform: 'sentinel-2a',
        constellation: 'sentinel-2',
        instruments: ['msi'],
        'eo:cloud_cover': 3.747416,
        'proj:epsg': 32617,
        'mgrs:utm_zone': 17,
        'mgrs:latitude_band': 'S',
        'mgrs:grid_square': 'PB',
        'grid:code': 'MGRS-17SPB',
        'view:sun_azimuth': 130.705099857743,
        'view:sun_elevation': 70.2250121042309,
        's2:degraded_msi_data_percentage': 0.0001,
        's2:nodata_pixel_percentage': 0,
        's2:saturated_defective_pixel_percentage': 0,
        's2:dark_features_percentage': 0.068112,
        's2:cloud_shadow_percentage': 3.120992,
        's2:vegetation_percentage': 89.395231,
        's2:not_vegetated_percentage': 2.608827,
        's2:water_percentage': 0.706404,
        's2:unclassified_percentage': 0.353021,
        's2:medium_proba_clouds_percentage': 2.050554,
        's2:high_proba_clouds_percentage': 0.74169,
        's2:thin_cirrus_percentage': 0.955173,
        's2:snow_ice_percentage': 0,
        's2:product_type': 'S2MSI2A',
        's2:processing_baseline': '05.09',
        's2:product_uri':
          'S2A_MSIL2A_20230617T155821_N0509_R097_T17SPB_20230617T231852.SAFE',
        's2:generation_time': '2023-06-17T23:18:52.000000Z',
        's2:datatake_id': 'GS2A_20230617T155821_041707_N05.09',
        's2:datatake_type': 'INS-NOBS',
        's2:datastrip_id':
          'S2A_OPER_MSI_L2A_DS_2APS_20230617T231852_S20230617T161043_N05.09',
        's2:granule_id':
          'S2A_OPER_MSI_L2A_TL_2APS_20230617T231852_A041707_T17SPB_N05.09',
        's2:reflectance_conversion_factor': 0.969515541547683,
        datetime: '2023-06-17T16:13:01.409000Z',
        's2:sequence': '0',
        'earthsearch:s3_path':
          's3://sentinel-cogs/sentinel-s2-l2a-cogs/17/S/PB/2023/6/S2A_17SPB_20230617_0_L2A',
        'earthsearch:payload_id':
          'roda-sentinel2/workflow-sentinel2-to-stac/ff59897e97ccd4b51dd9804fce4b5eea',
        'earthsearch:boa_offset_applied': true,
        'processing:software': {
          'sentinel2-to-stac': '0.1.0'
        },
        updated: '2023-06-18T03:58:41.291Z'
      },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [-79.86191482838464, 37.94207619848921],
            [-78.61306950183968, 37.92336472056608],
            [-78.64427857302955, 36.93451998232696],
            [-79.87680832296512, 36.95257802860544],
            [-79.86191482838464, 37.94207619848921]
          ]
        ]
      },
      links: [
        {
          rel: 'self',
          type: 'application/geo+json',
          href: 'https://earth-search.aws.element84.com/v1/collections/sentinel-2-l2a/items/S2A_17SPB_20230617_0_L2A'
        },
        {
          rel: 'canonical',
          href: 's3://sentinel-cogs/sentinel-s2-l2a-cogs/17/S/PB/2023/6/S2A_17SPB_20230617_0_L2A/S2A_17SPB_20230617_0_L2A.json',
          type: 'application/json'
        },
        {
          rel: 'license',
          href: 'https://sentinel.esa.int/documents/247904/690755/Sentinel_Data_Legal_Notice'
        },
        {
          rel: 'derived_from',
          href: 'https://earth-search.aws.element84.com/v1/collections/sentinel-2-l1c/items/S2A_17SPB_20230617_0_L1C',
          type: 'application/geo+json'
        },
        {
          rel: 'parent',
          type: 'application/json',
          href: 'https://earth-search.aws.element84.com/v1/collections/sentinel-2-l2a'
        },
        {
          rel: 'collection',
          type: 'application/json',
          href: 'https://earth-search.aws.element84.com/v1/collections/sentinel-2-l2a'
        },
        {
          rel: 'root',
          type: 'application/json',
          href: 'https://earth-search.aws.element84.com/v1'
        },
        {
          rel: 'thumbnail',
          href: 'https://earth-search.aws.element84.com/v1/collections/sentinel-2-l2a/items/S2A_17SPB_20230617_0_L2A/thumbnail'
        }
      ],
      assets: {
        aot: {
          href: 'https://sentinel-cogs.s3.us-west-2.amazonaws.com/sentinel-s2-l2a-cogs/17/S/PB/2023/6/S2A_17SPB_20230617_0_L2A/AOT.tif',
          type: 'image/tiff; application=geotiff; profile=cloud-optimized',
          title: 'Aerosol optical thickness (AOT)',
          'proj:shape': [5490, 5490],
          'proj:transform': [20, 0, 600000, 0, -20, 4200000],
          'raster:bands': [
            {
              nodata: 0,
              data_type: 'uint16',
              bits_per_sample: 15,
              spatial_resolution: 20,
              scale: 0.001,
              offset: 0
            }
          ],
          roles: ['data', 'reflectance']
        },
        blue: {
          href: 'https://sentinel-cogs.s3.us-west-2.amazonaws.com/sentinel-s2-l2a-cogs/17/S/PB/2023/6/S2A_17SPB_20230617_0_L2A/B02.tif',
          type: 'image/tiff; application=geotiff; profile=cloud-optimized',
          title: 'Blue (band 2) - 10m',
          'eo:bands': [
            {
              name: 'blue',
              common_name: 'blue',
              description: 'Blue (band 2)',
              center_wavelength: 0.49,
              full_width_half_max: 0.098
            }
          ],
          gsd: 10,
          'proj:shape': [10980, 10980],
          'proj:transform': [10, 0, 600000, 0, -10, 4200000],
          'raster:bands': [
            {
              nodata: 0,
              data_type: 'uint16',
              bits_per_sample: 15,
              spatial_resolution: 10,
              scale: 0.0001,
              offset: -0.1
            }
          ],
          roles: ['data', 'reflectance']
        },
        coastal: {
          href: 'https://sentinel-cogs.s3.us-west-2.amazonaws.com/sentinel-s2-l2a-cogs/17/S/PB/2023/6/S2A_17SPB_20230617_0_L2A/B01.tif',
          type: 'image/tiff; application=geotiff; profile=cloud-optimized',
          title: 'Coastal aerosol (band 1) - 60m',
          'eo:bands': [
            {
              name: 'coastal',
              common_name: 'coastal',
              description: 'Coastal aerosol (band 1)',
              center_wavelength: 0.443,
              full_width_half_max: 0.027
            }
          ],
          gsd: 60,
          'proj:shape': [1830, 1830],
          'proj:transform': [60, 0, 600000, 0, -60, 4200000],
          'raster:bands': [
            {
              nodata: 0,
              data_type: 'uint16',
              bits_per_sample: 15,
              spatial_resolution: 60,
              scale: 0.0001,
              offset: -0.1
            }
          ],
          roles: ['data', 'reflectance']
        },
        granule_metadata: {
          href: 'https://sentinel-cogs.s3.us-west-2.amazonaws.com/sentinel-s2-l2a-cogs/17/S/PB/2023/6/S2A_17SPB_20230617_0_L2A/granule_metadata.xml',
          type: 'application/xml',
          roles: ['metadata']
        },
        green: {
          href: 'https://sentinel-cogs.s3.us-west-2.amazonaws.com/sentinel-s2-l2a-cogs/17/S/PB/2023/6/S2A_17SPB_20230617_0_L2A/B03.tif',
          type: 'image/tiff; application=geotiff; profile=cloud-optimized',
          title: 'Green (band 3) - 10m',
          'eo:bands': [
            {
              name: 'green',
              common_name: 'green',
              description: 'Green (band 3)',
              center_wavelength: 0.56,
              full_width_half_max: 0.045
            }
          ],
          gsd: 10,
          'proj:shape': [10980, 10980],
          'proj:transform': [10, 0, 600000, 0, -10, 4200000],
          'raster:bands': [
            {
              nodata: 0,
              data_type: 'uint16',
              bits_per_sample: 15,
              spatial_resolution: 10,
              scale: 0.0001,
              offset: -0.1
            }
          ],
          roles: ['data', 'reflectance']
        },
        nir: {
          href: 'https://sentinel-cogs.s3.us-west-2.amazonaws.com/sentinel-s2-l2a-cogs/17/S/PB/2023/6/S2A_17SPB_20230617_0_L2A/B08.tif',
          type: 'image/tiff; application=geotiff; profile=cloud-optimized',
          title: 'NIR 1 (band 8) - 10m',
          'eo:bands': [
            {
              name: 'nir',
              common_name: 'nir',
              description: 'NIR 1 (band 8)',
              center_wavelength: 0.842,
              full_width_half_max: 0.145
            }
          ],
          gsd: 10,
          'proj:shape': [10980, 10980],
          'proj:transform': [10, 0, 600000, 0, -10, 4200000],
          'raster:bands': [
            {
              nodata: 0,
              data_type: 'uint16',
              bits_per_sample: 15,
              spatial_resolution: 10,
              scale: 0.0001,
              offset: -0.1
            }
          ],
          roles: ['data', 'reflectance']
        },
        nir08: {
          href: 'https://sentinel-cogs.s3.us-west-2.amazonaws.com/sentinel-s2-l2a-cogs/17/S/PB/2023/6/S2A_17SPB_20230617_0_L2A/B8A.tif',
          type: 'image/tiff; application=geotiff; profile=cloud-optimized',
          title: 'NIR 2 (band 8A) - 20m',
          'eo:bands': [
            {
              name: 'nir08',
              common_name: 'nir08',
              description: 'NIR 2 (band 8A)',
              center_wavelength: 0.865,
              full_width_half_max: 0.033
            }
          ],
          gsd: 20,
          'proj:shape': [5490, 5490],
          'proj:transform': [20, 0, 600000, 0, -20, 4200000],
          'raster:bands': [
            {
              nodata: 0,
              data_type: 'uint16',
              bits_per_sample: 15,
              spatial_resolution: 20,
              scale: 0.0001,
              offset: -0.1
            }
          ],
          roles: ['data', 'reflectance']
        },
        nir09: {
          href: 'https://sentinel-cogs.s3.us-west-2.amazonaws.com/sentinel-s2-l2a-cogs/17/S/PB/2023/6/S2A_17SPB_20230617_0_L2A/B09.tif',
          type: 'image/tiff; application=geotiff; profile=cloud-optimized',
          title: 'NIR 3 (band 9) - 60m',
          'eo:bands': [
            {
              name: 'nir09',
              common_name: 'nir09',
              description: 'NIR 3 (band 9)',
              center_wavelength: 0.945,
              full_width_half_max: 0.026
            }
          ],
          gsd: 60,
          'proj:shape': [1830, 1830],
          'proj:transform': [60, 0, 600000, 0, -60, 4200000],
          'raster:bands': [
            {
              nodata: 0,
              data_type: 'uint16',
              bits_per_sample: 15,
              spatial_resolution: 60,
              scale: 0.0001,
              offset: -0.1
            }
          ],
          roles: ['data', 'reflectance']
        },
        red: {
          href: 'https://sentinel-cogs.s3.us-west-2.amazonaws.com/sentinel-s2-l2a-cogs/17/S/PB/2023/6/S2A_17SPB_20230617_0_L2A/B04.tif',
          type: 'image/tiff; application=geotiff; profile=cloud-optimized',
          title: 'Red (band 4) - 10m',
          'eo:bands': [
            {
              name: 'red',
              common_name: 'red',
              description: 'Red (band 4)',
              center_wavelength: 0.665,
              full_width_half_max: 0.038
            }
          ],
          gsd: 10,
          'proj:shape': [10980, 10980],
          'proj:transform': [10, 0, 600000, 0, -10, 4200000],
          'raster:bands': [
            {
              nodata: 0,
              data_type: 'uint16',
              bits_per_sample: 15,
              spatial_resolution: 10,
              scale: 0.0001,
              offset: -0.1
            }
          ],
          roles: ['data', 'reflectance']
        },
        rededge1: {
          href: 'https://sentinel-cogs.s3.us-west-2.amazonaws.com/sentinel-s2-l2a-cogs/17/S/PB/2023/6/S2A_17SPB_20230617_0_L2A/B05.tif',
          type: 'image/tiff; application=geotiff; profile=cloud-optimized',
          title: 'Red edge 1 (band 5) - 20m',
          'eo:bands': [
            {
              name: 'rededge1',
              common_name: 'rededge',
              description: 'Red edge 1 (band 5)',
              center_wavelength: 0.704,
              full_width_half_max: 0.019
            }
          ],
          gsd: 20,
          'proj:shape': [5490, 5490],
          'proj:transform': [20, 0, 600000, 0, -20, 4200000],
          'raster:bands': [
            {
              nodata: 0,
              data_type: 'uint16',
              bits_per_sample: 15,
              spatial_resolution: 20,
              scale: 0.0001,
              offset: -0.1
            }
          ],
          roles: ['data', 'reflectance']
        },
        rededge2: {
          href: 'https://sentinel-cogs.s3.us-west-2.amazonaws.com/sentinel-s2-l2a-cogs/17/S/PB/2023/6/S2A_17SPB_20230617_0_L2A/B06.tif',
          type: 'image/tiff; application=geotiff; profile=cloud-optimized',
          title: 'Red edge 2 (band 6) - 20m',
          'eo:bands': [
            {
              name: 'rededge2',
              common_name: 'rededge',
              description: 'Red edge 2 (band 6)',
              center_wavelength: 0.74,
              full_width_half_max: 0.018
            }
          ],
          gsd: 20,
          'proj:shape': [5490, 5490],
          'proj:transform': [20, 0, 600000, 0, -20, 4200000],
          'raster:bands': [
            {
              nodata: 0,
              data_type: 'uint16',
              bits_per_sample: 15,
              spatial_resolution: 20,
              scale: 0.0001,
              offset: -0.1
            }
          ],
          roles: ['data', 'reflectance']
        },
        rededge3: {
          href: 'https://sentinel-cogs.s3.us-west-2.amazonaws.com/sentinel-s2-l2a-cogs/17/S/PB/2023/6/S2A_17SPB_20230617_0_L2A/B07.tif',
          type: 'image/tiff; application=geotiff; profile=cloud-optimized',
          title: 'Red edge 3 (band 7) - 20m',
          'eo:bands': [
            {
              name: 'rededge3',
              common_name: 'rededge',
              description: 'Red edge 3 (band 7)',
              center_wavelength: 0.783,
              full_width_half_max: 0.028
            }
          ],
          gsd: 20,
          'proj:shape': [5490, 5490],
          'proj:transform': [20, 0, 600000, 0, -20, 4200000],
          'raster:bands': [
            {
              nodata: 0,
              data_type: 'uint16',
              bits_per_sample: 15,
              spatial_resolution: 20,
              scale: 0.0001,
              offset: -0.1
            }
          ],
          roles: ['data', 'reflectance']
        },
        scl: {
          href: 'https://sentinel-cogs.s3.us-west-2.amazonaws.com/sentinel-s2-l2a-cogs/17/S/PB/2023/6/S2A_17SPB_20230617_0_L2A/SCL.tif',
          type: 'image/tiff; application=geotiff; profile=cloud-optimized',
          title: 'Scene classification map (SCL)',
          'proj:shape': [5490, 5490],
          'proj:transform': [20, 0, 600000, 0, -20, 4200000],
          'raster:bands': [
            {
              nodata: 0,
              data_type: 'uint8',
              spatial_resolution: 20
            }
          ],
          roles: ['data', 'reflectance']
        },
        swir16: {
          href: 'https://sentinel-cogs.s3.us-west-2.amazonaws.com/sentinel-s2-l2a-cogs/17/S/PB/2023/6/S2A_17SPB_20230617_0_L2A/B11.tif',
          type: 'image/tiff; application=geotiff; profile=cloud-optimized',
          title: 'SWIR 1 (band 11) - 20m',
          'eo:bands': [
            {
              name: 'swir16',
              common_name: 'swir16',
              description: 'SWIR 1 (band 11)',
              center_wavelength: 1.61,
              full_width_half_max: 0.143
            }
          ],
          gsd: 20,
          'proj:shape': [5490, 5490],
          'proj:transform': [20, 0, 600000, 0, -20, 4200000],
          'raster:bands': [
            {
              nodata: 0,
              data_type: 'uint16',
              bits_per_sample: 15,
              spatial_resolution: 20,
              scale: 0.0001,
              offset: -0.1
            }
          ],
          roles: ['data', 'reflectance']
        },
        swir22: {
          href: 'https://sentinel-cogs.s3.us-west-2.amazonaws.com/sentinel-s2-l2a-cogs/17/S/PB/2023/6/S2A_17SPB_20230617_0_L2A/B12.tif',
          type: 'image/tiff; application=geotiff; profile=cloud-optimized',
          title: 'SWIR 2 (band 12) - 20m',
          'eo:bands': [
            {
              name: 'swir22',
              common_name: 'swir22',
              description: 'SWIR 2 (band 12)',
              center_wavelength: 2.19,
              full_width_half_max: 0.242
            }
          ],
          gsd: 20,
          'proj:shape': [5490, 5490],
          'proj:transform': [20, 0, 600000, 0, -20, 4200000],
          'raster:bands': [
            {
              nodata: 0,
              data_type: 'uint16',
              bits_per_sample: 15,
              spatial_resolution: 20,
              scale: 0.0001,
              offset: -0.1
            }
          ],
          roles: ['data', 'reflectance']
        },
        thumbnail: {
          href: 'https://sentinel-cogs.s3.us-west-2.amazonaws.com/sentinel-s2-l2a-cogs/17/S/PB/2023/6/S2A_17SPB_20230617_0_L2A/thumbnail.jpg',
          type: 'image/jpeg',
          title: 'Thumbnail image',
          roles: ['thumbnail']
        },
        tileinfo_metadata: {
          href: 'https://sentinel-cogs.s3.us-west-2.amazonaws.com/sentinel-s2-l2a-cogs/17/S/PB/2023/6/S2A_17SPB_20230617_0_L2A/tileinfo_metadata.json',
          type: 'application/json',
          roles: ['metadata']
        },
        visual: {
          href: 'https://sentinel-cogs.s3.us-west-2.amazonaws.com/sentinel-s2-l2a-cogs/17/S/PB/2023/6/S2A_17SPB_20230617_0_L2A/TCI.tif',
          type: 'image/tiff; application=geotiff; profile=cloud-optimized',
          title: 'True color image',
          'eo:bands': [
            {
              name: 'red',
              common_name: 'red',
              description: 'Red (band 4)',
              center_wavelength: 0.665,
              full_width_half_max: 0.038
            },
            {
              name: 'green',
              common_name: 'green',
              description: 'Green (band 3)',
              center_wavelength: 0.56,
              full_width_half_max: 0.045
            },
            {
              name: 'blue',
              common_name: 'blue',
              description: 'Blue (band 2)',
              center_wavelength: 0.49,
              full_width_half_max: 0.098
            }
          ],
          'proj:shape': [10980, 10980],
          'proj:transform': [10, 0, 600000, 0, -10, 4200000],
          roles: ['visual']
        },
        wvp: {
          href: 'https://sentinel-cogs.s3.us-west-2.amazonaws.com/sentinel-s2-l2a-cogs/17/S/PB/2023/6/S2A_17SPB_20230617_0_L2A/WVP.tif',
          type: 'image/tiff; application=geotiff; profile=cloud-optimized',
          title: 'Water vapour (WVP)',
          'proj:shape': [5490, 5490],
          'proj:transform': [20, 0, 600000, 0, -20, 4200000],
          'raster:bands': [
            {
              nodata: 0,
              data_type: 'uint16',
              bits_per_sample: 15,
              spatial_resolution: 20,
              unit: 'cm',
              scale: 0.001,
              offset: 0
            }
          ],
          roles: ['data', 'reflectance']
        },
        'aot-jp2': {
          href: 's3://sentinel-s2-l2a/tiles/17/S/PB/2023/6/17/0/AOT.jp2',
          type: 'image/jp2',
          title: 'Aerosol optical thickness (AOT)',
          'proj:shape': [5490, 5490],
          'proj:transform': [20, 0, 600000, 0, -20, 4200000],
          'raster:bands': [
            {
              nodata: 0,
              data_type: 'uint16',
              bits_per_sample: 15,
              spatial_resolution: 20,
              scale: 0.001,
              offset: 0
            }
          ],
          roles: ['data', 'reflectance']
        },
        'blue-jp2': {
          href: 's3://sentinel-s2-l2a/tiles/17/S/PB/2023/6/17/0/B02.jp2',
          type: 'image/jp2',
          title: 'Blue (band 2) - 10m',
          'eo:bands': [
            {
              name: 'blue',
              common_name: 'blue',
              description: 'Blue (band 2)',
              center_wavelength: 0.49,
              full_width_half_max: 0.098
            }
          ],
          gsd: 10,
          'proj:shape': [10980, 10980],
          'proj:transform': [10, 0, 600000, 0, -10, 4200000],
          'raster:bands': [
            {
              nodata: 0,
              data_type: 'uint16',
              bits_per_sample: 15,
              spatial_resolution: 10,
              scale: 0.0001,
              offset: -0.1
            }
          ],
          roles: ['data', 'reflectance']
        },
        'coastal-jp2': {
          href: 's3://sentinel-s2-l2a/tiles/17/S/PB/2023/6/17/0/B01.jp2',
          type: 'image/jp2',
          title: 'Coastal aerosol (band 1) - 60m',
          'eo:bands': [
            {
              name: 'coastal',
              common_name: 'coastal',
              description: 'Coastal aerosol (band 1)',
              center_wavelength: 0.443,
              full_width_half_max: 0.027
            }
          ],
          gsd: 60,
          'proj:shape': [1830, 1830],
          'proj:transform': [60, 0, 600000, 0, -60, 4200000],
          'raster:bands': [
            {
              nodata: 0,
              data_type: 'uint16',
              bits_per_sample: 15,
              spatial_resolution: 60,
              scale: 0.0001,
              offset: -0.1
            }
          ],
          roles: ['data', 'reflectance']
        },
        'green-jp2': {
          href: 's3://sentinel-s2-l2a/tiles/17/S/PB/2023/6/17/0/B03.jp2',
          type: 'image/jp2',
          title: 'Green (band 3) - 10m',
          'eo:bands': [
            {
              name: 'green',
              common_name: 'green',
              description: 'Green (band 3)',
              center_wavelength: 0.56,
              full_width_half_max: 0.045
            }
          ],
          gsd: 10,
          'proj:shape': [10980, 10980],
          'proj:transform': [10, 0, 600000, 0, -10, 4200000],
          'raster:bands': [
            {
              nodata: 0,
              data_type: 'uint16',
              bits_per_sample: 15,
              spatial_resolution: 10,
              scale: 0.0001,
              offset: -0.1
            }
          ],
          roles: ['data', 'reflectance']
        },
        'nir-jp2': {
          href: 's3://sentinel-s2-l2a/tiles/17/S/PB/2023/6/17/0/B08.jp2',
          type: 'image/jp2',
          title: 'NIR 1 (band 8) - 10m',
          'eo:bands': [
            {
              name: 'nir',
              common_name: 'nir',
              description: 'NIR 1 (band 8)',
              center_wavelength: 0.842,
              full_width_half_max: 0.145
            }
          ],
          gsd: 10,
          'proj:shape': [10980, 10980],
          'proj:transform': [10, 0, 600000, 0, -10, 4200000],
          'raster:bands': [
            {
              nodata: 0,
              data_type: 'uint16',
              bits_per_sample: 15,
              spatial_resolution: 10,
              scale: 0.0001,
              offset: -0.1
            }
          ],
          roles: ['data', 'reflectance']
        },
        'nir08-jp2': {
          href: 's3://sentinel-s2-l2a/tiles/17/S/PB/2023/6/17/0/B8A.jp2',
          type: 'image/jp2',
          title: 'NIR 2 (band 8A) - 20m',
          'eo:bands': [
            {
              name: 'nir08',
              common_name: 'nir08',
              description: 'NIR 2 (band 8A)',
              center_wavelength: 0.865,
              full_width_half_max: 0.033
            }
          ],
          gsd: 20,
          'proj:shape': [5490, 5490],
          'proj:transform': [20, 0, 600000, 0, -20, 4200000],
          'raster:bands': [
            {
              nodata: 0,
              data_type: 'uint16',
              bits_per_sample: 15,
              spatial_resolution: 20,
              scale: 0.0001,
              offset: -0.1
            }
          ],
          roles: ['data', 'reflectance']
        },
        'nir09-jp2': {
          href: 's3://sentinel-s2-l2a/tiles/17/S/PB/2023/6/17/0/B09.jp2',
          type: 'image/jp2',
          title: 'NIR 3 (band 9) - 60m',
          'eo:bands': [
            {
              name: 'nir09',
              common_name: 'nir09',
              description: 'NIR 3 (band 9)',
              center_wavelength: 0.945,
              full_width_half_max: 0.026
            }
          ],
          gsd: 60,
          'proj:shape': [1830, 1830],
          'proj:transform': [60, 0, 600000, 0, -60, 4200000],
          'raster:bands': [
            {
              nodata: 0,
              data_type: 'uint16',
              bits_per_sample: 15,
              spatial_resolution: 60,
              scale: 0.0001,
              offset: -0.1
            }
          ],
          roles: ['data', 'reflectance']
        },
        'red-jp2': {
          href: 's3://sentinel-s2-l2a/tiles/17/S/PB/2023/6/17/0/B04.jp2',
          type: 'image/jp2',
          title: 'Red (band 4) - 10m',
          'eo:bands': [
            {
              name: 'red',
              common_name: 'red',
              description: 'Red (band 4)',
              center_wavelength: 0.665,
              full_width_half_max: 0.038
            }
          ],
          gsd: 10,
          'proj:shape': [10980, 10980],
          'proj:transform': [10, 0, 600000, 0, -10, 4200000],
          'raster:bands': [
            {
              nodata: 0,
              data_type: 'uint16',
              bits_per_sample: 15,
              spatial_resolution: 10,
              scale: 0.0001,
              offset: -0.1
            }
          ],
          roles: ['data', 'reflectance']
        },
        'rededge1-jp2': {
          href: 's3://sentinel-s2-l2a/tiles/17/S/PB/2023/6/17/0/B05.jp2',
          type: 'image/jp2',
          title: 'Red edge 1 (band 5) - 20m',
          'eo:bands': [
            {
              name: 'rededge1',
              common_name: 'rededge',
              description: 'Red edge 1 (band 5)',
              center_wavelength: 0.704,
              full_width_half_max: 0.019
            }
          ],
          gsd: 20,
          'proj:shape': [5490, 5490],
          'proj:transform': [20, 0, 600000, 0, -20, 4200000],
          'raster:bands': [
            {
              nodata: 0,
              data_type: 'uint16',
              bits_per_sample: 15,
              spatial_resolution: 20,
              scale: 0.0001,
              offset: -0.1
            }
          ],
          roles: ['data', 'reflectance']
        },
        'rededge2-jp2': {
          href: 's3://sentinel-s2-l2a/tiles/17/S/PB/2023/6/17/0/B06.jp2',
          type: 'image/jp2',
          title: 'Red edge 2 (band 6) - 20m',
          'eo:bands': [
            {
              name: 'rededge2',
              common_name: 'rededge',
              description: 'Red edge 2 (band 6)',
              center_wavelength: 0.74,
              full_width_half_max: 0.018
            }
          ],
          gsd: 20,
          'proj:shape': [5490, 5490],
          'proj:transform': [20, 0, 600000, 0, -20, 4200000],
          'raster:bands': [
            {
              nodata: 0,
              data_type: 'uint16',
              bits_per_sample: 15,
              spatial_resolution: 20,
              scale: 0.0001,
              offset: -0.1
            }
          ],
          roles: ['data', 'reflectance']
        },
        'rededge3-jp2': {
          href: 's3://sentinel-s2-l2a/tiles/17/S/PB/2023/6/17/0/B07.jp2',
          type: 'image/jp2',
          title: 'Red edge 3 (band 7) - 20m',
          'eo:bands': [
            {
              name: 'rededge3',
              common_name: 'rededge',
              description: 'Red edge 3 (band 7)',
              center_wavelength: 0.783,
              full_width_half_max: 0.028
            }
          ],
          gsd: 20,
          'proj:shape': [5490, 5490],
          'proj:transform': [20, 0, 600000, 0, -20, 4200000],
          'raster:bands': [
            {
              nodata: 0,
              data_type: 'uint16',
              bits_per_sample: 15,
              spatial_resolution: 20,
              scale: 0.0001,
              offset: -0.1
            }
          ],
          roles: ['data', 'reflectance']
        },
        'scl-jp2': {
          href: 's3://sentinel-s2-l2a/tiles/17/S/PB/2023/6/17/0/SCL.jp2',
          type: 'image/jp2',
          title: 'Scene classification map (SCL)',
          'proj:shape': [5490, 5490],
          'proj:transform': [20, 0, 600000, 0, -20, 4200000],
          'raster:bands': [
            {
              nodata: 0,
              data_type: 'uint8',
              spatial_resolution: 20
            }
          ],
          roles: ['data', 'reflectance']
        },
        'swir16-jp2': {
          href: 's3://sentinel-s2-l2a/tiles/17/S/PB/2023/6/17/0/B11.jp2',
          type: 'image/jp2',
          title: 'SWIR 1 (band 11) - 20m',
          'eo:bands': [
            {
              name: 'swir16',
              common_name: 'swir16',
              description: 'SWIR 1 (band 11)',
              center_wavelength: 1.61,
              full_width_half_max: 0.143
            }
          ],
          gsd: 20,
          'proj:shape': [5490, 5490],
          'proj:transform': [20, 0, 600000, 0, -20, 4200000],
          'raster:bands': [
            {
              nodata: 0,
              data_type: 'uint16',
              bits_per_sample: 15,
              spatial_resolution: 20,
              scale: 0.0001,
              offset: -0.1
            }
          ],
          roles: ['data', 'reflectance']
        },
        'swir22-jp2': {
          href: 's3://sentinel-s2-l2a/tiles/17/S/PB/2023/6/17/0/B12.jp2',
          type: 'image/jp2',
          title: 'SWIR 2 (band 12) - 20m',
          'eo:bands': [
            {
              name: 'swir22',
              common_name: 'swir22',
              description: 'SWIR 2 (band 12)',
              center_wavelength: 2.19,
              full_width_half_max: 0.242
            }
          ],
          gsd: 20,
          'proj:shape': [5490, 5490],
          'proj:transform': [20, 0, 600000, 0, -20, 4200000],
          'raster:bands': [
            {
              nodata: 0,
              data_type: 'uint16',
              bits_per_sample: 15,
              spatial_resolution: 20,
              scale: 0.0001,
              offset: -0.1
            }
          ],
          roles: ['data', 'reflectance']
        },
        'visual-jp2': {
          href: 's3://sentinel-s2-l2a/tiles/17/S/PB/2023/6/17/0/TCI.jp2',
          type: 'image/jp2',
          title: 'True color image',
          'eo:bands': [
            {
              name: 'red',
              common_name: 'red',
              description: 'Red (band 4)',
              center_wavelength: 0.665,
              full_width_half_max: 0.038
            },
            {
              name: 'green',
              common_name: 'green',
              description: 'Green (band 3)',
              center_wavelength: 0.56,
              full_width_half_max: 0.045
            },
            {
              name: 'blue',
              common_name: 'blue',
              description: 'Blue (band 2)',
              center_wavelength: 0.49,
              full_width_half_max: 0.098
            }
          ],
          'proj:shape': [10980, 10980],
          'proj:transform': [10, 0, 600000, 0, -10, 4200000],
          roles: ['visual']
        },
        'wvp-jp2': {
          href: 's3://sentinel-s2-l2a/tiles/17/S/PB/2023/6/17/0/WVP.jp2',
          type: 'image/jp2',
          title: 'Water vapour (WVP)',
          'proj:shape': [5490, 5490],
          'proj:transform': [20, 0, 600000, 0, -20, 4200000],
          'raster:bands': [
            {
              nodata: 0,
              data_type: 'uint16',
              bits_per_sample: 15,
              spatial_resolution: 20,
              unit: 'cm',
              scale: 0.001,
              offset: 0
            }
          ],
          roles: ['data', 'reflectance']
        }
      },
      bbox: [
        -79.87680832296512, 36.93451998232696, -78.61306950183968,
        37.94207619848921
      ],
      stac_extensions: [
        'https://stac-extensions.github.io/raster/v1.1.0/schema.json',
        'https://stac-extensions.github.io/view/v1.0.0/schema.json',
        'https://stac-extensions.github.io/mgrs/v1.0.0/schema.json',
        'https://stac-extensions.github.io/projection/v1.0.0/schema.json',
        'https://stac-extensions.github.io/processing/v1.1.0/schema.json',
        'https://stac-extensions.github.io/grid/v1.0.0/schema.json',
        'https://stac-extensions.github.io/eo/v1.0.0/schema.json'
      ],
      collection: 'sentinel-2-l2a'
    }
  ],
  links: [
    {
      rel: 'next',
      title: 'Next page of Items',
      method: 'GET',
      type: 'application/geo+json',
      href: 'https://earth-search.aws.element84.com/v1/search?datetime=2023-06-15T00%3A00%3A00Z%2F2023-06-29T23%3A59%3A59.999Z&intersects=%7B%22type%22%3A%22Polygon%22%2C%22coordinates%22%3A%5B%5B%5B-80.200195%2C37.535866%5D%2C%5B-79.3927%2C37.457418%5D%2C%5B-80.299072%2C37.252194%5D%2C%5B-80.200195%2C37.535866%5D%5D%5D%7D&query=%7B%22eo%3Acloud_cover%22%3A%7B%22gte%22%3A0%2C%22lte%22%3A30%7D%7D&collections=sentinel-2-l2a&limit=200&next=2023-06-17T16%3A13%3A01.409000Z%2CS2A_17SPB_20230617_0_L2A%2Csentinel-2-l2a'
    },
    {
      rel: 'root',
      type: 'application/json',
      href: 'https://earth-search.aws.element84.com/v1'
    }
  ]
}

export const mockAppConfig = {
  PUBLIC_URL: 'http://example.com/',
  LOGO_URL: './logo.png',
  LOGO_ALT: 'Alt description for my custom logo',
  DEFAULT_COLLECTION: 'cop-dem-glo-30',
  STAC_API_URL: 'https://api-endpoint.example.com',
  API_MAX_ITEMS: 200,
  SCENE_TILER_URL: 'https://titiler.example.com',
  DASHBOARD_BTN_URL: 'https://dashboard.example.com',
  ANALYZE_BTN_URL: 'https://dashboard.example.com',
  LAUNCH_URL: 'https://github.com/Element84/filmdrop-ui',
  ACTION_BUTTON: {
    text: 'Launch Your Own',
    url: 'https://github.com/Element84/filmdrop-ui'
  },
  SCENE_TILER_PARAMS: {
    'sentinel-2-l2a': {
      assets: ['red', 'green', 'blue'],
      color_formula: 'Gamma+RGB+3.2+Saturation+0.8+Sigmoidal+RGB+12+0.35'
    },
    'landsat-c2-l2': {
      assets: ['red', 'green', 'blue'],
      color_formula: 'Gamma+RGB+1.7+Saturation+1.7+Sigmoidal+RGB+15+0.35'
    },
    naip: {
      assets: ['image'],
      bidx: '1,2,3'
    },
    'cop-dem-glo-30': {
      assets: ['data'],
      colormap_name: 'terrain',
      rescale: ['-1000,4000']
    },
    'cop-dem-glo-90': {
      assets: ['data'],
      colormap_name: 'terrain',
      rescale: ['-1000,4000']
    },
    'sentinel-1-grd': {
      assets: ['vv'],
      rescale: ['0,250'],
      colormap_name: 'plasma'
    }
  },
  MOSAIC_TILER_URL: 'https://titiler-mosaic.example.com',
  MOSAIC_TILER_PARAMS: {
    'sentinel-2-l2a': {
      assets: ['visual']
    },
    'landsat-c2-l2': {
      assets: ['red'],
      color_formula: 'Gamma+R+1.7+Sigmoidal+R+15+0.35'
    },
    naip: {
      assets: ['image'],
      bidx: '1,2,3'
    },
    'cop-dem-glo-30': {
      assets: ['data'],
      colormap_name: 'terrain',
      rescale: ['-1000,4000']
    },
    'cop-dem-glo-90': {
      assets: ['data'],
      colormap_name: 'terrain',
      rescale: ['-1000,4000']
    },
    'sentinel-1-grd': {
      assets: ['vv'],
      rescale: ['0,250'],
      colormap_name: 'plasma'
    }
  },
  MOSAIC_MAX_ITEMS: 100,
  MOSAIC_MIN_ZOOM_LEVEL: 7,
  CONFIG_COLORMAP: 'viridis',
  SEARCH_MIN_ZOOM_LEVELS: {
    'sentinel-2-l2a': {
      medium: 4,
      high: 7
    },
    'landsat-c2-l2': {
      medium: 4,
      high: 7
    },
    naip: {
      medium: 10,
      high: 14
    },
    'cop-dem-glo-30': {
      medium: 6,
      high: 8
    },
    'cop-dem-glo-90': {
      medium: 6,
      high: 8
    },
    'sentinel-1-grd': {
      medium: 7,
      high: 7
    }
  },
  BASEMAP_URL: 'https://tile-provider.example.com/{z}/{x}/{y}.png',
  BASEMAP_HTML_ATTRIBUTION:
    '&copy; <a href="https://www.tile-provider.example.com/copyright">TileProvider</a>',
  SEARCH_BY_GEOM_ENABLED: false,
  CART_ENABLED: false,
  SHOW_BRAND_LOGO: true
}

export const mockClickResults = [
  {
    type: 'Feature',
    stac_version: '1.0.0',
    id: 'S2B_17SNB_20230801_0_L2A',
    properties: {
      created: '2023-08-02T01:04:42.598Z',
      platform: 'sentinel-2b',
      constellation: 'sentinel-2',
      instruments: ['msi'],
      'eo:cloud_cover': 10.123754,
      'proj:epsg': 32617,
      'mgrs:utm_zone': 17,
      'mgrs:latitude_band': 'S',
      'mgrs:grid_square': 'NB',
      'grid:code': 'MGRS-17SNB',
      'view:sun_azimuth': 134.826629308296,
      'view:sun_elevation': 64.5308565780359,
      's2:degraded_msi_data_percentage': 0.0169,
      's2:nodata_pixel_percentage': 13.382663,
      's2:saturated_defective_pixel_percentage': 0,
      's2:dark_features_percentage': 0.050508,
      's2:cloud_shadow_percentage': 5.57465,
      's2:vegetation_percentage': 80.913961,
      's2:not_vegetated_percentage': 2.433447,
      's2:water_percentage': 0.225683,
      's2:unclassified_percentage': 0.677995,
      's2:medium_proba_clouds_percentage': 5.293403,
      's2:high_proba_clouds_percentage': 4.423752,
      's2:thin_cirrus_percentage': 0.406599,
      's2:snow_ice_percentage': 0,
      's2:product_type': 'S2MSI2A',
      's2:processing_baseline': '05.09',
      's2:product_uri':
        'S2B_MSIL2A_20230801T155829_N0509_R097_T17SNB_20230801T204743.SAFE',
      's2:generation_time': '2023-08-01T20:47:43.000000Z',
      's2:datatake_id': 'GS2B_20230801T155829_033442_N05.09',
      's2:datatake_type': 'INS-NOBS',
      's2:datastrip_id':
        'S2B_OPER_MSI_L2A_DS_2BPS_20230801T204743_S20230801T160859_N05.09',
      's2:granule_id':
        'S2B_OPER_MSI_L2A_TL_2BPS_20230801T204743_A033442_T17SNB_N05.09',
      's2:reflectance_conversion_factor': 0.969933433227093,
      datetime: '2023-08-01T16:13:05.549000Z',
      's2:sequence': '0',
      'earthsearch:s3_path':
        's3://sentinel-cogs/sentinel-s2-l2a-cogs/17/S/NB/2023/8/S2B_17SNB_20230801_0_L2A',
      'earthsearch:payload_id':
        'roda-sentinel2/workflow-sentinel2-to-stac/c5043c5c3483ccca0c3fcc1c987cdfc8',
      'earthsearch:boa_offset_applied': true,
      'processing:software': {
        'sentinel2-to-stac': '0.1.1'
      },
      updated: '2023-08-02T01:04:42.598Z'
    },
    geometry: {
      type: 'Polygon',
      coordinates: [
        [
          [-80.69049497570961, 37.947173482649525],
          [-80.74711573388302, 37.747386931802936],
          [-80.85420953215277, 37.37961342804283],
          [-80.88508924806412, 37.26600499133067],
          [-80.9740087373394, 36.957887265054474],
          [-79.76700583572914, 36.951488600423914],
          [-79.75065723902863, 37.94094734012891],
          [-80.69049497570961, 37.947173482649525]
        ]
      ]
    },
    links: [
      {
        rel: 'self',
        type: 'application/geo+json',
        href: 'https://earth-search.aws.element84.com/v1/collections/sentinel-2-l2a/items/S2B_17SNB_20230801_0_L2A'
      },
      {
        rel: 'canonical',
        href: 's3://sentinel-cogs/sentinel-s2-l2a-cogs/17/S/NB/2023/8/S2B_17SNB_20230801_0_L2A/S2B_17SNB_20230801_0_L2A.json',
        type: 'application/json'
      },
      {
        rel: 'license',
        href: 'https://sentinel.esa.int/documents/247904/690755/Sentinel_Data_Legal_Notice'
      },
      {
        rel: 'derived_from',
        href: 'https://earth-search.aws.element84.com/v1/collections/sentinel-2-l1c/items/S2B_17SNB_20230801_0_L1C',
        type: 'application/geo+json'
      },
      {
        rel: 'parent',
        type: 'application/json',
        href: 'https://earth-search.aws.element84.com/v1/collections/sentinel-2-l2a'
      },
      {
        rel: 'collection',
        type: 'application/json',
        href: 'https://earth-search.aws.element84.com/v1/collections/sentinel-2-l2a'
      },
      {
        rel: 'root',
        type: 'application/json',
        href: 'https://earth-search.aws.element84.com/v1'
      },
      {
        rel: 'thumbnail',
        href: 'https://earth-search.aws.element84.com/v1/collections/sentinel-2-l2a/items/S2B_17SNB_20230801_0_L2A/thumbnail'
      }
    ],
    assets: {
      aot: {
        href: 'https://sentinel-cogs.s3.us-west-2.amazonaws.com/sentinel-s2-l2a-cogs/17/S/NB/2023/8/S2B_17SNB_20230801_0_L2A/AOT.tif',
        type: 'image/tiff; application=geotiff; profile=cloud-optimized',
        title: 'Aerosol optical thickness (AOT)',
        'proj:shape': [5490, 5490],
        'proj:transform': [20, 0, 499980, 0, -20, 4200000],
        'raster:bands': [
          {
            nodata: 0,
            data_type: 'uint16',
            bits_per_sample: 15,
            spatial_resolution: 20,
            scale: 0.001,
            offset: 0
          }
        ],
        roles: ['data', 'reflectance']
      },
      blue: {
        href: 'https://sentinel-cogs.s3.us-west-2.amazonaws.com/sentinel-s2-l2a-cogs/17/S/NB/2023/8/S2B_17SNB_20230801_0_L2A/B02.tif',
        type: 'image/tiff; application=geotiff; profile=cloud-optimized',
        title: 'Blue (band 2) - 10m',
        'eo:bands': [
          {
            name: 'blue',
            common_name: 'blue',
            description: 'Blue (band 2)',
            center_wavelength: 0.49,
            full_width_half_max: 0.098
          }
        ],
        gsd: 10,
        'proj:shape': [10980, 10980],
        'proj:transform': [10, 0, 499980, 0, -10, 4200000],
        'raster:bands': [
          {
            nodata: 0,
            data_type: 'uint16',
            bits_per_sample: 15,
            spatial_resolution: 10,
            scale: 0.0001,
            offset: -0.1
          }
        ],
        roles: ['data', 'reflectance']
      },
      coastal: {
        href: 'https://sentinel-cogs.s3.us-west-2.amazonaws.com/sentinel-s2-l2a-cogs/17/S/NB/2023/8/S2B_17SNB_20230801_0_L2A/B01.tif',
        type: 'image/tiff; application=geotiff; profile=cloud-optimized',
        title: 'Coastal aerosol (band 1) - 60m',
        'eo:bands': [
          {
            name: 'coastal',
            common_name: 'coastal',
            description: 'Coastal aerosol (band 1)',
            center_wavelength: 0.443,
            full_width_half_max: 0.027
          }
        ],
        gsd: 60,
        'proj:shape': [1830, 1830],
        'proj:transform': [60, 0, 499980, 0, -60, 4200000],
        'raster:bands': [
          {
            nodata: 0,
            data_type: 'uint16',
            bits_per_sample: 15,
            spatial_resolution: 60,
            scale: 0.0001,
            offset: -0.1
          }
        ],
        roles: ['data', 'reflectance']
      },
      granule_metadata: {
        href: 'https://sentinel-cogs.s3.us-west-2.amazonaws.com/sentinel-s2-l2a-cogs/17/S/NB/2023/8/S2B_17SNB_20230801_0_L2A/granule_metadata.xml',
        type: 'application/xml',
        roles: ['metadata']
      },
      green: {
        href: 'https://sentinel-cogs.s3.us-west-2.amazonaws.com/sentinel-s2-l2a-cogs/17/S/NB/2023/8/S2B_17SNB_20230801_0_L2A/B03.tif',
        type: 'image/tiff; application=geotiff; profile=cloud-optimized',
        title: 'Green (band 3) - 10m',
        'eo:bands': [
          {
            name: 'green',
            common_name: 'green',
            description: 'Green (band 3)',
            center_wavelength: 0.56,
            full_width_half_max: 0.045
          }
        ],
        gsd: 10,
        'proj:shape': [10980, 10980],
        'proj:transform': [10, 0, 499980, 0, -10, 4200000],
        'raster:bands': [
          {
            nodata: 0,
            data_type: 'uint16',
            bits_per_sample: 15,
            spatial_resolution: 10,
            scale: 0.0001,
            offset: -0.1
          }
        ],
        roles: ['data', 'reflectance']
      },
      nir: {
        href: 'https://sentinel-cogs.s3.us-west-2.amazonaws.com/sentinel-s2-l2a-cogs/17/S/NB/2023/8/S2B_17SNB_20230801_0_L2A/B08.tif',
        type: 'image/tiff; application=geotiff; profile=cloud-optimized',
        title: 'NIR 1 (band 8) - 10m',
        'eo:bands': [
          {
            name: 'nir',
            common_name: 'nir',
            description: 'NIR 1 (band 8)',
            center_wavelength: 0.842,
            full_width_half_max: 0.145
          }
        ],
        gsd: 10,
        'proj:shape': [10980, 10980],
        'proj:transform': [10, 0, 499980, 0, -10, 4200000],
        'raster:bands': [
          {
            nodata: 0,
            data_type: 'uint16',
            bits_per_sample: 15,
            spatial_resolution: 10,
            scale: 0.0001,
            offset: -0.1
          }
        ],
        roles: ['data', 'reflectance']
      },
      nir08: {
        href: 'https://sentinel-cogs.s3.us-west-2.amazonaws.com/sentinel-s2-l2a-cogs/17/S/NB/2023/8/S2B_17SNB_20230801_0_L2A/B8A.tif',
        type: 'image/tiff; application=geotiff; profile=cloud-optimized',
        title: 'NIR 2 (band 8A) - 20m',
        'eo:bands': [
          {
            name: 'nir08',
            common_name: 'nir08',
            description: 'NIR 2 (band 8A)',
            center_wavelength: 0.865,
            full_width_half_max: 0.033
          }
        ],
        gsd: 20,
        'proj:shape': [5490, 5490],
        'proj:transform': [20, 0, 499980, 0, -20, 4200000],
        'raster:bands': [
          {
            nodata: 0,
            data_type: 'uint16',
            bits_per_sample: 15,
            spatial_resolution: 20,
            scale: 0.0001,
            offset: -0.1
          }
        ],
        roles: ['data', 'reflectance']
      },
      nir09: {
        href: 'https://sentinel-cogs.s3.us-west-2.amazonaws.com/sentinel-s2-l2a-cogs/17/S/NB/2023/8/S2B_17SNB_20230801_0_L2A/B09.tif',
        type: 'image/tiff; application=geotiff; profile=cloud-optimized',
        title: 'NIR 3 (band 9) - 60m',
        'eo:bands': [
          {
            name: 'nir09',
            common_name: 'nir09',
            description: 'NIR 3 (band 9)',
            center_wavelength: 0.945,
            full_width_half_max: 0.026
          }
        ],
        gsd: 60,
        'proj:shape': [1830, 1830],
        'proj:transform': [60, 0, 499980, 0, -60, 4200000],
        'raster:bands': [
          {
            nodata: 0,
            data_type: 'uint16',
            bits_per_sample: 15,
            spatial_resolution: 60,
            scale: 0.0001,
            offset: -0.1
          }
        ],
        roles: ['data', 'reflectance']
      },
      red: {
        href: 'https://sentinel-cogs.s3.us-west-2.amazonaws.com/sentinel-s2-l2a-cogs/17/S/NB/2023/8/S2B_17SNB_20230801_0_L2A/B04.tif',
        type: 'image/tiff; application=geotiff; profile=cloud-optimized',
        title: 'Red (band 4) - 10m',
        'eo:bands': [
          {
            name: 'red',
            common_name: 'red',
            description: 'Red (band 4)',
            center_wavelength: 0.665,
            full_width_half_max: 0.038
          }
        ],
        gsd: 10,
        'proj:shape': [10980, 10980],
        'proj:transform': [10, 0, 499980, 0, -10, 4200000],
        'raster:bands': [
          {
            nodata: 0,
            data_type: 'uint16',
            bits_per_sample: 15,
            spatial_resolution: 10,
            scale: 0.0001,
            offset: -0.1
          }
        ],
        roles: ['data', 'reflectance']
      },
      rededge1: {
        href: 'https://sentinel-cogs.s3.us-west-2.amazonaws.com/sentinel-s2-l2a-cogs/17/S/NB/2023/8/S2B_17SNB_20230801_0_L2A/B05.tif',
        type: 'image/tiff; application=geotiff; profile=cloud-optimized',
        title: 'Red edge 1 (band 5) - 20m',
        'eo:bands': [
          {
            name: 'rededge1',
            common_name: 'rededge',
            description: 'Red edge 1 (band 5)',
            center_wavelength: 0.704,
            full_width_half_max: 0.019
          }
        ],
        gsd: 20,
        'proj:shape': [5490, 5490],
        'proj:transform': [20, 0, 499980, 0, -20, 4200000],
        'raster:bands': [
          {
            nodata: 0,
            data_type: 'uint16',
            bits_per_sample: 15,
            spatial_resolution: 20,
            scale: 0.0001,
            offset: -0.1
          }
        ],
        roles: ['data', 'reflectance']
      },
      rededge2: {
        href: 'https://sentinel-cogs.s3.us-west-2.amazonaws.com/sentinel-s2-l2a-cogs/17/S/NB/2023/8/S2B_17SNB_20230801_0_L2A/B06.tif',
        type: 'image/tiff; application=geotiff; profile=cloud-optimized',
        title: 'Red edge 2 (band 6) - 20m',
        'eo:bands': [
          {
            name: 'rededge2',
            common_name: 'rededge',
            description: 'Red edge 2 (band 6)',
            center_wavelength: 0.74,
            full_width_half_max: 0.018
          }
        ],
        gsd: 20,
        'proj:shape': [5490, 5490],
        'proj:transform': [20, 0, 499980, 0, -20, 4200000],
        'raster:bands': [
          {
            nodata: 0,
            data_type: 'uint16',
            bits_per_sample: 15,
            spatial_resolution: 20,
            scale: 0.0001,
            offset: -0.1
          }
        ],
        roles: ['data', 'reflectance']
      },
      rededge3: {
        href: 'https://sentinel-cogs.s3.us-west-2.amazonaws.com/sentinel-s2-l2a-cogs/17/S/NB/2023/8/S2B_17SNB_20230801_0_L2A/B07.tif',
        type: 'image/tiff; application=geotiff; profile=cloud-optimized',
        title: 'Red edge 3 (band 7) - 20m',
        'eo:bands': [
          {
            name: 'rededge3',
            common_name: 'rededge',
            description: 'Red edge 3 (band 7)',
            center_wavelength: 0.783,
            full_width_half_max: 0.028
          }
        ],
        gsd: 20,
        'proj:shape': [5490, 5490],
        'proj:transform': [20, 0, 499980, 0, -20, 4200000],
        'raster:bands': [
          {
            nodata: 0,
            data_type: 'uint16',
            bits_per_sample: 15,
            spatial_resolution: 20,
            scale: 0.0001,
            offset: -0.1
          }
        ],
        roles: ['data', 'reflectance']
      },
      scl: {
        href: 'https://sentinel-cogs.s3.us-west-2.amazonaws.com/sentinel-s2-l2a-cogs/17/S/NB/2023/8/S2B_17SNB_20230801_0_L2A/SCL.tif',
        type: 'image/tiff; application=geotiff; profile=cloud-optimized',
        title: 'Scene classification map (SCL)',
        'proj:shape': [5490, 5490],
        'proj:transform': [20, 0, 499980, 0, -20, 4200000],
        'raster:bands': [
          {
            nodata: 0,
            data_type: 'uint8',
            spatial_resolution: 20
          }
        ],
        roles: ['data', 'reflectance']
      },
      swir16: {
        href: 'https://sentinel-cogs.s3.us-west-2.amazonaws.com/sentinel-s2-l2a-cogs/17/S/NB/2023/8/S2B_17SNB_20230801_0_L2A/B11.tif',
        type: 'image/tiff; application=geotiff; profile=cloud-optimized',
        title: 'SWIR 1 (band 11) - 20m',
        'eo:bands': [
          {
            name: 'swir16',
            common_name: 'swir16',
            description: 'SWIR 1 (band 11)',
            center_wavelength: 1.61,
            full_width_half_max: 0.143
          }
        ],
        gsd: 20,
        'proj:shape': [5490, 5490],
        'proj:transform': [20, 0, 499980, 0, -20, 4200000],
        'raster:bands': [
          {
            nodata: 0,
            data_type: 'uint16',
            bits_per_sample: 15,
            spatial_resolution: 20,
            scale: 0.0001,
            offset: -0.1
          }
        ],
        roles: ['data', 'reflectance']
      },
      swir22: {
        href: 'https://sentinel-cogs.s3.us-west-2.amazonaws.com/sentinel-s2-l2a-cogs/17/S/NB/2023/8/S2B_17SNB_20230801_0_L2A/B12.tif',
        type: 'image/tiff; application=geotiff; profile=cloud-optimized',
        title: 'SWIR 2 (band 12) - 20m',
        'eo:bands': [
          {
            name: 'swir22',
            common_name: 'swir22',
            description: 'SWIR 2 (band 12)',
            center_wavelength: 2.19,
            full_width_half_max: 0.242
          }
        ],
        gsd: 20,
        'proj:shape': [5490, 5490],
        'proj:transform': [20, 0, 499980, 0, -20, 4200000],
        'raster:bands': [
          {
            nodata: 0,
            data_type: 'uint16',
            bits_per_sample: 15,
            spatial_resolution: 20,
            scale: 0.0001,
            offset: -0.1
          }
        ],
        roles: ['data', 'reflectance']
      },
      thumbnail: {
        href: 'https://sentinel-cogs.s3.us-west-2.amazonaws.com/sentinel-s2-l2a-cogs/17/S/NB/2023/8/S2B_17SNB_20230801_0_L2A/thumbnail.jpg',
        type: 'image/jpeg',
        title: 'Thumbnail image',
        roles: ['thumbnail']
      },
      tileinfo_metadata: {
        href: 'https://sentinel-cogs.s3.us-west-2.amazonaws.com/sentinel-s2-l2a-cogs/17/S/NB/2023/8/S2B_17SNB_20230801_0_L2A/tileinfo_metadata.json',
        type: 'application/json',
        roles: ['metadata']
      },
      visual: {
        href: 'https://sentinel-cogs.s3.us-west-2.amazonaws.com/sentinel-s2-l2a-cogs/17/S/NB/2023/8/S2B_17SNB_20230801_0_L2A/TCI.tif',
        type: 'image/tiff; application=geotiff; profile=cloud-optimized',
        title: 'True color image',
        'eo:bands': [
          {
            name: 'red',
            common_name: 'red',
            description: 'Red (band 4)',
            center_wavelength: 0.665,
            full_width_half_max: 0.038
          },
          {
            name: 'green',
            common_name: 'green',
            description: 'Green (band 3)',
            center_wavelength: 0.56,
            full_width_half_max: 0.045
          },
          {
            name: 'blue',
            common_name: 'blue',
            description: 'Blue (band 2)',
            center_wavelength: 0.49,
            full_width_half_max: 0.098
          }
        ],
        'proj:shape': [10980, 10980],
        'proj:transform': [10, 0, 499980, 0, -10, 4200000],
        roles: ['visual']
      },
      wvp: {
        href: 'https://sentinel-cogs.s3.us-west-2.amazonaws.com/sentinel-s2-l2a-cogs/17/S/NB/2023/8/S2B_17SNB_20230801_0_L2A/WVP.tif',
        type: 'image/tiff; application=geotiff; profile=cloud-optimized',
        title: 'Water vapour (WVP)',
        'proj:shape': [5490, 5490],
        'proj:transform': [20, 0, 499980, 0, -20, 4200000],
        'raster:bands': [
          {
            nodata: 0,
            data_type: 'uint16',
            bits_per_sample: 15,
            spatial_resolution: 20,
            unit: 'cm',
            scale: 0.001,
            offset: 0
          }
        ],
        roles: ['data', 'reflectance']
      },
      'aot-jp2': {
        href: 's3://sentinel-s2-l2a/tiles/17/S/NB/2023/8/1/0/AOT.jp2',
        type: 'image/jp2',
        title: 'Aerosol optical thickness (AOT)',
        'proj:shape': [5490, 5490],
        'proj:transform': [20, 0, 499980, 0, -20, 4200000],
        'raster:bands': [
          {
            nodata: 0,
            data_type: 'uint16',
            bits_per_sample: 15,
            spatial_resolution: 20,
            scale: 0.001,
            offset: 0
          }
        ],
        roles: ['data', 'reflectance']
      },
      'blue-jp2': {
        href: 's3://sentinel-s2-l2a/tiles/17/S/NB/2023/8/1/0/B02.jp2',
        type: 'image/jp2',
        title: 'Blue (band 2) - 10m',
        'eo:bands': [
          {
            name: 'blue',
            common_name: 'blue',
            description: 'Blue (band 2)',
            center_wavelength: 0.49,
            full_width_half_max: 0.098
          }
        ],
        gsd: 10,
        'proj:shape': [10980, 10980],
        'proj:transform': [10, 0, 499980, 0, -10, 4200000],
        'raster:bands': [
          {
            nodata: 0,
            data_type: 'uint16',
            bits_per_sample: 15,
            spatial_resolution: 10,
            scale: 0.0001,
            offset: -0.1
          }
        ],
        roles: ['data', 'reflectance']
      },
      'coastal-jp2': {
        href: 's3://sentinel-s2-l2a/tiles/17/S/NB/2023/8/1/0/B01.jp2',
        type: 'image/jp2',
        title: 'Coastal aerosol (band 1) - 60m',
        'eo:bands': [
          {
            name: 'coastal',
            common_name: 'coastal',
            description: 'Coastal aerosol (band 1)',
            center_wavelength: 0.443,
            full_width_half_max: 0.027
          }
        ],
        gsd: 60,
        'proj:shape': [1830, 1830],
        'proj:transform': [60, 0, 499980, 0, -60, 4200000],
        'raster:bands': [
          {
            nodata: 0,
            data_type: 'uint16',
            bits_per_sample: 15,
            spatial_resolution: 60,
            scale: 0.0001,
            offset: -0.1
          }
        ],
        roles: ['data', 'reflectance']
      },
      'green-jp2': {
        href: 's3://sentinel-s2-l2a/tiles/17/S/NB/2023/8/1/0/B03.jp2',
        type: 'image/jp2',
        title: 'Green (band 3) - 10m',
        'eo:bands': [
          {
            name: 'green',
            common_name: 'green',
            description: 'Green (band 3)',
            center_wavelength: 0.56,
            full_width_half_max: 0.045
          }
        ],
        gsd: 10,
        'proj:shape': [10980, 10980],
        'proj:transform': [10, 0, 499980, 0, -10, 4200000],
        'raster:bands': [
          {
            nodata: 0,
            data_type: 'uint16',
            bits_per_sample: 15,
            spatial_resolution: 10,
            scale: 0.0001,
            offset: -0.1
          }
        ],
        roles: ['data', 'reflectance']
      },
      'nir-jp2': {
        href: 's3://sentinel-s2-l2a/tiles/17/S/NB/2023/8/1/0/B08.jp2',
        type: 'image/jp2',
        title: 'NIR 1 (band 8) - 10m',
        'eo:bands': [
          {
            name: 'nir',
            common_name: 'nir',
            description: 'NIR 1 (band 8)',
            center_wavelength: 0.842,
            full_width_half_max: 0.145
          }
        ],
        gsd: 10,
        'proj:shape': [10980, 10980],
        'proj:transform': [10, 0, 499980, 0, -10, 4200000],
        'raster:bands': [
          {
            nodata: 0,
            data_type: 'uint16',
            bits_per_sample: 15,
            spatial_resolution: 10,
            scale: 0.0001,
            offset: -0.1
          }
        ],
        roles: ['data', 'reflectance']
      },
      'nir08-jp2': {
        href: 's3://sentinel-s2-l2a/tiles/17/S/NB/2023/8/1/0/B8A.jp2',
        type: 'image/jp2',
        title: 'NIR 2 (band 8A) - 20m',
        'eo:bands': [
          {
            name: 'nir08',
            common_name: 'nir08',
            description: 'NIR 2 (band 8A)',
            center_wavelength: 0.865,
            full_width_half_max: 0.033
          }
        ],
        gsd: 20,
        'proj:shape': [5490, 5490],
        'proj:transform': [20, 0, 499980, 0, -20, 4200000],
        'raster:bands': [
          {
            nodata: 0,
            data_type: 'uint16',
            bits_per_sample: 15,
            spatial_resolution: 20,
            scale: 0.0001,
            offset: -0.1
          }
        ],
        roles: ['data', 'reflectance']
      },
      'nir09-jp2': {
        href: 's3://sentinel-s2-l2a/tiles/17/S/NB/2023/8/1/0/B09.jp2',
        type: 'image/jp2',
        title: 'NIR 3 (band 9) - 60m',
        'eo:bands': [
          {
            name: 'nir09',
            common_name: 'nir09',
            description: 'NIR 3 (band 9)',
            center_wavelength: 0.945,
            full_width_half_max: 0.026
          }
        ],
        gsd: 60,
        'proj:shape': [1830, 1830],
        'proj:transform': [60, 0, 499980, 0, -60, 4200000],
        'raster:bands': [
          {
            nodata: 0,
            data_type: 'uint16',
            bits_per_sample: 15,
            spatial_resolution: 60,
            scale: 0.0001,
            offset: -0.1
          }
        ],
        roles: ['data', 'reflectance']
      },
      'red-jp2': {
        href: 's3://sentinel-s2-l2a/tiles/17/S/NB/2023/8/1/0/B04.jp2',
        type: 'image/jp2',
        title: 'Red (band 4) - 10m',
        'eo:bands': [
          {
            name: 'red',
            common_name: 'red',
            description: 'Red (band 4)',
            center_wavelength: 0.665,
            full_width_half_max: 0.038
          }
        ],
        gsd: 10,
        'proj:shape': [10980, 10980],
        'proj:transform': [10, 0, 499980, 0, -10, 4200000],
        'raster:bands': [
          {
            nodata: 0,
            data_type: 'uint16',
            bits_per_sample: 15,
            spatial_resolution: 10,
            scale: 0.0001,
            offset: -0.1
          }
        ],
        roles: ['data', 'reflectance']
      },
      'rededge1-jp2': {
        href: 's3://sentinel-s2-l2a/tiles/17/S/NB/2023/8/1/0/B05.jp2',
        type: 'image/jp2',
        title: 'Red edge 1 (band 5) - 20m',
        'eo:bands': [
          {
            name: 'rededge1',
            common_name: 'rededge',
            description: 'Red edge 1 (band 5)',
            center_wavelength: 0.704,
            full_width_half_max: 0.019
          }
        ],
        gsd: 20,
        'proj:shape': [5490, 5490],
        'proj:transform': [20, 0, 499980, 0, -20, 4200000],
        'raster:bands': [
          {
            nodata: 0,
            data_type: 'uint16',
            bits_per_sample: 15,
            spatial_resolution: 20,
            scale: 0.0001,
            offset: -0.1
          }
        ],
        roles: ['data', 'reflectance']
      },
      'rededge2-jp2': {
        href: 's3://sentinel-s2-l2a/tiles/17/S/NB/2023/8/1/0/B06.jp2',
        type: 'image/jp2',
        title: 'Red edge 2 (band 6) - 20m',
        'eo:bands': [
          {
            name: 'rededge2',
            common_name: 'rededge',
            description: 'Red edge 2 (band 6)',
            center_wavelength: 0.74,
            full_width_half_max: 0.018
          }
        ],
        gsd: 20,
        'proj:shape': [5490, 5490],
        'proj:transform': [20, 0, 499980, 0, -20, 4200000],
        'raster:bands': [
          {
            nodata: 0,
            data_type: 'uint16',
            bits_per_sample: 15,
            spatial_resolution: 20,
            scale: 0.0001,
            offset: -0.1
          }
        ],
        roles: ['data', 'reflectance']
      },
      'rededge3-jp2': {
        href: 's3://sentinel-s2-l2a/tiles/17/S/NB/2023/8/1/0/B07.jp2',
        type: 'image/jp2',
        title: 'Red edge 3 (band 7) - 20m',
        'eo:bands': [
          {
            name: 'rededge3',
            common_name: 'rededge',
            description: 'Red edge 3 (band 7)',
            center_wavelength: 0.783,
            full_width_half_max: 0.028
          }
        ],
        gsd: 20,
        'proj:shape': [5490, 5490],
        'proj:transform': [20, 0, 499980, 0, -20, 4200000],
        'raster:bands': [
          {
            nodata: 0,
            data_type: 'uint16',
            bits_per_sample: 15,
            spatial_resolution: 20,
            scale: 0.0001,
            offset: -0.1
          }
        ],
        roles: ['data', 'reflectance']
      },
      'scl-jp2': {
        href: 's3://sentinel-s2-l2a/tiles/17/S/NB/2023/8/1/0/SCL.jp2',
        type: 'image/jp2',
        title: 'Scene classification map (SCL)',
        'proj:shape': [5490, 5490],
        'proj:transform': [20, 0, 499980, 0, -20, 4200000],
        'raster:bands': [
          {
            nodata: 0,
            data_type: 'uint8',
            spatial_resolution: 20
          }
        ],
        roles: ['data', 'reflectance']
      },
      'swir16-jp2': {
        href: 's3://sentinel-s2-l2a/tiles/17/S/NB/2023/8/1/0/B11.jp2',
        type: 'image/jp2',
        title: 'SWIR 1 (band 11) - 20m',
        'eo:bands': [
          {
            name: 'swir16',
            common_name: 'swir16',
            description: 'SWIR 1 (band 11)',
            center_wavelength: 1.61,
            full_width_half_max: 0.143
          }
        ],
        gsd: 20,
        'proj:shape': [5490, 5490],
        'proj:transform': [20, 0, 499980, 0, -20, 4200000],
        'raster:bands': [
          {
            nodata: 0,
            data_type: 'uint16',
            bits_per_sample: 15,
            spatial_resolution: 20,
            scale: 0.0001,
            offset: -0.1
          }
        ],
        roles: ['data', 'reflectance']
      },
      'swir22-jp2': {
        href: 's3://sentinel-s2-l2a/tiles/17/S/NB/2023/8/1/0/B12.jp2',
        type: 'image/jp2',
        title: 'SWIR 2 (band 12) - 20m',
        'eo:bands': [
          {
            name: 'swir22',
            common_name: 'swir22',
            description: 'SWIR 2 (band 12)',
            center_wavelength: 2.19,
            full_width_half_max: 0.242
          }
        ],
        gsd: 20,
        'proj:shape': [5490, 5490],
        'proj:transform': [20, 0, 499980, 0, -20, 4200000],
        'raster:bands': [
          {
            nodata: 0,
            data_type: 'uint16',
            bits_per_sample: 15,
            spatial_resolution: 20,
            scale: 0.0001,
            offset: -0.1
          }
        ],
        roles: ['data', 'reflectance']
      },
      'visual-jp2': {
        href: 's3://sentinel-s2-l2a/tiles/17/S/NB/2023/8/1/0/TCI.jp2',
        type: 'image/jp2',
        title: 'True color image',
        'eo:bands': [
          {
            name: 'red',
            common_name: 'red',
            description: 'Red (band 4)',
            center_wavelength: 0.665,
            full_width_half_max: 0.038
          },
          {
            name: 'green',
            common_name: 'green',
            description: 'Green (band 3)',
            center_wavelength: 0.56,
            full_width_half_max: 0.045
          },
          {
            name: 'blue',
            common_name: 'blue',
            description: 'Blue (band 2)',
            center_wavelength: 0.49,
            full_width_half_max: 0.098
          }
        ],
        'proj:shape': [10980, 10980],
        'proj:transform': [10, 0, 499980, 0, -10, 4200000],
        roles: ['visual']
      },
      'wvp-jp2': {
        href: 's3://sentinel-s2-l2a/tiles/17/S/NB/2023/8/1/0/WVP.jp2',
        type: 'image/jp2',
        title: 'Water vapour (WVP)',
        'proj:shape': [5490, 5490],
        'proj:transform': [20, 0, 499980, 0, -20, 4200000],
        'raster:bands': [
          {
            nodata: 0,
            data_type: 'uint16',
            bits_per_sample: 15,
            spatial_resolution: 20,
            unit: 'cm',
            scale: 0.001,
            offset: 0
          }
        ],
        roles: ['data', 'reflectance']
      }
    },
    bbox: [
      -80.9740087373394, 36.951488600423914, -79.75065723902863,
      37.947173482649525
    ],
    stac_extensions: [
      'https://stac-extensions.github.io/eo/v1.1.0/schema.json',
      'https://stac-extensions.github.io/projection/v1.1.0/schema.json',
      'https://stac-extensions.github.io/view/v1.0.0/schema.json',
      'https://stac-extensions.github.io/raster/v1.1.0/schema.json',
      'https://stac-extensions.github.io/grid/v1.0.0/schema.json',
      'https://stac-extensions.github.io/processing/v1.1.0/schema.json',
      'https://stac-extensions.github.io/mgrs/v1.0.0/schema.json'
    ],
    collection: 'sentinel-2-l2a'
  },
  {
    type: 'Feature',
    stac_version: '1.0.0',
    id: 'S2B_17SPB_20230801_0_L2A',
    properties: {
      created: '2023-08-02T01:08:07.614Z',
      platform: 'sentinel-2b',
      constellation: 'sentinel-2',
      instruments: ['msi'],
      'eo:cloud_cover': 11.16913,
      'proj:epsg': 32617,
      'mgrs:utm_zone': 17,
      'mgrs:latitude_band': 'S',
      'mgrs:grid_square': 'PB',
      'grid:code': 'MGRS-17SPB',
      'view:sun_azimuth': 136.848144697532,
      'view:sun_elevation': 65.15819711905411,
      's2:degraded_msi_data_percentage': 0.0114,
      's2:nodata_pixel_percentage': 0,
      's2:saturated_defective_pixel_percentage': 0,
      's2:dark_features_percentage': 0.063822,
      's2:cloud_shadow_percentage': 2.876593,
      's2:vegetation_percentage': 80.563104,
      's2:not_vegetated_percentage': 2.370032,
      's2:water_percentage': 0.658458,
      's2:unclassified_percentage': 2.298864,
      's2:medium_proba_clouds_percentage': 3.897442,
      's2:high_proba_clouds_percentage': 2.817124,
      's2:thin_cirrus_percentage': 4.454564,
      's2:snow_ice_percentage': 0,
      's2:product_type': 'S2MSI2A',
      's2:processing_baseline': '05.09',
      's2:product_uri':
        'S2B_MSIL2A_20230801T155829_N0509_R097_T17SPB_20230801T204743.SAFE',
      's2:generation_time': '2023-08-01T20:47:43.000000Z',
      's2:datatake_id': 'GS2B_20230801T155829_033442_N05.09',
      's2:datatake_type': 'INS-NOBS',
      's2:datastrip_id':
        'S2B_OPER_MSI_L2A_DS_2BPS_20230801T204743_S20230801T160859_N05.09',
      's2:granule_id':
        'S2B_OPER_MSI_L2A_TL_2BPS_20230801T204743_A033442_T17SPB_N05.09',
      's2:reflectance_conversion_factor': 0.969933433227093,
      datetime: '2023-08-01T16:13:02.231000Z',
      's2:sequence': '0',
      'earthsearch:s3_path':
        's3://sentinel-cogs/sentinel-s2-l2a-cogs/17/S/PB/2023/8/S2B_17SPB_20230801_0_L2A',
      'earthsearch:payload_id':
        'roda-sentinel2/workflow-sentinel2-to-stac/f61ec783e50eef91e8c1b5f637818e73',
      'earthsearch:boa_offset_applied': true,
      'processing:software': {
        'sentinel2-to-stac': '0.1.1'
      },
      updated: '2023-08-02T01:08:07.614Z'
    },
    geometry: {
      type: 'Polygon',
      coordinates: [
        [
          [-79.86191482838464, 37.94207619848921],
          [-79.87680832296512, 36.95257802860544],
          [-78.64427857302955, 36.93451998232696],
          [-78.61306950183968, 37.92336472056608],
          [-79.86191482838464, 37.94207619848921]
        ]
      ]
    },
    links: [
      {
        rel: 'self',
        type: 'application/geo+json',
        href: 'https://earth-search.aws.element84.com/v1/collections/sentinel-2-l2a/items/S2B_17SPB_20230801_0_L2A'
      },
      {
        rel: 'canonical',
        href: 's3://sentinel-cogs/sentinel-s2-l2a-cogs/17/S/PB/2023/8/S2B_17SPB_20230801_0_L2A/S2B_17SPB_20230801_0_L2A.json',
        type: 'application/json'
      },
      {
        rel: 'license',
        href: 'https://sentinel.esa.int/documents/247904/690755/Sentinel_Data_Legal_Notice'
      },
      {
        rel: 'derived_from',
        href: 'https://earth-search.aws.element84.com/v1/collections/sentinel-2-l1c/items/S2B_17SPB_20230801_0_L1C',
        type: 'application/geo+json'
      },
      {
        rel: 'parent',
        type: 'application/json',
        href: 'https://earth-search.aws.element84.com/v1/collections/sentinel-2-l2a'
      },
      {
        rel: 'collection',
        type: 'application/json',
        href: 'https://earth-search.aws.element84.com/v1/collections/sentinel-2-l2a'
      },
      {
        rel: 'root',
        type: 'application/json',
        href: 'https://earth-search.aws.element84.com/v1'
      },
      {
        rel: 'thumbnail',
        href: 'https://earth-search.aws.element84.com/v1/collections/sentinel-2-l2a/items/S2B_17SPB_20230801_0_L2A/thumbnail'
      }
    ],
    assets: {
      aot: {
        href: 'https://sentinel-cogs.s3.us-west-2.amazonaws.com/sentinel-s2-l2a-cogs/17/S/PB/2023/8/S2B_17SPB_20230801_0_L2A/AOT.tif',
        type: 'image/tiff; application=geotiff; profile=cloud-optimized',
        title: 'Aerosol optical thickness (AOT)',
        'proj:shape': [5490, 5490],
        'proj:transform': [20, 0, 600000, 0, -20, 4200000],
        'raster:bands': [
          {
            nodata: 0,
            data_type: 'uint16',
            bits_per_sample: 15,
            spatial_resolution: 20,
            scale: 0.001,
            offset: 0
          }
        ],
        roles: ['data', 'reflectance']
      },
      blue: {
        href: 'https://sentinel-cogs.s3.us-west-2.amazonaws.com/sentinel-s2-l2a-cogs/17/S/PB/2023/8/S2B_17SPB_20230801_0_L2A/B02.tif',
        type: 'image/tiff; application=geotiff; profile=cloud-optimized',
        title: 'Blue (band 2) - 10m',
        'eo:bands': [
          {
            name: 'blue',
            common_name: 'blue',
            description: 'Blue (band 2)',
            center_wavelength: 0.49,
            full_width_half_max: 0.098
          }
        ],
        gsd: 10,
        'proj:shape': [10980, 10980],
        'proj:transform': [10, 0, 600000, 0, -10, 4200000],
        'raster:bands': [
          {
            nodata: 0,
            data_type: 'uint16',
            bits_per_sample: 15,
            spatial_resolution: 10,
            scale: 0.0001,
            offset: -0.1
          }
        ],
        roles: ['data', 'reflectance']
      },
      coastal: {
        href: 'https://sentinel-cogs.s3.us-west-2.amazonaws.com/sentinel-s2-l2a-cogs/17/S/PB/2023/8/S2B_17SPB_20230801_0_L2A/B01.tif',
        type: 'image/tiff; application=geotiff; profile=cloud-optimized',
        title: 'Coastal aerosol (band 1) - 60m',
        'eo:bands': [
          {
            name: 'coastal',
            common_name: 'coastal',
            description: 'Coastal aerosol (band 1)',
            center_wavelength: 0.443,
            full_width_half_max: 0.027
          }
        ],
        gsd: 60,
        'proj:shape': [1830, 1830],
        'proj:transform': [60, 0, 600000, 0, -60, 4200000],
        'raster:bands': [
          {
            nodata: 0,
            data_type: 'uint16',
            bits_per_sample: 15,
            spatial_resolution: 60,
            scale: 0.0001,
            offset: -0.1
          }
        ],
        roles: ['data', 'reflectance']
      },
      granule_metadata: {
        href: 'https://sentinel-cogs.s3.us-west-2.amazonaws.com/sentinel-s2-l2a-cogs/17/S/PB/2023/8/S2B_17SPB_20230801_0_L2A/granule_metadata.xml',
        type: 'application/xml',
        roles: ['metadata']
      },
      green: {
        href: 'https://sentinel-cogs.s3.us-west-2.amazonaws.com/sentinel-s2-l2a-cogs/17/S/PB/2023/8/S2B_17SPB_20230801_0_L2A/B03.tif',
        type: 'image/tiff; application=geotiff; profile=cloud-optimized',
        title: 'Green (band 3) - 10m',
        'eo:bands': [
          {
            name: 'green',
            common_name: 'green',
            description: 'Green (band 3)',
            center_wavelength: 0.56,
            full_width_half_max: 0.045
          }
        ],
        gsd: 10,
        'proj:shape': [10980, 10980],
        'proj:transform': [10, 0, 600000, 0, -10, 4200000],
        'raster:bands': [
          {
            nodata: 0,
            data_type: 'uint16',
            bits_per_sample: 15,
            spatial_resolution: 10,
            scale: 0.0001,
            offset: -0.1
          }
        ],
        roles: ['data', 'reflectance']
      },
      nir: {
        href: 'https://sentinel-cogs.s3.us-west-2.amazonaws.com/sentinel-s2-l2a-cogs/17/S/PB/2023/8/S2B_17SPB_20230801_0_L2A/B08.tif',
        type: 'image/tiff; application=geotiff; profile=cloud-optimized',
        title: 'NIR 1 (band 8) - 10m',
        'eo:bands': [
          {
            name: 'nir',
            common_name: 'nir',
            description: 'NIR 1 (band 8)',
            center_wavelength: 0.842,
            full_width_half_max: 0.145
          }
        ],
        gsd: 10,
        'proj:shape': [10980, 10980],
        'proj:transform': [10, 0, 600000, 0, -10, 4200000],
        'raster:bands': [
          {
            nodata: 0,
            data_type: 'uint16',
            bits_per_sample: 15,
            spatial_resolution: 10,
            scale: 0.0001,
            offset: -0.1
          }
        ],
        roles: ['data', 'reflectance']
      },
      nir08: {
        href: 'https://sentinel-cogs.s3.us-west-2.amazonaws.com/sentinel-s2-l2a-cogs/17/S/PB/2023/8/S2B_17SPB_20230801_0_L2A/B8A.tif',
        type: 'image/tiff; application=geotiff; profile=cloud-optimized',
        title: 'NIR 2 (band 8A) - 20m',
        'eo:bands': [
          {
            name: 'nir08',
            common_name: 'nir08',
            description: 'NIR 2 (band 8A)',
            center_wavelength: 0.865,
            full_width_half_max: 0.033
          }
        ],
        gsd: 20,
        'proj:shape': [5490, 5490],
        'proj:transform': [20, 0, 600000, 0, -20, 4200000],
        'raster:bands': [
          {
            nodata: 0,
            data_type: 'uint16',
            bits_per_sample: 15,
            spatial_resolution: 20,
            scale: 0.0001,
            offset: -0.1
          }
        ],
        roles: ['data', 'reflectance']
      },
      nir09: {
        href: 'https://sentinel-cogs.s3.us-west-2.amazonaws.com/sentinel-s2-l2a-cogs/17/S/PB/2023/8/S2B_17SPB_20230801_0_L2A/B09.tif',
        type: 'image/tiff; application=geotiff; profile=cloud-optimized',
        title: 'NIR 3 (band 9) - 60m',
        'eo:bands': [
          {
            name: 'nir09',
            common_name: 'nir09',
            description: 'NIR 3 (band 9)',
            center_wavelength: 0.945,
            full_width_half_max: 0.026
          }
        ],
        gsd: 60,
        'proj:shape': [1830, 1830],
        'proj:transform': [60, 0, 600000, 0, -60, 4200000],
        'raster:bands': [
          {
            nodata: 0,
            data_type: 'uint16',
            bits_per_sample: 15,
            spatial_resolution: 60,
            scale: 0.0001,
            offset: -0.1
          }
        ],
        roles: ['data', 'reflectance']
      },
      red: {
        href: 'https://sentinel-cogs.s3.us-west-2.amazonaws.com/sentinel-s2-l2a-cogs/17/S/PB/2023/8/S2B_17SPB_20230801_0_L2A/B04.tif',
        type: 'image/tiff; application=geotiff; profile=cloud-optimized',
        title: 'Red (band 4) - 10m',
        'eo:bands': [
          {
            name: 'red',
            common_name: 'red',
            description: 'Red (band 4)',
            center_wavelength: 0.665,
            full_width_half_max: 0.038
          }
        ],
        gsd: 10,
        'proj:shape': [10980, 10980],
        'proj:transform': [10, 0, 600000, 0, -10, 4200000],
        'raster:bands': [
          {
            nodata: 0,
            data_type: 'uint16',
            bits_per_sample: 15,
            spatial_resolution: 10,
            scale: 0.0001,
            offset: -0.1
          }
        ],
        roles: ['data', 'reflectance']
      },
      rededge1: {
        href: 'https://sentinel-cogs.s3.us-west-2.amazonaws.com/sentinel-s2-l2a-cogs/17/S/PB/2023/8/S2B_17SPB_20230801_0_L2A/B05.tif',
        type: 'image/tiff; application=geotiff; profile=cloud-optimized',
        title: 'Red edge 1 (band 5) - 20m',
        'eo:bands': [
          {
            name: 'rededge1',
            common_name: 'rededge',
            description: 'Red edge 1 (band 5)',
            center_wavelength: 0.704,
            full_width_half_max: 0.019
          }
        ],
        gsd: 20,
        'proj:shape': [5490, 5490],
        'proj:transform': [20, 0, 600000, 0, -20, 4200000],
        'raster:bands': [
          {
            nodata: 0,
            data_type: 'uint16',
            bits_per_sample: 15,
            spatial_resolution: 20,
            scale: 0.0001,
            offset: -0.1
          }
        ],
        roles: ['data', 'reflectance']
      },
      rededge2: {
        href: 'https://sentinel-cogs.s3.us-west-2.amazonaws.com/sentinel-s2-l2a-cogs/17/S/PB/2023/8/S2B_17SPB_20230801_0_L2A/B06.tif',
        type: 'image/tiff; application=geotiff; profile=cloud-optimized',
        title: 'Red edge 2 (band 6) - 20m',
        'eo:bands': [
          {
            name: 'rededge2',
            common_name: 'rededge',
            description: 'Red edge 2 (band 6)',
            center_wavelength: 0.74,
            full_width_half_max: 0.018
          }
        ],
        gsd: 20,
        'proj:shape': [5490, 5490],
        'proj:transform': [20, 0, 600000, 0, -20, 4200000],
        'raster:bands': [
          {
            nodata: 0,
            data_type: 'uint16',
            bits_per_sample: 15,
            spatial_resolution: 20,
            scale: 0.0001,
            offset: -0.1
          }
        ],
        roles: ['data', 'reflectance']
      },
      rededge3: {
        href: 'https://sentinel-cogs.s3.us-west-2.amazonaws.com/sentinel-s2-l2a-cogs/17/S/PB/2023/8/S2B_17SPB_20230801_0_L2A/B07.tif',
        type: 'image/tiff; application=geotiff; profile=cloud-optimized',
        title: 'Red edge 3 (band 7) - 20m',
        'eo:bands': [
          {
            name: 'rededge3',
            common_name: 'rededge',
            description: 'Red edge 3 (band 7)',
            center_wavelength: 0.783,
            full_width_half_max: 0.028
          }
        ],
        gsd: 20,
        'proj:shape': [5490, 5490],
        'proj:transform': [20, 0, 600000, 0, -20, 4200000],
        'raster:bands': [
          {
            nodata: 0,
            data_type: 'uint16',
            bits_per_sample: 15,
            spatial_resolution: 20,
            scale: 0.0001,
            offset: -0.1
          }
        ],
        roles: ['data', 'reflectance']
      },
      scl: {
        href: 'https://sentinel-cogs.s3.us-west-2.amazonaws.com/sentinel-s2-l2a-cogs/17/S/PB/2023/8/S2B_17SPB_20230801_0_L2A/SCL.tif',
        type: 'image/tiff; application=geotiff; profile=cloud-optimized',
        title: 'Scene classification map (SCL)',
        'proj:shape': [5490, 5490],
        'proj:transform': [20, 0, 600000, 0, -20, 4200000],
        'raster:bands': [
          {
            nodata: 0,
            data_type: 'uint8',
            spatial_resolution: 20
          }
        ],
        roles: ['data', 'reflectance']
      },
      swir16: {
        href: 'https://sentinel-cogs.s3.us-west-2.amazonaws.com/sentinel-s2-l2a-cogs/17/S/PB/2023/8/S2B_17SPB_20230801_0_L2A/B11.tif',
        type: 'image/tiff; application=geotiff; profile=cloud-optimized',
        title: 'SWIR 1 (band 11) - 20m',
        'eo:bands': [
          {
            name: 'swir16',
            common_name: 'swir16',
            description: 'SWIR 1 (band 11)',
            center_wavelength: 1.61,
            full_width_half_max: 0.143
          }
        ],
        gsd: 20,
        'proj:shape': [5490, 5490],
        'proj:transform': [20, 0, 600000, 0, -20, 4200000],
        'raster:bands': [
          {
            nodata: 0,
            data_type: 'uint16',
            bits_per_sample: 15,
            spatial_resolution: 20,
            scale: 0.0001,
            offset: -0.1
          }
        ],
        roles: ['data', 'reflectance']
      },
      swir22: {
        href: 'https://sentinel-cogs.s3.us-west-2.amazonaws.com/sentinel-s2-l2a-cogs/17/S/PB/2023/8/S2B_17SPB_20230801_0_L2A/B12.tif',
        type: 'image/tiff; application=geotiff; profile=cloud-optimized',
        title: 'SWIR 2 (band 12) - 20m',
        'eo:bands': [
          {
            name: 'swir22',
            common_name: 'swir22',
            description: 'SWIR 2 (band 12)',
            center_wavelength: 2.19,
            full_width_half_max: 0.242
          }
        ],
        gsd: 20,
        'proj:shape': [5490, 5490],
        'proj:transform': [20, 0, 600000, 0, -20, 4200000],
        'raster:bands': [
          {
            nodata: 0,
            data_type: 'uint16',
            bits_per_sample: 15,
            spatial_resolution: 20,
            scale: 0.0001,
            offset: -0.1
          }
        ],
        roles: ['data', 'reflectance']
      },
      thumbnail: {
        href: 'https://sentinel-cogs.s3.us-west-2.amazonaws.com/sentinel-s2-l2a-cogs/17/S/PB/2023/8/S2B_17SPB_20230801_0_L2A/thumbnail.jpg',
        type: 'image/jpeg',
        title: 'Thumbnail image',
        roles: ['thumbnail']
      },
      tileinfo_metadata: {
        href: 'https://sentinel-cogs.s3.us-west-2.amazonaws.com/sentinel-s2-l2a-cogs/17/S/PB/2023/8/S2B_17SPB_20230801_0_L2A/tileinfo_metadata.json',
        type: 'application/json',
        roles: ['metadata']
      },
      visual: {
        href: 'https://sentinel-cogs.s3.us-west-2.amazonaws.com/sentinel-s2-l2a-cogs/17/S/PB/2023/8/S2B_17SPB_20230801_0_L2A/TCI.tif',
        type: 'image/tiff; application=geotiff; profile=cloud-optimized',
        title: 'True color image',
        'eo:bands': [
          {
            name: 'red',
            common_name: 'red',
            description: 'Red (band 4)',
            center_wavelength: 0.665,
            full_width_half_max: 0.038
          },
          {
            name: 'green',
            common_name: 'green',
            description: 'Green (band 3)',
            center_wavelength: 0.56,
            full_width_half_max: 0.045
          },
          {
            name: 'blue',
            common_name: 'blue',
            description: 'Blue (band 2)',
            center_wavelength: 0.49,
            full_width_half_max: 0.098
          }
        ],
        'proj:shape': [10980, 10980],
        'proj:transform': [10, 0, 600000, 0, -10, 4200000],
        roles: ['visual']
      },
      wvp: {
        href: 'https://sentinel-cogs.s3.us-west-2.amazonaws.com/sentinel-s2-l2a-cogs/17/S/PB/2023/8/S2B_17SPB_20230801_0_L2A/WVP.tif',
        type: 'image/tiff; application=geotiff; profile=cloud-optimized',
        title: 'Water vapour (WVP)',
        'proj:shape': [5490, 5490],
        'proj:transform': [20, 0, 600000, 0, -20, 4200000],
        'raster:bands': [
          {
            nodata: 0,
            data_type: 'uint16',
            bits_per_sample: 15,
            spatial_resolution: 20,
            unit: 'cm',
            scale: 0.001,
            offset: 0
          }
        ],
        roles: ['data', 'reflectance']
      },
      'aot-jp2': {
        href: 's3://sentinel-s2-l2a/tiles/17/S/PB/2023/8/1/0/AOT.jp2',
        type: 'image/jp2',
        title: 'Aerosol optical thickness (AOT)',
        'proj:shape': [5490, 5490],
        'proj:transform': [20, 0, 600000, 0, -20, 4200000],
        'raster:bands': [
          {
            nodata: 0,
            data_type: 'uint16',
            bits_per_sample: 15,
            spatial_resolution: 20,
            scale: 0.001,
            offset: 0
          }
        ],
        roles: ['data', 'reflectance']
      },
      'blue-jp2': {
        href: 's3://sentinel-s2-l2a/tiles/17/S/PB/2023/8/1/0/B02.jp2',
        type: 'image/jp2',
        title: 'Blue (band 2) - 10m',
        'eo:bands': [
          {
            name: 'blue',
            common_name: 'blue',
            description: 'Blue (band 2)',
            center_wavelength: 0.49,
            full_width_half_max: 0.098
          }
        ],
        gsd: 10,
        'proj:shape': [10980, 10980],
        'proj:transform': [10, 0, 600000, 0, -10, 4200000],
        'raster:bands': [
          {
            nodata: 0,
            data_type: 'uint16',
            bits_per_sample: 15,
            spatial_resolution: 10,
            scale: 0.0001,
            offset: -0.1
          }
        ],
        roles: ['data', 'reflectance']
      },
      'coastal-jp2': {
        href: 's3://sentinel-s2-l2a/tiles/17/S/PB/2023/8/1/0/B01.jp2',
        type: 'image/jp2',
        title: 'Coastal aerosol (band 1) - 60m',
        'eo:bands': [
          {
            name: 'coastal',
            common_name: 'coastal',
            description: 'Coastal aerosol (band 1)',
            center_wavelength: 0.443,
            full_width_half_max: 0.027
          }
        ],
        gsd: 60,
        'proj:shape': [1830, 1830],
        'proj:transform': [60, 0, 600000, 0, -60, 4200000],
        'raster:bands': [
          {
            nodata: 0,
            data_type: 'uint16',
            bits_per_sample: 15,
            spatial_resolution: 60,
            scale: 0.0001,
            offset: -0.1
          }
        ],
        roles: ['data', 'reflectance']
      },
      'green-jp2': {
        href: 's3://sentinel-s2-l2a/tiles/17/S/PB/2023/8/1/0/B03.jp2',
        type: 'image/jp2',
        title: 'Green (band 3) - 10m',
        'eo:bands': [
          {
            name: 'green',
            common_name: 'green',
            description: 'Green (band 3)',
            center_wavelength: 0.56,
            full_width_half_max: 0.045
          }
        ],
        gsd: 10,
        'proj:shape': [10980, 10980],
        'proj:transform': [10, 0, 600000, 0, -10, 4200000],
        'raster:bands': [
          {
            nodata: 0,
            data_type: 'uint16',
            bits_per_sample: 15,
            spatial_resolution: 10,
            scale: 0.0001,
            offset: -0.1
          }
        ],
        roles: ['data', 'reflectance']
      },
      'nir-jp2': {
        href: 's3://sentinel-s2-l2a/tiles/17/S/PB/2023/8/1/0/B08.jp2',
        type: 'image/jp2',
        title: 'NIR 1 (band 8) - 10m',
        'eo:bands': [
          {
            name: 'nir',
            common_name: 'nir',
            description: 'NIR 1 (band 8)',
            center_wavelength: 0.842,
            full_width_half_max: 0.145
          }
        ],
        gsd: 10,
        'proj:shape': [10980, 10980],
        'proj:transform': [10, 0, 600000, 0, -10, 4200000],
        'raster:bands': [
          {
            nodata: 0,
            data_type: 'uint16',
            bits_per_sample: 15,
            spatial_resolution: 10,
            scale: 0.0001,
            offset: -0.1
          }
        ],
        roles: ['data', 'reflectance']
      },
      'nir08-jp2': {
        href: 's3://sentinel-s2-l2a/tiles/17/S/PB/2023/8/1/0/B8A.jp2',
        type: 'image/jp2',
        title: 'NIR 2 (band 8A) - 20m',
        'eo:bands': [
          {
            name: 'nir08',
            common_name: 'nir08',
            description: 'NIR 2 (band 8A)',
            center_wavelength: 0.865,
            full_width_half_max: 0.033
          }
        ],
        gsd: 20,
        'proj:shape': [5490, 5490],
        'proj:transform': [20, 0, 600000, 0, -20, 4200000],
        'raster:bands': [
          {
            nodata: 0,
            data_type: 'uint16',
            bits_per_sample: 15,
            spatial_resolution: 20,
            scale: 0.0001,
            offset: -0.1
          }
        ],
        roles: ['data', 'reflectance']
      },
      'nir09-jp2': {
        href: 's3://sentinel-s2-l2a/tiles/17/S/PB/2023/8/1/0/B09.jp2',
        type: 'image/jp2',
        title: 'NIR 3 (band 9) - 60m',
        'eo:bands': [
          {
            name: 'nir09',
            common_name: 'nir09',
            description: 'NIR 3 (band 9)',
            center_wavelength: 0.945,
            full_width_half_max: 0.026
          }
        ],
        gsd: 60,
        'proj:shape': [1830, 1830],
        'proj:transform': [60, 0, 600000, 0, -60, 4200000],
        'raster:bands': [
          {
            nodata: 0,
            data_type: 'uint16',
            bits_per_sample: 15,
            spatial_resolution: 60,
            scale: 0.0001,
            offset: -0.1
          }
        ],
        roles: ['data', 'reflectance']
      },
      'red-jp2': {
        href: 's3://sentinel-s2-l2a/tiles/17/S/PB/2023/8/1/0/B04.jp2',
        type: 'image/jp2',
        title: 'Red (band 4) - 10m',
        'eo:bands': [
          {
            name: 'red',
            common_name: 'red',
            description: 'Red (band 4)',
            center_wavelength: 0.665,
            full_width_half_max: 0.038
          }
        ],
        gsd: 10,
        'proj:shape': [10980, 10980],
        'proj:transform': [10, 0, 600000, 0, -10, 4200000],
        'raster:bands': [
          {
            nodata: 0,
            data_type: 'uint16',
            bits_per_sample: 15,
            spatial_resolution: 10,
            scale: 0.0001,
            offset: -0.1
          }
        ],
        roles: ['data', 'reflectance']
      },
      'rededge1-jp2': {
        href: 's3://sentinel-s2-l2a/tiles/17/S/PB/2023/8/1/0/B05.jp2',
        type: 'image/jp2',
        title: 'Red edge 1 (band 5) - 20m',
        'eo:bands': [
          {
            name: 'rededge1',
            common_name: 'rededge',
            description: 'Red edge 1 (band 5)',
            center_wavelength: 0.704,
            full_width_half_max: 0.019
          }
        ],
        gsd: 20,
        'proj:shape': [5490, 5490],
        'proj:transform': [20, 0, 600000, 0, -20, 4200000],
        'raster:bands': [
          {
            nodata: 0,
            data_type: 'uint16',
            bits_per_sample: 15,
            spatial_resolution: 20,
            scale: 0.0001,
            offset: -0.1
          }
        ],
        roles: ['data', 'reflectance']
      },
      'rededge2-jp2': {
        href: 's3://sentinel-s2-l2a/tiles/17/S/PB/2023/8/1/0/B06.jp2',
        type: 'image/jp2',
        title: 'Red edge 2 (band 6) - 20m',
        'eo:bands': [
          {
            name: 'rededge2',
            common_name: 'rededge',
            description: 'Red edge 2 (band 6)',
            center_wavelength: 0.74,
            full_width_half_max: 0.018
          }
        ],
        gsd: 20,
        'proj:shape': [5490, 5490],
        'proj:transform': [20, 0, 600000, 0, -20, 4200000],
        'raster:bands': [
          {
            nodata: 0,
            data_type: 'uint16',
            bits_per_sample: 15,
            spatial_resolution: 20,
            scale: 0.0001,
            offset: -0.1
          }
        ],
        roles: ['data', 'reflectance']
      },
      'rededge3-jp2': {
        href: 's3://sentinel-s2-l2a/tiles/17/S/PB/2023/8/1/0/B07.jp2',
        type: 'image/jp2',
        title: 'Red edge 3 (band 7) - 20m',
        'eo:bands': [
          {
            name: 'rededge3',
            common_name: 'rededge',
            description: 'Red edge 3 (band 7)',
            center_wavelength: 0.783,
            full_width_half_max: 0.028
          }
        ],
        gsd: 20,
        'proj:shape': [5490, 5490],
        'proj:transform': [20, 0, 600000, 0, -20, 4200000],
        'raster:bands': [
          {
            nodata: 0,
            data_type: 'uint16',
            bits_per_sample: 15,
            spatial_resolution: 20,
            scale: 0.0001,
            offset: -0.1
          }
        ],
        roles: ['data', 'reflectance']
      },
      'scl-jp2': {
        href: 's3://sentinel-s2-l2a/tiles/17/S/PB/2023/8/1/0/SCL.jp2',
        type: 'image/jp2',
        title: 'Scene classification map (SCL)',
        'proj:shape': [5490, 5490],
        'proj:transform': [20, 0, 600000, 0, -20, 4200000],
        'raster:bands': [
          {
            nodata: 0,
            data_type: 'uint8',
            spatial_resolution: 20
          }
        ],
        roles: ['data', 'reflectance']
      },
      'swir16-jp2': {
        href: 's3://sentinel-s2-l2a/tiles/17/S/PB/2023/8/1/0/B11.jp2',
        type: 'image/jp2',
        title: 'SWIR 1 (band 11) - 20m',
        'eo:bands': [
          {
            name: 'swir16',
            common_name: 'swir16',
            description: 'SWIR 1 (band 11)',
            center_wavelength: 1.61,
            full_width_half_max: 0.143
          }
        ],
        gsd: 20,
        'proj:shape': [5490, 5490],
        'proj:transform': [20, 0, 600000, 0, -20, 4200000],
        'raster:bands': [
          {
            nodata: 0,
            data_type: 'uint16',
            bits_per_sample: 15,
            spatial_resolution: 20,
            scale: 0.0001,
            offset: -0.1
          }
        ],
        roles: ['data', 'reflectance']
      },
      'swir22-jp2': {
        href: 's3://sentinel-s2-l2a/tiles/17/S/PB/2023/8/1/0/B12.jp2',
        type: 'image/jp2',
        title: 'SWIR 2 (band 12) - 20m',
        'eo:bands': [
          {
            name: 'swir22',
            common_name: 'swir22',
            description: 'SWIR 2 (band 12)',
            center_wavelength: 2.19,
            full_width_half_max: 0.242
          }
        ],
        gsd: 20,
        'proj:shape': [5490, 5490],
        'proj:transform': [20, 0, 600000, 0, -20, 4200000],
        'raster:bands': [
          {
            nodata: 0,
            data_type: 'uint16',
            bits_per_sample: 15,
            spatial_resolution: 20,
            scale: 0.0001,
            offset: -0.1
          }
        ],
        roles: ['data', 'reflectance']
      },
      'visual-jp2': {
        href: 's3://sentinel-s2-l2a/tiles/17/S/PB/2023/8/1/0/TCI.jp2',
        type: 'image/jp2',
        title: 'True color image',
        'eo:bands': [
          {
            name: 'red',
            common_name: 'red',
            description: 'Red (band 4)',
            center_wavelength: 0.665,
            full_width_half_max: 0.038
          },
          {
            name: 'green',
            common_name: 'green',
            description: 'Green (band 3)',
            center_wavelength: 0.56,
            full_width_half_max: 0.045
          },
          {
            name: 'blue',
            common_name: 'blue',
            description: 'Blue (band 2)',
            center_wavelength: 0.49,
            full_width_half_max: 0.098
          }
        ],
        'proj:shape': [10980, 10980],
        'proj:transform': [10, 0, 600000, 0, -10, 4200000],
        roles: ['visual']
      },
      'wvp-jp2': {
        href: 's3://sentinel-s2-l2a/tiles/17/S/PB/2023/8/1/0/WVP.jp2',
        type: 'image/jp2',
        title: 'Water vapour (WVP)',
        'proj:shape': [5490, 5490],
        'proj:transform': [20, 0, 600000, 0, -20, 4200000],
        'raster:bands': [
          {
            nodata: 0,
            data_type: 'uint16',
            bits_per_sample: 15,
            spatial_resolution: 20,
            unit: 'cm',
            scale: 0.001,
            offset: 0
          }
        ],
        roles: ['data', 'reflectance']
      }
    },
    bbox: [
      -79.87680832296512, 36.93451998232696, -78.61306950183968,
      37.94207619848921
    ],
    stac_extensions: [
      'https://stac-extensions.github.io/mgrs/v1.0.0/schema.json',
      'https://stac-extensions.github.io/processing/v1.1.0/schema.json',
      'https://stac-extensions.github.io/grid/v1.0.0/schema.json',
      'https://stac-extensions.github.io/raster/v1.1.0/schema.json',
      'https://stac-extensions.github.io/view/v1.0.0/schema.json',
      'https://stac-extensions.github.io/projection/v1.1.0/schema.json',
      'https://stac-extensions.github.io/eo/v1.1.0/schema.json'
    ],
    collection: 'sentinel-2-l2a'
  }
]
