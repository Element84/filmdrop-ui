# FilmDrop UI Configuration Guide

Complete reference for configuring FilmDrop UI.

## Config Format Requirement

FilmDrop UI requires the modern config format at runtime. Legacy keys are not auto-migrated during app startup.

- Run `npm run config:lint -- public/config/config.json` to validate format
- Run `npm run config:migrate -- --input public/config/config.json --output public/config/config.json.migrated` to migrate legacy configs
- Replace your config with the migrated file before starting the app

---

## Table of Contents

- [Overview](#overview)
- [Configuration File Location](#configuration-file-location)
- [Configuration Parameters](#configuration-parameters)
  - [Required Parameters](#required-parameters)
  - [Optional Parameters](#optional-parameters)
  - [Legacy Parameters](#legacy-parameters)
- [Configuration Parameter Details](#configuration-parameter-details)
  - [BRAND_LOGO](#brand_logo)
  - [STAC Links](#stac-links)
  - [THEME_SWITCHING_ENABLED](#theme_switching_enabled)
  - [STAC_HEADER_COOKIES](#stac_header_cookies)
  - [BASEMAP](#basemap)
  - [TILER_SETTINGS](#tiler_settings)
  - [LAYER_LIST_SERVICES](#layer_list_services)
  - [COLLECTIONS](#collections)
- [COLLECTIONS_CONFIG](#collections_config-parameter-details)
  - [visualizations](#visualizations)
  - [mosaicTilerParams](#mosaictilerparams)
  - [queryableFilters](#queryablefilters)
  - [enhancedDisplayConfig](#enhanceddisplayconfig)
- [Minimal Configuration](#minimal-configuration)
- [Migration Guide](#migration-guide)
  - [Migration Overview](#migration-overview)
- [Troubleshooting](#troubleshooting)
- [Additional Resources](#additional-resources)

## Overview

FilmDrop UI uses a "build-once, deploy-anywhere" approach with configuration variables.
The config is read on application load by fetching `/config/config.json` with a
cache-breaker to prevent stale files.

**Key Features:**

- JSON-based configuration
- Runtime loading (no rebuild needed for config changes)
- Modern `COLLECTIONS_CONFIG`-based schema
- CLI-based migration and lint tooling

## Configuration File Location

**Development:** Create `./public/config/config.json` with your configuration.

**Production:** After building with `npm run build`, place your config at
`build/config/config.json`.

**Example files:**

- `config_helper/config.example.json` - Legacy format example with comprehensive options
- `config_helper/config-new-format-example.json` - Modern format with `COLLECTIONS_CONFIG`

## Configuration Parameters

### Required Parameters

| Parameter      | Type   | Description                   |
| -------------- | ------ | ----------------------------- |
| `STAC_API_URL` | String | URL for the STAC API endpoint |

### Optional Parameters

#### Application Branding

| Parameter     | Type   | Default         | Description                                                              |
| ------------- | ------ | --------------- | ------------------------------------------------------------------------ |
| `APP_NAME`    | String | `"FilmDrop UI"` | Application name used in HTML title and UI                               |
| `APP_FAVICON` | String | -               | Custom favicon filename (`.ico` or `.png`) placed in `/config` directory |
| `LOGO_URL`    | String | -               | Absolute path to custom logo image (e.g., `/logo.png`)                   |
| `LOGO_ALT`    | String | -               | Alt text for custom logo                                                 |
| `PUBLIC_URL`  | String | -               | Public URL for the application (useful with CDNs)                        |
| `BRAND_LOGO`  | Object | -               | Brand logo with clickable hyperlink. See [BRAND_LOGO](#brand_logo)       |

#### UI Features

| Parameter                    | Type    | Default  | Description                                                                                |
| ---------------------------- | ------- | -------- | ------------------------------------------------------------------------------------------ |
| `CART_ENABLED`               | Boolean | `false`  | Enable shopping cart features for scene selection                                          |
| `EXPORT_ENABLED`             | Boolean | `true`   | Enable GeoJSON export of search results                                                    |
| `RIGHT_SIDEBAR_ENABLED`      | Boolean | `false`  | Anchor the sidebar panel on the right                                                      |
| `STAC_LINK_ENABLED`          | Boolean | `true`   | Show STAC API Item link in Links section. See [STAC Links](#stac-links)                    |
| `STAC_LINKS_SECTION_ENABLED` | Boolean | `true`   | Show comprehensive Links section (grouped by rel type). See [STAC Links](#stac-links)      |
| `STAC_LINKS_EXCLUDE_LIST`    | Array   | See note | Link rel types to hide from Links section. See [STAC Links](#stac-links)                   |
| `SHOW_ITEM_AUTO_ZOOM`        | Boolean | `true`   | Show toggle to auto-center map on selected item                                            |
| `THEME_SWITCHING_ENABLED`    | Boolean | `true`   | Enable light/dark theme switching. See [THEME_SWITCHING_ENABLED](#theme_switching_enabled) |

> NOTE: `SEARCH_BY_GEOM_ENABLED` is no longer configurable and is always enabled.

#### Navigation Buttons

| Parameter           | Type   | Description                                                    |
| ------------------- | ------ | -------------------------------------------------------------- |
| `DASHBOARD_BTN_URL` | String | URL for Dashboard button (top right). Button hidden if not set |
| `ANALYZE_BTN_URL`   | String | URL for Analyze button (bottom left). Button hidden if not set |
| `ACTION_BUTTON`     | Object | Call-to-action button with `text` and `url` properties         |

#### API Configuration

| Parameter               | Type    | Default         | Description                                                                                      |
| ----------------------- | ------- | --------------- | ------------------------------------------------------------------------------------------------ |
| `API_MAX_ITEMS`         | Number  | `200`           | Maximum items requested from STAC API                                                            |
| `FETCH_CREDENTIALS`     | String  | `"same-origin"` | Fetch credentials mode: `"same-origin"`, `"include"`, or `"omit"`                                |
| `STAC_HEADER_COOKIES`   | Array   | -               | Cookie-to-header mappings for STAC API requests. See [STAC_HEADER_COOKIES](#stac_header_cookies) |
| `SUPPORTS_AGGREGATIONS` | Boolean | `true`          | Enable aggregation features (requires STAC API Aggregation Extension)                            |

#### Authentication

| Parameter                | Type    | Description                           |
| ------------------------ | ------- | ------------------------------------- |
| `APP_TOKEN_AUTH_ENABLED` | Boolean | Enable JWT token authentication       |
| `AUTH_URL`               | String  | Authentication endpoint returning JWT |

> **Security Note:** Client-side authentication provides limited security. Ensure STAC API also validates tokens.

#### Map Configuration

| Parameter         | Type   | Default       | Description                                                                                              |
| ----------------- | ------ | ------------- | -------------------------------------------------------------------------------------------------------- |
| `BASEMAP`         | Object | OpenStreetMap | Basemap provider configuration. See [BASEMAP](#basemap)                                                  |
| `MAP_CENTER`      | Array  | `[30, 0]`     | Initial map center `[lat, lon]`                                                                          |
| `MAP_ZOOM`        | Number | `3`           | Initial map zoom level                                                                                   |
| `MAP_ZOOM_MAX`    | Number | `18`          | Maximum map zoom level                                                                                   |
| `CONFIG_COLORMAP` | String | `"viridis"`   | Colormap for hex grid results. See [bpostlethwaite/colormap](https://github.com/bpostlethwaite/colormap) |

#### Tiling Configuration

| Parameter          | Type   | Default | Description                                                                                           |
| ------------------ | ------ | ------- | ----------------------------------------------------------------------------------------------------- |
| `SCENE_TILER_URL`  | String | -       | TiTiler endpoint for scene tiling                                                                     |
| `MOSAIC_TILER_URL` | String | -       | TiTiler mosaic endpoint (requires [NASA IMPACT TiTiler fork](https://github.com/NASA-IMPACT/titiler)) |
| `MOSAIC_MAX_ITEMS` | Number | `100`   | Maximum items in mosaic                                                                               |
| `TILER_SETTINGS`   | Object | -       | TiTiler behavior settings. See [TILER_SETTINGS](#tiler_settings)                                      |

#### Layer and Collection Configuration

| Parameter             | Type   | Description                                                                                            |
| --------------------- | ------ | ------------------------------------------------------------------------------------------------------ |
| `LAYER_LIST_SERVICES` | Array  | WMS service definitions for reference layers. See [LAYER_LIST_SERVICES](#layer_list_services)          |
| `COLLECTIONS`         | Object | Auto-configure collections from STAC API. See [COLLECTIONS](#collections)                              |
| `COLLECTIONS_CONFIG`  | Object | Per-collection settings (visualizations, filters, zoom). See [COLLECTIONS_CONFIG](#collections_config) |

### Legacy Parameters

The following top-level parameters are **legacy** and require migration before runtime.
Use `npm run config:migrate` to convert them to `COLLECTIONS_CONFIG`.

| Deprecated Parameter      | Migrated To                              |
| ------------------------- | ---------------------------------------- |
| `SCENE_TILER_PARAMS`      | `visualizations` (with key `"default"`)  |
| `MOSAIC_TILER_PARAMS`     | `mosaicTilerParams`                      |
| `SEARCH_MIN_ZOOM_LEVELS`  | `sceneMinZoom` (uses the `"high"` value) |
| `TILE_LAYER_PARAMS`       | `tileLayerParams`                        |
| `ENHANCED_DISPLAY_CONFIG` | `enhancedDisplayConfig`                  |

The following parameters have been **removed** and are no longer supported:

- `POPUP_DISPLAY_FIELDS` - Superseded by `enhancedDisplayConfig.property_groups` in `COLLECTIONS_CONFIG`

See [Migration Guide](#migration-guide) for a full before/after example.

## Configuration Parameter Details

### BRAND_LOGO

**Disabled:**

```json
{
  "BRAND_LOGO": null
}
```

**Single Logo:**

```json
{
  "BRAND_LOGO": {
    "url": "https://your-company.com",
    "title": "Visit Your Company",
    "alt": "Your Company Logo",
    "image": "/your-logo.png"
  }
}
```

**Theme-Aware Logo** (requires `THEME_SWITCHING_ENABLED: true`):

```json
{
  "BRAND_LOGO": {
    "url": "https://your-company.com",
    "title": "Visit Your Company",
    "alt": "Your Company Logo",
    "image": null,
    "image_light": "/your-logo-light.png",
    "image_dark": "/your-logo-dark.png"
  }
}
```

> Note: The path to `image`, `image_light`, and `image_dark` should be absolute
> (e.g., `/brand_logo.png`), not relative.

### STAC Links

STAC item links are controlled by three options — two visibility toggles and a filter:

- **`STAC_LINK_ENABLED`** (`true` by default) — Shows the STAC API Item link (the item's canonical `self` link)
- **`STAC_LINKS_SECTION_ENABLED`** (`true` by default) — Shows a comprehensive Links section with all other item links grouped by relationship type
- **`STAC_LINKS_EXCLUDE_LIST`** (array) — Filters which link rel types appear in the Links section

The two toggles are independent—enable either, both, or neither. Links are displayed under a single "Links" header when at least one toggle is enabled.

`STAC_LINKS_EXCLUDE_LIST` controls which link rel types are hidden from the comprehensive Links section. By default, it excludes navigation and API plumbing links:

- **Navigation hierarchy:** `parent`, `collection`, `root` — organizational links not useful in per-item context
- **API endpoints:** `items`, `aggregate`, `aggregations` — programmatic API navigation
- **Technical links:** OGC queryables, conformance, service descriptors — low-level API plumbing

Links shown by default include `canonical` (original JSON), `license` (license
information), `derived_from` (source data), `about` (item information), `alternate`
(alternate formats), and custom links. To show all links (including navigation and API
links), set to an empty array (`[]`).

**Examples:**

Show only STAC API Item link:

```json
{
  "STAC_LINK_ENABLED": true,
  "STAC_LINKS_SECTION_ENABLED": false
}
```

Show only comprehensive Links section:

```json
{
  "STAC_LINK_ENABLED": false,
  "STAC_LINKS_SECTION_ENABLED": true,
  "STAC_LINKS_EXCLUDE_LIST": [
    "parent",
    "collection",
    "root",
    "items",
    "aggregate",
    "aggregations",
    "http://www.opengis.net/def/rel/ogc/1.0/queryables",
    "conformance",
    "service-desc",
    "service-doc",
    "data",
    "thumbnail"
  ]
}
```

Show both STAC API Item and comprehensive Links section:

```json
{
  "STAC_LINK_ENABLED": true,
  "STAC_LINKS_SECTION_ENABLED": true,
  "STAC_LINKS_EXCLUDE_LIST": [
    "parent",
    "collection",
    "root",
    "items",
    "aggregate",
    "aggregations",
    "http://www.opengis.net/def/rel/ogc/1.0/queryables",
    "conformance",
    "service-desc",
    "service-doc",
    "data",
    "thumbnail"
  ]
}
```

Hide all links:

```json
{
  "STAC_LINK_ENABLED": false,
  "STAC_LINKS_SECTION_ENABLED": false
}
```

### THEME_SWITCHING_ENABLED

FilmDrop UI supports two theming modes. The CSS structure in `src/themes/theme.css`
must match the selected mode.

**Theme Switching Mode** (default) — provides light/dark toggle in the UI:

```json
{
  "THEME_SWITCHING_ENABLED": true
}
```

CSS requires two selectors:

- `:root[data-theme='filmdrop-dark']` — Dark theme variables
- `:root[data-theme='filmdrop-light']` — Light theme variables

**Single Theme Mode** — uses one fixed theme with no toggle:

```json
{
  "THEME_SWITCHING_ENABLED": false
}
```

CSS requires one selector:

- `:root[data-theme='filmdrop']` — Single theme variables

### STAC_HEADER_COOKIES

`STAC_HEADER_COOKIES` is an array of objects that map browser cookies to request headers
sent with STAC API requests.

```json
{
  "STAC_HEADER_COOKIES": [
    {
      "cookie_name": "my-jwt",
      "header_name": "Authorization",
      "header_val_prefix": "Bearer "
    }
  ]
}
```

Each object requires `cookie_name` and `header_name`. The optional `header_val_prefix` is
prepended to the cookie value before setting the header.

### BASEMAP

**Default:** If `BASEMAP` is not provided, defaults to OpenStreetMap.

**Single Basemap:**

```json
{
  "BASEMAP": {
    "url": "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
    "attribution": "&copy; <a href=\"https://www.openstreetmap.org/copyright\">OpenStreetMap</a>"
  }
}
```

**Theme-Aware Basemap** (requires `THEME_SWITCHING_ENABLED: true`):

```json
{
  "BASEMAP": {
    "light": {
      "url": "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
      "attribution": "&copy; OpenStreetMap"
    },
    "dark": {
      "url": "https://cartodb-basemaps-{s}.global.ssl.fastly.net/dark_all/{z}/{x}/{y}.png",
      "attribution": "&copy; OpenStreetMap &copy; CartoDB"
    }
  }
}
```

### TILER_SETTINGS

`TILER_SETTINGS.URL_SUBST` enables string substitution in requests to TiTiler. Use this
when TiTiler should access STAC items via a different URL (e.g., private DNS):

```json
{
  "TILER_SETTINGS": {
    "URL_SUBST": true,
    "URL_SUBST_FIND": "my-public-stac-api.com/catalog",
    "URL_SUBST_REPLACE": "private-s2s-dns.com/catalog"
  }
}
```

### LAYER_LIST_SERVICES

A reference layer list widget is automatically enabled when `LAYER_LIST_SERVICES` is
populated.

```json
{
  "LAYER_LIST_SERVICES": [
    {
      "name": "USGS Topography",
      "type": "wms",
      "url": "https://basemap.nationalmap.gov/arcgis/services/USGSTopo/MapServer/WMSServer",
      "layers": [
        {
          "name": "0",
          "alias": "USGS Topo",
          "default_visibility": false,
          "crs": "EPSG:3857"
        }
      ]
    }
  ]
}
```

**Supported CRS:** `EPSG:4326`, `EPSG:3857`

### COLLECTIONS

FilmDrop UI automatically fetches the full list of collections from your STAC API at
startup. The `COLLECTIONS` parameter lets you control which of those collections are
available and which is selected by default.

If `COLLECTIONS` is omitted, all collections from the API are available.

**Properties:**

- `default` (String, optional): Collection ID to select by default. If not provided, the first collection is selected.
- `include` (Array, optional): Only these collections will be available (allowlist).
- `exclude` (Array, optional): These collections will be removed (blocklist).

If both `include` and `exclude` are provided, `include` is applied first, then `exclude`.

**Examples:**

Restrict to specific collections and set a default:

```json
{
  "COLLECTIONS": {
    "default": "sentinel-2-l2a",
    "include": ["sentinel-2-l2a", "landsat-c2-l2", "naip"]
  }
}
```

Show all collections except certain ones:

```json
{
  "COLLECTIONS": {
    "exclude": ["deprecated-collection", "test-data"]
  }
}
```

Set a default without restricting the list:

```json
{
  "COLLECTIONS": {
    "default": "sentinel-2-l2a"
  }
}
```

## COLLECTIONS_CONFIG Parameter Details

The `COLLECTIONS_CONFIG` parameter is covered in its own section because it is the most
complex configuration parameter, with several sub-features that each warrant detailed
documentation.

It consolidates all per-collection settings into a single object keyed by collection ID.
This is the **recommended approach** for configuring collection-specific behavior. Each
collection ID maps to an object with the following properties:

| Property                | Type   | Default | Description                                                                               |
| ----------------------- | ------ | ------- | ----------------------------------------------------------------------------------------- |
| `visualizations`        | Object | -       | Visualization definitions keyed by name; first is default. [See below](#visualizations)   |
| `mosaicTilerParams`     | Object | -       | TiTiler mosaic parameters. [See below](#mosaictilerparams)                                |
| `sceneMinZoom`          | Number | `7`     | Minimum zoom level required for Scene and Mosaic views                                    |
| `queryableFilters`      | Array  | all     | Allowlist of queryable fields to show as filters. [See below](#queryablefilters)          |
| `tileLayerParams`       | Object | -       | Leaflet tile layer options (e.g., `minZoom`, `maxZoom`, `opacity`)                        |
| `enhancedDisplayConfig` | Object | -       | Details layout with `property_groups`/`asset_groups`. [See below](#enhanceddisplayconfig) |

Here is an example showing many of the properties in use. The sections that follow
cover each in detail.

```json
{
  "COLLECTIONS_CONFIG": {
    "sentinel-2-l2a": {
      "visualizations": {
        "true-color": {
          "title": "True Color",
          "assets": ["red", "green", "blue"],
          "rescale": ["0,10000", "0,10000", "0,10000"],
          "color_formula": "Gamma RGB 3.5"
        },
        "ndvi": {
          "title": "NDVI",
          "assets": ["nir", "red"],
          "expression": "(nir-red)/(nir+red)",
          "colormap_name": "rdylgn",
          "rescale": ["-1,1"]
        }
      },
      "mosaicTilerParams": {
        "assets": ["visual"]
      },
      "sceneMinZoom": 7,
      "queryableFilters": ["eo:cloud_cover"],
      "tileLayerParams": {
        "minZoom": 2,
        "maxZoom": 26
      }
    }
  }
}
```

> **Note:** Collection IDs used in the `COLLECTION_CONFIG` object must match collections
> available from your STAC API (after any `COLLECTIONS` filtering). Settings for
> unrecognized collection IDs are ignored and logged to the browser console.

### visualizations

The `visualizations` property defines how imagery is rendered for a collection. Each entry
is a named visualization with TiTiler parameters (`assets`, `rescale`, `color_formula`, etc.
— the full list is documented under [mosaicTilerParams](#mosaictilerparams), which shares the
same parameter set). The first entry is used as the default.

**Manual configuration:**

```json
{
  "COLLECTIONS_CONFIG": {
    "sentinel-2-l2a": {
      "visualizations": {
        "true-color": {
          "title": "True Color",
          "assets": ["red", "green", "blue"],
          "rescale": ["0,10000", "0,10000", "0,10000"],
          "color_formula": "Gamma RGB 3.5"
        },
        "ndvi": {
          "title": "NDVI",
          "assets": ["nir", "red"],
          "expression": "(nir-red)/(nir+red)",
          "colormap_name": "rdylgn",
          "rescale": ["-1,1"]
        }
      }
    }
  }
}
```

**Auto-configuration via the STAC Render Extension:**

If `visualizations` is not defined for a collection, FilmDrop UI can automatically populate
it from the collection's [STAC Render Extension](https://github.com/stac-extensions/render)
`renders` object. This eliminates the need to manually specify visualization parameters.
Requirements:

- `STAC_API_URL` must be configured
- `SCENE_TILER_URL` must be configured
- STAC Collections must include the `renders` extension

FilmDrop UI reads each render definition and maps it to TiTiler parameters. The following
fields are supported:

| Render Field    | TiTiler Parameter | Description                                                           |
| --------------- | ----------------- | --------------------------------------------------------------------- |
| `assets`        | `assets`          | Array of asset keys to render (required)                              |
| `rescale`       | `rescale`         | Value ranges for stretching (e.g., `[[0,10000],[0,10000],[0,10000]]`) |
| `colormap_name` | `colormap_name`   | Predefined colormap (e.g., `"viridis"`, `"ylgn"`)                     |
| `colormap`      | `colormap`        | Custom colormap object                                                |
| `color_formula` | `color_formula`   | Color adjustment formula (e.g., `"Gamma RGB 3.5"`)                    |
| `nodata`        | `nodata`          | No-data value to mask                                                 |
| `expression`    | `expression`      | Band math expression (e.g., `"(nir-red)/(nir+red)"`)                  |
| `resampling`    | `resampling`      | Resampling method (e.g., `"nearest"`, `"bilinear"`)                   |

**TiTiler-Specific Parameter Inference:**

FilmDrop UI automatically infers certain TiTiler parameters that are not part of the STAC Render Extension specification:

- **`asset_as_band`**: Automatically set to `true` when a visualization has an `expression` and specifies multiple `assets`.
  This tells TiTiler to treat each asset as a 1-band dataset for band math operations.
- **`unscale`**: Automatically set to `true` for expression-based visualizations (e.g., NDVI) to apply scale/offset metadata
  from the raster. For RGB-style visualizations without expressions, `unscale` is omitted to preserve the historical raw DN behavior.

> **Note**: These parameters are inferred automatically based on the visualization structure and do not need to be specified in
> the configuration. The STAC Render Extension does not include these TiTiler-specific parameters.

For example, a STAC Collection with this `renders` object:

```json
{
  "id": "sentinel-2-l2a",
  "stac_extensions": [
    "https://stac-extensions.github.io/render/v2.0.0/schema.json"
  ],
  "renders": {
    "true-color": {
      "title": "True Color",
      "assets": ["red", "green", "blue"],
      "rescale": [
        [0, 10000],
        [0, 10000],
        [0, 10000]
      ],
      "color_formula": "Gamma RGB 3.5"
    },
    "ndvi": {
      "title": "NDVI",
      "assets": ["nir", "red"],
      "expression": "(nir-red)/(nir+red)",
      "rescale": [[-1, 1]],
      "colormap_name": "rdylgn"
    }
  }
}
```

Would auto-populate `visualizations` as:

```json
{
  "visualizations": {
    "true-color": {
      "title": "True Color",
      "assets": ["red", "green", "blue"],
      "rescale": ["0,10000", "0,10000", "0,10000"],
      "color_formula": "Gamma RGB 3.5"
    },
    "ndvi": {
      "title": "NDVI",
      "assets": ["nir", "red"],
      "expression": "(nir-red)/(nir+red)",
      "rescale": ["-1,1"],
      "colormap_name": "rdylgn"
    }
  }
}
```

If `visualizations` is manually defined for a collection, auto-configuration is skipped
for that collection.

### mosaicTilerParams

`mosaicTilerParams` configures how mosaic search results are rendered on the map. Unlike
`visualizations` — which provides multiple named presets for individual items that the user
can switch between — `mosaicTilerParams` is a single configuration applied automatically to
the mosaic layer.

Both `mosaicTilerParams` and `visualizations` entries accept the same TiTiler parameters
(`assets`, `rescale`, `colormap_name`, `color_formula`, `expression`, `colormap`, `nodata`,
`bidx`). For complete TiTiler parameter documentation, see
[TiTiler Docs](https://devseed.com/titiler/).

**Examples:**

Basic RGB:

```json
{
  "mosaicTilerParams": {
    "assets": ["visual"]
  }
}
```

With color formula:

```json
{
  "mosaicTilerParams": {
    "assets": ["red", "green", "blue"],
    "color_formula": "Gamma+RGB+3.2+Saturation+0.8+Sigmoidal+RGB+12+0.35"
  }
}
```

Single band with colormap:

```json
{
  "mosaicTilerParams": {
    "assets": ["data"],
    "colormap_name": "terrain",
    "rescale": ["-1000,4000"]
  }
}
```

Custom colormap:

```json
{
  "mosaicTilerParams": {
    "assets": ["supercell"],
    "colormap": {
      "0": "#000000",
      "1": "#419bdf",
      "2": "#397d49",
      "10": "#616161"
    }
  }
}
```

Expression:

```json
{
  "mosaicTilerParams": {
    "assets": ["red", "nir"],
    "expression": "(nir-red)/(nir+red)"
  }
}
```

### queryableFilters

FilmDrop UI automatically discovers filterable properties from each STAC collection's
[OGC Queryables](https://docs.ogc.org/is/17-069r4/17-069r4.html#_queryables) endpoint
(if available) and renders appropriate filter controls:

| Schema Type                      | UI Control            | Example Property    |
| -------------------------------- | --------------------- | ------------------- |
| Numeric with `minimum`/`maximum` | Range slider          | `eo:cloud_cover`    |
| String/Number/Integer with enum  | Multi-select dropdown | `sar:polarizations` |
| String (plain)                   | Text input            | `platform`          |
| Number/Integer (without min/max) | Numeric input         | `gsd`               |

Use the `queryableFilters` property in `COLLECTIONS_CONFIG` to control which filters appear:

- Provide an array to show only those queryables (allowlist)
- Set to `[]` to hide all queryable filters for that collection
- Omit the property to show all supported queryables

```json
{
  "COLLECTIONS_CONFIG": {
    "sentinel-1-grd": {
      "queryableFilters": ["sar:polarizations", "sar:instrument_mode"]
    },
    "landsat-c2-l2": {
      "queryableFilters": []
    },
    "sentinel-2-l2a": {}
  }
}
```

### enhancedDisplayConfig

Configure how item properties and assets are grouped in the details panel:

```json
{
  "COLLECTIONS_CONFIG": {
    "sentinel-2-l2a": {
      "enhancedDisplayConfig": {
        "property_groups": [
          {
            "name": "Core Fields",
            "fields": [
              { "name": "datetime", "label": "Acquisition Time" },
              { "name": "platform" },
              { "name": "constellation" }
            ]
          },
          {
            "name": "Data Quality",
            "fields": [{ "name": "eo:cloud_cover" }]
          }
        ],
        "asset_groups": [
          {
            "name": "10m Bands",
            "fields": [
              { "name": "red" },
              { "name": "green" },
              { "name": "blue" },
              { "name": "nir" }
            ]
          }
        ]
      }
    }
  }
}
```

## Minimal Configuration

Only `STAC_API_URL` is required:

```json
{
  "STAC_API_URL": "https://api.example.com"
}
```

Add `SCENE_TILER_URL` to enable imagery visualization:

```json
{
  "STAC_API_URL": "https://api.example.com",
  "SCENE_TILER_URL": "https://titiler.example.com"
}
```

## Migration Guide

### Migration Overview

The FilmDrop UI configuration has been refactored to consolidate collection-specific
parameters into a single `COLLECTIONS_CONFIG` object. This reduces repetition and makes
configuration files easier to maintain.

### What Changed

**Before:** Collection-specific settings were scattered across multiple top-level parameters
(`SCENE_TILER_PARAMS`, `MOSAIC_TILER_PARAMS`, `SEARCH_MIN_ZOOM_LEVELS`, `TILE_LAYER_PARAMS`,
`ENHANCED_DISPLAY_CONFIG`), each requiring repeating the collection IDs.

**After:** All collection-specific settings are grouped under `COLLECTIONS_CONFIG`, with each
collection ID appearing only once.

### Runtime Enforcement

Legacy and mixed config formats fail startup. Migrate your config with:

```bash
npm run config:migrate -- --input public/config/config.json --output public/config/config.json.migrated
npm run config:lint -- public/config/config.json.migrated
```

`config:migrate` also fails on mixed-format inputs (`COLLECTIONS_CONFIG` plus legacy keys).
Resolve mixed files by either:

1. Migrating a legacy-only source file, or
2. Manually reconciling values into `COLLECTIONS_CONFIG` and removing legacy keys.

### Migration Example

#### Legacy Configuration (Still Supported)

```json
{
  "SCENE_TILER_PARAMS": {
    "sentinel-2-l2a": {
      "assets": ["red", "green", "blue"],
      "color_formula": "Gamma+RGB+3.2"
    },
    "landsat-c2-l2": {
      "assets": ["red", "green", "blue"],
      "color_formula": "Gamma+RGB+1.7"
    }
  },
  "MOSAIC_TILER_PARAMS": {
    "sentinel-2-l2a": { "assets": ["visual"] },
    "landsat-c2-l2": { "assets": ["red"] }
  },
  "SEARCH_MIN_ZOOM_LEVELS": {
    "sentinel-2-l2a": { "medium": 4, "high": 7 },
    "landsat-c2-l2": { "medium": 4, "high": 7 }
  }
}
```

#### New Configuration (Recommended)

```json
{
  "COLLECTIONS_CONFIG": {
    "sentinel-2-l2a": {
      "visualizations": {
        "default": {
          "assets": ["red", "green", "blue"],
          "color_formula": "Gamma+RGB+3.2"
        }
      },
      "mosaicTilerParams": { "assets": ["visual"] },
      "sceneMinZoom": 7
    },
    "landsat-c2-l2": {
      "visualizations": {
        "default": {
          "assets": ["red", "green", "blue"],
          "color_formula": "Gamma+RGB+1.7"
        }
      },
      "mosaicTilerParams": { "assets": ["red"] },
      "sceneMinZoom": 7
    }
  }
}
```

## Troubleshooting

### Config not loading

- Check browser console for fetch errors
- Verify `config.json` path is `/config/config.json` relative to app root
- Ensure JSON is valid (use a JSON validator)

### Collections not appearing

- Verify `STAC_API_URL` is correct and accessible
- Check `COLLECTIONS` filter if set
- Ensure collection IDs match STAC API

### Tiling not working

- Verify `SCENE_TILER_URL` and `MOSAIC_TILER_URL` are accessible
- Check collection has `visualizations` configured (or STAC Render Extension for auto-configuration)
- Ensure assets specified exist in STAC items

### Theme issues

- Verify CSS theme selectors match configuration
- Check `THEME_SWITCHING_ENABLED` matches CSS structure
- See [THEME_SWITCHING_ENABLED](#theme_switching_enabled)

### Filters not appearing

- Verify the collection has a queryables endpoint (check collection links for
  `rel="http://www.opengis.net/def/rel/ogc/1.0/queryables"`)
- Check browser console for queryables fetch errors
- Ensure queryable schemas have supported types (number with min/max, enum values, string, or number)
- If using `queryableFilters` allowlist, verify field names match exactly

## Additional Resources

- [Main README](README.md) - Quick start and overview
- [Changelog](CHANGELOG.md) - Version history and changes
- [Example Configs](config_helper/) - Reference configurations
