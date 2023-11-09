<!--lint disable-->

---

status: proposed
date: 2022-11-08
deciders: Brad Andrick, Matt Hanson, Phil Varner

---

# AD: Modular Architecture Improvement: Config.json Refactor & Application Directory Changes

> This ADR is a proposal for a new structure for the config.json file and the application directory structure. This is a follow-on to further explain `adr_design_refactor_11.2.23.md`.

## Existing Example Config.json Structure:

```jsonc
{
  "PUBLIC_URL": "http://example.com/",
  "LOGO_URL": "./logo.png",
  "LOGO_ALT": "Alt description for my custom logo",
  "SHOW_PUBLISH_BTN": false,
  "DEFAULT_COLLECTION": "collection-name",
  "STAC_API_URL": "https://api-endpoint.example.com",
  "API_MAX_ITEMS": 200,
  "SCENE_TILER_URL": "https://titiler.example.com",
  "DASHBOARD_BTN_URL": "https://dashboard.example.com",
  "ANALYZE_BTN_URL": "https://dashboard.example.com",
  "LAUNCH_URL": "https://launch-a-viewer.example.com",
  "SCENE_TILER_PARAMS": {
    "sentinel-2-l2a": {
      "assets": ["red", "green", "blue"],
      "color_formula": "Gamma+RGB+3.2+Saturation+0.8+Sigmoidal+RGB+12+0.35"
    },
    "landsat-c2-l2": {
      "assets": ["red", "green", "blue"],
      "color_formula": "Gamma+RGB+1.7+Saturation+1.7+Sigmoidal+RGB+15+0.35"
    },
    "naip": {
      "assets": ["image"],
      "bidx": "1,2,3"
    },
    "cop-dem-glo-30": {
      "assets": ["data"],
      "colormap_name": "terrain",
      "rescale": ["-1000,4000"]
    },
    "cop-dem-glo-90": {
      "assets": ["data"],
      "colormap_name": "terrain",
      "rescale": ["-1000,4000"]
    },
    "sentinel-1-grd": {
      "assets": ["vv"],
      "rescale": ["0,250"],
      "colormap_name": "plasma"
    }
  },
  "MOSAIC_TILER_URL": "https://titiler-mosaic.example.com",
  "MOSAIC_TILER_PARAMS": {
    "sentinel-2-l2a": {
      "assets": ["visual"]
    },
    "landsat-c2-l2": {
      "assets": ["red"],
      "color_formula": "Gamma+R+1.7+Sigmoidal+R+15+0.35"
    },
    "naip": {
      "assets": ["image"],
      "bidx": "1,2,3"
    },
    "cop-dem-glo-30": {
      "assets": ["data"],
      "colormap_name": "terrain",
      "rescale": ["-1000,4000"]
    },
    "cop-dem-glo-90": {
      "assets": ["data"],
      "colormap_name": "terrain",
      "rescale": ["-1000,4000"]
    },
    "sentinel-1-grd": {
      "assets": ["vv"],
      "rescale": ["0,250"],
      "colormap_name": "plasma"
    }
  },
  "MOSAIC_MAX_ITEMS": 100,
  "MOSAIC_MIN_ZOOM_LEVEL": 7,
  "CONFIG_COLORMAP": "viridis",
  "SEARCH_MIN_ZOOM_LEVELS": {
    "sentinel-2-l2a": {
      "medium": 4,
      "high": 7
    },
    "landsat-c2-l2": {
      "medium": 4,
      "high": 7
    },
    "naip": {
      "medium": 10,
      "high": 14
    },
    "cop-dem-glo-30": {
      "medium": 6,
      "high": 8
    },
    "cop-dem-glo-90": {
      "medium": 6,
      "high": 8
    },
    "sentinel-1-grd": {
      "medium": 7,
      "high": 7
    }
  },
  "BASEMAP_URL": "https://tile-provider.example.com/{z}/{x}/{y}.png",
  "BASEMAP_DARK_THEME": true,
  "BASEMAP_HTML_ATTRIBUTION": "&copy; <a href=\"https://www.tile-provider.example.com/copyright\">TileProvider</a>",
  "ADVANCED_SEARCH_ENABLED": false,
  "CART_ENABLED": false,
  "SHOW_BRAND_LOGO": true,
  "POPUP_DISPLAY_FIELDS": {
    "sentinel-2-l2a": ["datetime", "platform", "eo:cloud_cover"],
    "sentinel-2-l1c": ["datetime", "platform", "eo:cloud_cover"],
    "landsat-c2-l2": ["datetime", "platform", "instruments", "eo:cloud_cover"],
    "naip": ["datetime", "naip:state", "naip:year", "gsd"],
    "cop-dem-glo-30": ["datetime"],
    "cop-dem-glo-90": ["datetime"],
    "sentinel-1-grd": [
      "datetime",
      "platform",
      "sar:instrument_mode",
      "sar:polarizations"
    ]
  },
  "APP_NAME": "Filmdrop Console",
  "APP_FAVICON": "exampleFavicon.ico",
  "MAP_ZOOM": 3,
  "MAP_CENTER": [30, 0],
  "LAYER_LIST_ENABLED": true,
  "LAYER_LIST_SERVICES": [
    {
      "name": "Service 1",
      "type": "wms",
      "url": "https://sampleservice1.com/wms",
      "layers": [
        {
          "name": "layer1_name",
          "alias": "Layer 1 Alias",
          "default_visibility": true,
          "crs": "EPSG:4326"
        },
        {
          "name": "layer2_name",
          "alias": "Layer 2 Alias",
          "default_visibility": false
        }
      ]
    },
    {
      "name": "Service 2",
      "type": "wms",
      "url": "https://sampleservice2.com/wms",
      "layers": [
        {
          "name": "layer1_name",
          "alias": "Layer 1 Alias",
          "default_visibility": true
        }
      ]
    }
  ]
}
```

