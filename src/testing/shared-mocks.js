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
