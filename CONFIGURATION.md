# FilmDrop UI Configuration Guide

Complete reference for configuring FilmDrop UI.

## Table of Contents

- [Overview](#overview)
- [Configuration File Location](#configuration-file-location)
- [Configuration Parameters](#configuration-parameters)
  - [Required Parameters](#required-parameters)
  - [Optional Parameters](#optional-parameters)
  - [Collection Configuration](#collection-configuration)
- [Configuration Examples](#configuration-examples)
- [Migration Guide](#migration-guide)
- [Advanced Configuration](#advanced-configuration)

## Overview

FilmDrop UI uses a "build-once, deploy-anywhere" approach with configuration variables.
The config is read on application load by fetching `/config/config.json` with a
cache-breaker to prevent stale files.

**Key Features:**

- JSON-based configuration
- Runtime loading (no rebuild needed for config changes)
- Support for both legacy and modern configuration formats
- Automatic migration for backward compatibility

## Configuration File Location

### Development

Create `./public/config/config.json` with your configuration.

### Production

After building with `npm run build`, place your config at `build/config/config.json`.

**Example files:**

- `config_helper/config.example.json` - Legacy format example with comprehensive options
- `config_helper/config-new-format-example.json` - Modern format with COLLECTIONS_CONFIG

## Configuration Parameters

### Required Parameters

| Parameter      | Type   | Description                                                                                                                                                           |
| -------------- | ------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `BASEMAP`      | Object | Basemap provider configuration for the Leaflet map. Must be a raster tile provider (vector tiles not supported). See [Basemap Configuration](#basemap-configuration). |
| `STAC_API_URL` | String | URL for the STAC API endpoint                                                                                                                                         |

> **Note:** `SEARCH_MIN_ZOOM_LEVELS` was previously required but is now **deprecated**.
> Use `sceneMinZoom` within `COLLECTIONS_CONFIG` instead.
> Legacy configurations with `{ "medium": X, "high": Y }` format will automatically use the "high" value.

### Optional Parameters

#### Application Branding

| Parameter     | Type   | Default              | Description                                                                                                  |
| ------------- | ------ | -------------------- | ------------------------------------------------------------------------------------------------------------ |
| `APP_NAME`    | String | `"FilmDrop Console"` | Application name used in HTML title and UI                                                                   |
| `APP_FAVICON` | String | -                    | Custom favicon filename (`.ico` or `.png`) in `/config` directory                                            |
| `LOGO_URL`    | String | -                    | URL to custom logo image                                                                                     |
| `LOGO_ALT`    | String | -                    | Alt text for custom logo                                                                                     |
| `PUBLIC_URL`  | String | -                    | Public URL for the application (useful with CDNs)                                                            |
| `BRAND_LOGO`  | Object | -                    | Brand logo configuration with clickable hyperlink. See [Brand Logo Configuration](#brand-logo-configuration) |

#### UI Features

| Parameter                 | Type    | Default | Description                                             |
| ------------------------- | ------- | ------- | ------------------------------------------------------- |
| `CART_ENABLED`            | Boolean | `false` | Enable shopping cart features for scene selection       |
| `EXPORT_ENABLED`          | Boolean | `false` | Enable GeoJSON export of search results                 |
| `SEARCH_BY_GEOM_ENABLED`  | Boolean | `false` | Allow users to draw or upload GeoJSON for search bounds |
| `STAC_LINK_ENABLED`       | Boolean | `false` | Show link to STAC API item in details                   |
| `SHOW_ITEM_AUTO_ZOOM`     | Boolean | `false` | Show toggle to auto-center map on selected item         |
| `LAYER_LIST_ENABLED`      | Boolean | `false` | Enable reference layer list widget                      |
| `THEME_SWITCHING_ENABLED` | Boolean | `false` | Enable light/dark theme switching                       |

#### Navigation Buttons

| Parameter           | Type   | Description                                                    |
| ------------------- | ------ | -------------------------------------------------------------- |
| `DASHBOARD_BTN_URL` | String | URL for Dashboard button (top right). Button hidden if not set |
| `ANALYZE_BTN_URL`   | String | URL for Analyze button (bottom left). Button hidden if not set |
| `ACTION_BUTTON`     | Object | Call-to-action button with `text` and `url` properties         |

#### API Configuration

| Parameter               | Type    | Default         | Description                                                           |
| ----------------------- | ------- | --------------- | --------------------------------------------------------------------- |
| `API_MAX_ITEMS`         | Number  | `200`           | Maximum items requested from STAC API                                 |
| `FETCH_CREDENTIALS`     | String  | `"same-origin"` | Fetch credentials mode: `"same-origin"`, `"include"`, or `"omit"`     |
| `SUPPORTS_AGGREGATIONS` | Boolean | `true`          | Enable aggregation features (requires STAC API Aggregation Extension) |

#### Authentication

| Parameter                | Type    | Description                           |
| ------------------------ | ------- | ------------------------------------- |
| `APP_TOKEN_AUTH_ENABLED` | Boolean | Enable JWT token authentication       |
| `AUTH_URL`               | String  | Authentication endpoint returning JWT |

> **Security Note:** Client-side authentication provides limited security. Ensure STAC API also validates tokens.

#### Map Configuration

| Parameter         | Type   | Default     | Description                                                                                              |
| ----------------- | ------ | ----------- | -------------------------------------------------------------------------------------------------------- |
| `MAP_CENTER`      | Array  | `[30, 0]`   | Initial map center `[lat, lon]`                                                                          |
| `MAP_ZOOM`        | Number | `3`         | Initial map zoom level                                                                                   |
| `MAP_ZOOM_MAX`    | Number | `18`        | Maximum map zoom level                                                                                   |
| `CONFIG_COLORMAP` | String | `"viridis"` | Colormap for hex grid results. See [bpostlethwaite/colormap](https://github.com/bpostlethwaite/colormap) |

#### Tiling Configuration

| Parameter          | Type   | Description                                                                                           |
| ------------------ | ------ | ----------------------------------------------------------------------------------------------------- |
| `SCENE_TILER_URL`  | String | TiTiler endpoint for scene tiling                                                                     |
| `MOSAIC_TILER_URL` | String | TiTiler mosaic endpoint (requires [NASA IMPACT TiTiler fork](https://github.com/NASA-IMPACT/titiler)) |
| `MOSAIC_MAX_ITEMS` | Number | Maximum items in mosaic (default: `100`)                                                              |

#### Layer Configuration

| Parameter             | Type   | Description                                                                                             |
| --------------------- | ------ | ------------------------------------------------------------------------------------------------------- |
| `LAYER_LIST_SERVICES` | Array  | WMS service definitions for reference layers. See [Layer List Configuration](#layer-list-configuration) |
| `COLLECTIONS`         | Array  | Filter collections to show (array of collection IDs)                                                    |
| `DEFAULT_COLLECTION`  | String | Default selected collection ID                                                                          |

### Collection Configuration

#### Modern Format (Recommended): COLLECTIONS_CONFIG

The `COLLECTIONS_CONFIG` parameter consolidates all collection-specific settings into a
single structure. This is the **recommended approach** as it reduces repetition and
improves maintainability.

```json
{
  "COLLECTIONS_CONFIG": {
    "collection-id": {
      "sceneTilerParams": {},
      "mosaicTilerParams": {},
      "sceneMinZoom": 7,
      "popupDisplayFields": [],
      "tileLayerParams": {},
      "enhancedDisplayConfig": {}
    }
  }
}
```

**Properties:**

| Property                | Type   | Description                                                                                                                 |
| ----------------------- | ------ | --------------------------------------------------------------------------------------------------------------------------- |
| `sceneTilerParams`      | Object | TiTiler scene parameters: `assets`, `color_formula`, `bidx`, `rescale`, `expression`, `colormap_name`, `colormap`, `nodata` |
| `mosaicTilerParams`     | Object | TiTiler mosaic parameters (same as sceneTilerParams)                                                                        |
| `sceneMinZoom`          | Number | Minimum zoom level required for Scene and Mosaic views (default: 7)                                                         |
| `popupDisplayFields`    | Array  | STAC property names to display in popup (e.g., `["datetime", "platform"]`)                                                  |
| `tileLayerParams`       | Object | Leaflet tile layer options (e.g., `minZoom`, `maxZoom`, `opacity`)                                                          |
| `enhancedDisplayConfig` | Object | Enhanced details configuration with `property_groups` and `asset_groups`                                                    |

**Example:**

```json
{
  "COLLECTIONS_CONFIG": {
    "sentinel-2-l2a": {
      "sceneTilerParams": {
        "assets": ["red", "green", "blue"],
        "color_formula": "Gamma+RGB+3.2+Saturation+0.8+Sigmoidal+RGB+12+0.35"
      },
      "mosaicTilerParams": {
        "assets": ["visual"]
      },
      "sceneMinZoom": 7,
      "popupDisplayFields": ["datetime", "platform", "eo:cloud_cover"],
      "tileLayerParams": {
        "minZoom": 2,
        "maxZoom": 26
      }
    }
  }
}
```

#### Legacy Format (Deprecated)

The following parameters are **deprecated** but still supported for backward compatibility:

- `SCENE_TILER_PARAMS`
- `MOSAIC_TILER_PARAMS`
- `SEARCH_MIN_ZOOM_LEVELS` - Legacy format `{ "medium": number, "high": number }` converted to `sceneMinZoom` (uses the "high" value)
- `POPUP_DISPLAY_FIELDS`
- `TILE_LAYER_PARAMS`
- `ENHANCED_DISPLAY_CONFIG`

**Migration:** Use `COLLECTIONS_CONFIG` instead. See [Migration Guide](#migration-guide).

## Configuration Examples

### Basemap Configuration

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

### Brand Logo Configuration

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
    "image": "./your-logo.png"
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
    "image_light": "./your-logo-light.png",
    "image_dark": "./your-logo-dark.png"
  }
}
```

### Layer List Configuration

```json
{
  "LAYER_LIST_ENABLED": true,
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

### Enhanced Display Configuration

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

### TiTiler Parameters

**Basic RGB:**

```json
{
  "sceneTilerParams": {
    "assets": ["red", "green", "blue"]
  }
}
```

**With Color Formula:**

```json
{
  "sceneTilerParams": {
    "assets": ["red", "green", "blue"],
    "color_formula": "Gamma+RGB+3.2+Saturation+0.8+Sigmoidal+RGB+12+0.35"
  }
}
```

**Single Band with Colormap:**

```json
{
  "sceneTilerParams": {
    "assets": ["data"],
    "colormap_name": "terrain",
    "rescale": ["-1000,4000"]
  }
}
```

**Custom Colormap:**

```json
{
  "sceneTilerParams": {
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

**Expression:**

```json
{
  "sceneTilerParams": {
    "assets": ["red", "nir"],
    "expression": "(nir-red)/(nir+red)"
  }
}
```

## Migration Guide

### Overview

The FilmDrop UI configuration has been refactored to consolidate collection-specific
parameters into a single `COLLECTIONS_CONFIG` object. This reduces repetition and makes
configuration files easier to maintain.

### What Changed

#### Before (Legacy Format)

Collection-specific settings were scattered across multiple top-level configuration
parameters:

- `SCENE_TILER_PARAMS`
- `MOSAIC_TILER_PARAMS`
- `SEARCH_MIN_ZOOM_LEVELS`
- `POPUP_DISPLAY_FIELDS`
- `TILE_LAYER_PARAMS`
- `ENHANCED_DISPLAY_CONFIG`

Each parameter required repeating the collection IDs, leading to verbose and error-prone
configurations.

#### After (New Format)

All collection-specific settings are now grouped under `COLLECTIONS_CONFIG`, with each
collection ID appearing only once:

```json
{
  "COLLECTIONS_CONFIG": {
    "collection-id": {
      "sceneTilerParams": {},
      "mosaicTilerParams": {},
      "sceneMinZoom": 7,
      "popupDisplayFields": [],
      "tileLayerParams": {},
      "enhancedDisplayConfig": {}
    }
  }
}
```

### Backward Compatibility

**Your existing configuration files will continue to work!** The application automatically
converts legacy format to the new format on load. However, we recommend migrating to the
new format for better maintainability.

If both formats are present in a config file, `COLLECTIONS_CONFIG` takes precedence, and a warning will be logged to the console.

### Migration Example

**Legacy Configuration (Still Supported)**

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
    "sentinel-2-l2a": {
      "assets": ["visual"]
    },
    "landsat-c2-l2": {
      "assets": ["red"]
    }
  },
  "SEARCH_MIN_ZOOM_LEVELS": {
    "sentinel-2-l2a": {
      "medium": 4,
      "high": 7
    },
    "landsat-c2-l2": {
      "medium": 4,
      "high": 7
    }
  },
  "POPUP_DISPLAY_FIELDS": {
    "sentinel-2-l2a": ["datetime", "platform", "eo:cloud_cover"],
    "landsat-c2-l2": ["datetime", "platform", "instruments"]
  }
}
```

**New Configuration (Recommended)**

```json
{
  "COLLECTIONS_CONFIG": {
    "sentinel-2-l2a": {
      "sceneTilerParams": {
        "assets": ["red", "green", "blue"],
        "color_formula": "Gamma+RGB+3.2"
      },
      "mosaicTilerParams": {
        "assets": ["visual"]
      },
      "sceneMinZoom": 7,
      "popupDisplayFields": ["datetime", "platform", "eo:cloud_cover"]
    },
    "landsat-c2-l2": {
      "sceneTilerParams": {
        "assets": ["red", "green", "blue"],
        "color_formula": "Gamma+RGB+1.7"
      },
      "mosaicTilerParams": {
        "assets": ["red"]
      },
      "sceneMinZoom": 7,
      "popupDisplayFields": ["datetime", "platform", "instruments"]
    }
  }
}
```

## Advanced Configuration

### Theme Configuration

FilmDrop UI supports two theming modes requiring different CSS structures in `src/themes/theme.css`.

**Theme Switching Mode** (`THEME_SWITCHING_ENABLED: true`):

- `:root[data-theme='filmdrop-dark']` - Dark theme variables
- `:root[data-theme='filmdrop-light']` - Light theme variables

**Single Theme Mode** (`THEME_SWITCHING_ENABLED: false`):

- `:root[data-theme='filmdrop']` - Single theme variables

### Scene Minimum Zoom Level

The `sceneMinZoom` configuration specifies the minimum zoom level required to view individual scenes and mosaic tiles:

- **Below `sceneMinZoom`:** Aggregation views only (Hex or Grid, if available)
- **At or above `sceneMinZoom`:** Scene and Mosaic views become available

The application automatically switches between Hex aggregation (if available) and Scene view based on the zoom level.
Users can manually select any view mode at any time (Grid is always available if supported by the collection).

**Example:**

```json
{
  "sceneMinZoom": 7
}
```

Default value is `7` if not specified.

### Favicon Configuration

1. Place `.ico` or `.png` file in `public/config/` (dev) or `build/config/` (production)
2. Reference in config:

```json
{
  "APP_FAVICON": "custom-favicon.ico"
}
```

Filename must match exactly. Falls back to default FilmDrop favicon if file missing.

### Action Button

Create a prominent call-to-action button:

```json
{
  "ACTION_BUTTON": {
    "text": "Order Imagery",
    "url": "https://order.example.com"
  }
}
```

### Minimal Configuration

Minimum required configuration:

```json
{
  "STAC_API_URL": "https://api.example.com",
  "BASEMAP": {
    "url": "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
    "attribution": "&copy; OpenStreetMap"
  },
  "COLLECTIONS_CONFIG": {
    "your-collection": {
      "sceneMinZoom": 7
    }
  }
}
```

### Complete Example

See `config_helper/config-new-format-example.json` for a comprehensive example with all options.

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
- Check collection has `sceneTilerParams` configured
- Ensure assets specified exist in STAC items

### Theme issues

- Verify CSS theme selectors match configuration
- Check `THEME_SWITCHING_ENABLED` matches CSS structure
- See [CSS Theme Configuration](#theme-configuration)

## Additional Resources

- [Main README](README.md) - Quick start and overview
- [Changelog](CHANGELOG.md) - Version history and changes
- [Example Configs](config_helper/) - Reference configurations