## Proposed Config.json Structure:

```jsonc
{
  "CONSOLE_SETTINGS": {
    // settings for top level console/parent container app
    "APP_NAME": "Filmdrop Console",
    "APP_FAVICON": "exampleFavicon.ico",
    "LOGO_URL": "./logo.png",
    "LOGO_ALT": "Alt description for my custom logo",
    "PUBLIC_URL": "http://example.com/",
    "SHOW_BRAND_LOGO": true,
    "THEME": {
      // custom MUI theme/colors here
    }
  },
  "APP_SETTINGS": {
    // settings for each individual nested 'app'
    "CORE_APPS": {
      // settings for core apps included with base FD console
      "SEARCH": {
        // all settings for search app here
        // this would be all existing console FD-UI search/map settings from old config
        "ENABLED": true
      },
      "DASHBOARD": {
        // all settings for dashboard app here
        "ENABLED": false
      }
    },
    "CUSTOM_APPS": {
      // settings for any custom apps that have been developed
      "CUSTOM_APP_1": {
        // all settings for custom app here
      },
      "CUSTOM_APP_2": {
        // all settings for custom app here
      }
    }
  }
}
```

## Existing Directory Structure:

```
filmdrop-ui/
  ├── src/
  │   ├── assets/                 # Static assets like images, fonts, etc.
  │   ├── components/             # All UI components used in app
  │   ├── redux/                  # Single slice for state management (Redux)
  │   ├── services/               # API calls and other services
  │   ├── testing/                # Shared mocks for entire app
  │   ├── utils/                  # Utility functions
  │   ├── App.js                  # Main application component
  │   ├── index.js                # Entry point of the application
  ├── public/                     # Public assets and HTML template
  │   ├── config/                 # Config directory
  │   │   ├── config.json         # Single root level config file for entire app, not broken into modules
  ├── package.json
  ├── .eslintrc.json              # ESLint configuration
  ├── .prettierrc.json            # Prettier configuration
```

## Proposed Directory Structure:

```
filmdrop-ui/
  ├── src/
  │   ├── assets/                 # Static assets like images, fonts, etc.
  │   ├── components/             # Reusable UI components
  │   ├── layouts/                # Shared layout components
  │   ├── modules/
  │   │ │── core_apps/            # Directory for core apps
  │   │   ├── search/             # Self-contained search app
  │   │   │   ├── components/     # Components specific to search app
  │   │   │   ├── containers/     # Container components for search app
  │   │   │   ├── store/          # Redux store, actions, reducers, etc. for search app
  │   │   │   ├── utils/          # Utility functions specific to search app
  │   │   │   ├── services/       # API calls specific to search app
  │   │   │   ├── app.js          # Main entry point for search app
  │   │   ├── dashboard/          # Self-contained dashboard app
  │   │   │   ├── components/     # Components specific to dashboard app
  │   │   │   ├── containers/     # Container components for dashboard app
  │   │   │   ├── store/          # Redux store, actions, reducers, etc. for dashboard app
  │   │   │   ├── utils/          # Utility functions specific to dashboard app
  │   │   │   ├── services/       # API calls specific to dashboard app
  │   │   │   ├── app.js          # Main entry point for dashboard app
  │   │ │── custom_apps/          # Directory for core apps
  │   │   ├── app_1/              # Self-contained custom app 1
  │   │   │   ├── components/     # Components specific to custom app 1
  │   │   │   ├── containers/     # Container components for custom app 1
  │   │   │   ├── store/          # Redux store, actions, reducers, etc. for custom app 1
  │   │   │   ├── utils/          # Utility functions specific to custom app 1
  │   │   │   ├── services/       # API calls specific to custom app 1
  │   │   │   ├── app.js          # Main entry point for custom app 1
  │   │   ├── app_2/              # Self-contained custom app 2
  │   │   │   ├── components/     # Components specific to custom app 2
  │   │   │   ├── containers/     # Container components for custom app 2
  │   │   │   ├── store/          # Redux store, actions, reducers, etc. for custom app 2
  │   │   │   ├── utils/          # Utility functions specific to custom app 2
  │   │   │   ├── services/       # API calls specific to custom app 2
  │   │   │   ├── app.js          # Main entry point for custom app 2
  │   ├── store/                  # Global state management (Redux)
  │   ├── services/               # Global API calls and other services
  │   ├── utils/                  # Global/shared Utility functions
  │   ├── App.js                  # Main application component
  │   ├── index.js                # Entry point of the application
  ├── public/                     # Public assets and HTML template
  │   ├── config/                 # Config directory
  │   │   ├── config.json         # Single config file for the parent app and any core or custom apps
  ├── package.json
  ├── .eslintrc.json              # ESLint configuration
  ├── .prettierrc.json            # Prettier configuration
```

## How directory structure relates to config:

- on load, config is loaded from `public/config/config.json`
- config is broken into core & custom apps based on app name
- parent app will read config, and enable/disable core apps based on flag in config
- custom apps will be nested in the same pattern as the core apps and exposed via the `<custom_app>.js` file
- apps will load into the parent side nav based on flag in config
- when side nav is clicked, the app will load and render into the main frame of the parent app
- global state will be passed down to the app via the redux store if required
- global API calls will be passed down to the app via the services if required
- global utility functions will be passed down to the app via the utils if required
- documentation for custom development will be added to the filmdrop-ui repo and referenced in the `README.md`

<!--lint enable-->
