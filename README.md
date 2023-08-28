# FilmDrop UI

- [FilmDrop UI](#filmdrop-ui)
  - [Summary](#summary)
  - [Screenshots](#screenshots)
  - [Running](#running)
    - [Configuration File](#configuration-file)
    - [Links](#links)
  - [Scripts](#scripts)
    - [`npm start`](#npm-start)
    - [`npm test`](#npm-test)
    - [`npm run build`](#npm-run-build)
    - [`npm run coverage`](#npm-run-coverage)
    - [`npm run serve`](#npm-run-serve)

## Summary

FilmDrop UI is a browser-based interface for displaying results from a STAC API. Additional information can be found in the [CHANGELOG](CHANGELOG.md).

## Screenshots

Sentinel-1 L1C H3 Geohex View

![Sentinel-1 L1C H3 Geohex View](/screenshots/s1-hex.jpg)

Copernicus DEM H3 Geohex Aggregation View

![Copernicus DEM H3 Geohex Aggregation View](/screenshots/cop-dem-hex.jpg)

NAIP Grid View

![NAIP Grid View](/screenshots/naip-grid.jpg)

Sentinel-2 L2A Grid View

![Sentinel-2 L2A Grid View](/screenshots/s2-l2a-grid.jpg)

Sentinel-1 L1C Scene View

![Sentinel-1 L1C Scene View](/screenshots/s1-scene.jpg)

NAIP Scene View

![NAIP Scene View](/screenshots/naip-scene.jpg)

Copernicus DEM Mosaic View

![Copernicus DEM Mosaic View](/screenshots/cop-dem-mosaic.jpg)

Sentinel-2 L2A Mosaic View

![Sentinel-2 L2A Mosaic View](/screenshots/s2-l2a-mosaic.jpg)

## Running

### Configuration File

For local development, you should create a `./public/config/config.json` file with appropriate variables outlined in the table below.
The file `./public/config/config.example.json` is included in this repository as representative file structure.

> NOTE: This project uses a "build-once, deploy-anywhere" approach with config variables. The config is read on application load by a fetch to the `/config/config.json` path.
> There is a cachebreaker included in the request to prevent stale config files from being used.
> This works if the app is deployed with at the root. If nested, the config path may need adjusting and will require a new build step.

### `config.json`

| Variable                 | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   | Required |
| ------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- |
| STAC_API_URL             | URL for STAC API                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              | Required |
| PUBLIC_URL               | URL for the FilmDrop UI. Useful when using a CDN to host application.                                                                                                                                                                                                                                                                                                                                                                                                                                                         | Optional |
| LOGO_URL                 | URL for your custom logo                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      | Optional |
| LOGO_ALT                 | Alt image description for your custom logo                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    | Optional |
| DASHBOARD_BTN_URL        | URL for the Dashboard button at the top right of the UI. If not set, the button will not be visible.                                                                                                                                                                                                                                                                                                                                                                                                                          | Optional |
| ANALYZE_BTN_URL          | URL for the Analyze button at the bottom left of the UI. If not set, the button will not be visible.                                                                                                                                                                                                                                                                                                                                                                                                                          | Optional |
| SHOW_PUBLISH_BTN         | Flag for displaying the Publish button at the bottom left of the UI. Setting to `true` will display the button, any other value will not display the button. Default is to not display the button.                                                                                                                                                                                                                                                                                                                            | Optional |
| API_MAX_ITEMS            | Maximum number of items requested from API. If not set, the default max items will be 200.                                                                                                                                                                                                                                                                                                                                                                                                                                    | Optional |
| DEFAULT_COLLECTION       | Default collection option for collection dropdown                                                                                                                                                                                                                                                                                                                                                                                                                                                                             | Optional |
| SCENE_TILER_URL          | URL for map tiling                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            | Optional |
| SCENE_TILER_PARAMS       | Per-collection configuration of TiTiler `assets`, `color_formula`, `bidx`, `rescale`, `expression`, and `colormap_name` parameters. Example in [config.example.json](./public/config/config.example.json)                                                                                                                                                                                                                                                                                                                     | Optional |
| MOSAIC_MIN_ZOOM_LEVEL    | Minimum zoom level for mosaic view search results. If not set, the default zoom level will be 7.                                                                                                                                                                                                                                                                                                                                                                                                                              | Optional |
| LAUNCH_URL               | Redirect URL used to create a new stack. If not set, the Launch Your Own button will not be visible.                                                                                                                                                                                                                                                                                                                                                                                                                          | Optional |
| MOSAIC_TILER_URL         | URL for mosaic tiling. If not set, the View Mode selector will not be visible. The app requires the use of the [NASA IMPACT TiTiler fork](https://github.com/NASA-IMPACT/titiler) as it contains the mosaicjson endpoints needed.                                                                                                                                                                                                                                                                                             | Optional |
| MOSAIC_TILER_PARAMS      | Per-collection configuration of TiTiler mosaic `assets`, `color_formula`, `bidx`, `rescale`, `expression`, and `colormap_name` parameters. Example in [config.example.json](./public/config/config.example.json)                                                                                                                                                                                                                                                                                                              | Optional |
| MOSAIC_MAX_ITEMS         | Maximum number of items in mosaic. If not set, the default max items will be 100.                                                                                                                                                                                                                                                                                                                                                                                                                                             | Optional |
| SEARCH_MIN_ZOOM_LEVELS   | Per-collection configuration for minimum zoom levels needed for grid code aggregated results (medium zoom level) and single scene search results (high zoom level). Example: [config.example.json](./public/config/config.example.json). If no grid code aggregation, set value for `medium` to be the same value as `high` and hex aggregations will be used until the zoom level is reached when individual scenes become available.                                                                                        | Optional |
| CONFIG_COLORMAP          | Color map used in low level hex grid search results. Complete list of colormaps are available here: [bpostlethwaite/colormap](https://github.com/bpostlethwaite/colormap). If not set, the default colormap will be "viridis".                                                                                                                                                                                                                                                                                                | Optional |
| BASEMAP_URL              | URL to specify a basemap provider used by the leaflet map. Must be a raster tile provider as vector tiles are not supported. If not set, the default colormap will be `https://tile.openstreetmap.org/{z}/{x}/{y}.png`.                                                                                                                                                                                                                                                                                                       | Optional |
| BASEMAP_HTML_ATTRIBUTION | String of HTML markup used to set the attribution for the basemap provider used by the leaflet map. Markup is sanitized prior to render with `DOMPurify` and only is retricted to only allow `html`, `'a' tags`, and `'href'` and `'target'` attributes. Custom attribution will not render if `BASEMAP_URL` is not also set. If not set, the default attribution will be `&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>`. (Note: Raw HTML was used here since attribution is non-standardized.) | Optional |
| ADVANCED_SEARCH_ENABLED  | If set to `true` advanced search options will render and allow users to draw or upload a geojson file to use as search bounds.                                                                                                                                                                                                                                                                                                                                                                                                | Optional |
| CART_ENABLED             | If set to `true` cart features will be enabled. These include: rendering cart button in search controls bar, adding cart management buttons to popup results, render buttons in messages to quickly add some or all scenes to cart after search completes.                                                                                                                                                                                                                                                                    | Optional |
| SHOW_BRAND_LOGO          | If set to `true` filmdrop brand logo and clickable hyperlink are rendered at the top right of the UI. If not set or `false`, the logo will not be visible.                                                                                                                                                                                                                                                                                                                                                                    | Optional |
| POPUP_DISPLAY_FIELDS     | Per-collection configuration of popup metadata fields properies to render. Example in [config.example.json](./public/config/config.example.json). Only `Title` field (which maps to the `id` property for STAC items) is rendered if collection used in application but not included in configuration.                                                                                                                                                                                                                        | Optional |
| APP_NAME                 | String value used for html title and anywhere else that the text value for app name is used. If not set, default value of `FilmDrop Console` will be used.                                                                                                                                                                                                                                                                                                                                                                    | Optional |
| APP_FAVICON              | If set, custom application favicon is used instead of default filmdrop favicon. Favicon file of format `.ico` OR `.png` must be used and file must exist next to config in `/config` of the built deployment directory. Place in `public` directory during local development, but can also be added or adjusted post depolyment. File name in `config.json` must match extactly with file in config, see `config.example.json` for example. If not set or error in config/file, default filmdrop favicon will be used.        | Optional |

### Links

Static files are built with `npm run build` then moved to overwrite files in existing S3 buckets.

## Scripts

This project contains several NPM scripts for common tasks.

### `npm start`

Runs the app locally at <http://localhost:5173>

This uses the configuration settings in `./public/config/config.json`.

### `npm test`

Launches the test runner.

### `npm run build`

This builds using the configuration settings found in `./public/config/config.json`.

The result will appear in the `build` folder.

### `npm run coverage`

Runs tests and outputs a coverage report into console.

### `npm run serve`

Starts a local web server that serves the built solution from `build` folder.
