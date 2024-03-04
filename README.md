# FilmDrop UI

- [FilmDrop UI](#filmdrop-ui)
  - [Summary](#summary)
  - [Screenshots](#screenshots)
  - [Running](#running)
    - [Configuration File](#configuration-file)
    - [`config.json`](#configjson)
    - [Links](#links)
  - [Scripts](#scripts)
    - [`npm start`](#npm-start)
    - [`npm test`](#npm-test)
    - [`npm run build`](#npm-run-build)
    - [`npm run coverage`](#npm-run-coverage)
    - [`npm run serve`](#npm-run-serve)
  - [Feature Support](#feature-support)
    - [Geohex Aggregated View](#geohex-aggregated-view)
    - [Grid Code Aggregated View](#grid-code-aggregated-view)
    - [Cloud Cover](#cloud-cover)
    - [SAR](#sar)
    - [Thumbnails](#thumbnails)
    - [Scene Tiling Configuration](#scene-tiling-configuration)
    - [Mosaic Tiling Configuration](#mosaic-tiling-configuration)

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
The file `config_helper/config.example.json` is included in this repository as representative file structure.

> NOTE: This project uses a "build-once, deploy-anywhere" approach with config variables. The config is read on application load by a fetch to the `/config/config.json` path.
> There is a cachebreaker included in the request to prevent stale config files from being used.

### `config.json`

| Variable                 | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   | Required |
| ------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- |
| STAC_API_URL             | URL for STAC API                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              | Required |
| PUBLIC_URL               | URL for the FilmDrop UI. Useful when using a CDN to host application.                                                                                                                                                                                                                                                                                                                                                                                                                                                         | Optional |
| SEARCH_MIN_ZOOM_LEVELS   | Per-collection configuration for minimum zoom levels needed for grid code aggregated results (medium zoom level) and single scene search results (high zoom level). Example: [config.example.json](config_helper/config.example.json). If no grid code aggregation, set value for `medium` to be the same value as `high` and hex aggregations will be used until the zoom level is reached when individual scenes become available.                                                                                          | Required |
| LOGO_URL                 | URL for your custom logo                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      | Optional |
| LOGO_ALT                 | Alt image description for your custom logo                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    | Optional |
| DASHBOARD_BTN_URL        | URL for the Dashboard button at the top right of the UI. If not set, the button will not be visible.                                                                                                                                                                                                                                                                                                                                                                                                                          | Optional |
| ANALYZE_BTN_URL          | URL for the Analyze button at the bottom left of the UI. If not set, the button will not be visible.                                                                                                                                                                                                                                                                                                                                                                                                                          | Optional |
| API_MAX_ITEMS            | Maximum number of items requested from API. If not set, the default max items will be 200.                                                                                                                                                                                                                                                                                                                                                                                                                                    | Optional |
| DEFAULT_COLLECTION       | Default collection option for collection dropdown                                                                                                                                                                                                                                                                                                                                                                                                                                                                             | Optional |
| COLLECTIONS              | Array of strings listing collections to show in dropdown. This is used to filter the collections endpoint from the list fetched from the `STAC_API_URL` defined in the config. Collection property of `id` must be used. If set, only the matched collections will show in the app. If not set, all collections in the STAC API will show in dropdown.                                                                                                                                                                        | Optional |
| SCENE_TILER_URL          | URL for map tiling                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            | Optional |
| SCENE_TILER_PARAMS       | Per-collection configuration of TiTiler `assets`, `color_formula`, `bidx`, `rescale`, `expression`, and `colormap_name` parameters. Example in [config.example.json](config_helper/config.example.json)                                                                                                                                                                                                                                                                                                                       | Optional |
| MOSAIC_MIN_ZOOM_LEVEL    | Minimum zoom level for mosaic view search results. If not set, the default zoom level will be 7.                                                                                                                                                                                                                                                                                                                                                                                                                              | Optional |
| ACTION_BUTTON            | Button text and redirect URL used to link to external website as a prominent call to action. If not set, the button will not be visible. Should be an object with `text` and `url` keys. Example: [config.example.json](config_helper/config.example.json).                                                                                                                                                                                                                                                                   | Optional |
| MOSAIC_TILER_URL         | URL for mosaic tiling. If not set, the View Mode selector will not be visible. The app requires the use of the [NASA IMPACT TiTiler fork](https://github.com/NASA-IMPACT/titiler) as it contains the mosaicjson endpoints needed.                                                                                                                                                                                                                                                                                             | Optional |
| MOSAIC_TILER_PARAMS      | Per-collection configuration of TiTiler mosaic `assets`, `color_formula`, `bidx`, `rescale`, `expression`, and `colormap_name` parameters. Example in [config.example.json](config_helper/config.example.json)                                                                                                                                                                                                                                                                                                                | Optional |
| MOSAIC_MAX_ITEMS         | Maximum number of items in mosaic. If not set, the default max items will be 100.                                                                                                                                                                                                                                                                                                                                                                                                                                             | Optional |
| CONFIG_COLORMAP          | Color map used in low level hex grid search results. Complete list of colormaps are available here: [bpostlethwaite/colormap](https://github.com/bpostlethwaite/colormap). If not set, the default colormap will be "viridis".                                                                                                                                                                                                                                                                                                | Optional |
| BASEMAP_URL              | URL to specify a basemap provider used by the leaflet map. Must be a raster tile provider as vector tiles are not supported. If not set, the default colormap will be `https://tile.openstreetmap.org/{z}/{x}/{y}.png`.                                                                                                                                                                                                                                                                                                       | Optional |
| BASEMAP_DARK_THEME       | Boolean value. If set to `true` or not included in config, a dark theme is applied to the basemap. If set to `false`, the dark theme will not be applied to basemap and the default basemap provider style is used.                                                                                                                                                                                                                                                                                                           | Optional |
| BASEMAP_HTML_ATTRIBUTION | String of HTML markup used to set the attribution for the basemap provider used by the leaflet map. Markup is sanitized prior to render with `DOMPurify` and only is retricted to only allow `html`, `'a' tags`, and `'href'` and `'target'` attributes. Custom attribution will not render if `BASEMAP_URL` is not also set. If not set, the default attribution will be `&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>`. (Note: Raw HTML was used here since attribution is non-standardized.) | Optional |
| SEARCH_BY_GEOM_ENABLED   | If set to `true` search options will render and allow users to draw or upload a geojson file to use as search bounds.                                                                                                                                                                                                                                                                                                                                                                                                         | Optional |
| CART_ENABLED             | If set to `true` cart features will be enabled. These include: rendering cart button in search controls bar, adding cart management buttons to popup results, render buttons in messages to quickly add some or all scenes to cart after search completes.                                                                                                                                                                                                                                                                    | Optional |
| SHOW_BRAND_LOGO          | If set to `true` filmdrop brand logo and clickable hyperlink are rendered at the top right of the UI. If not set or `false`, the logo will not be visible.                                                                                                                                                                                                                                                                                                                                                                    | Optional |
| POPUP_DISPLAY_FIELDS     | Per-collection configuration of popup metadata fields properies to render. Example in [config.example.json](config_helper/config.example.json). Only `Title` field (which maps to the `id` property for STAC items) is rendered if collection used in application but not included in configuration.                                                                                                                                                                                                                          | Optional |
| APP_NAME                 | String value used for html title and anywhere else that the text value for app name is used. If not set, default value of `FilmDrop Console` will be used.                                                                                                                                                                                                                                                                                                                                                                    | Optional |
| APP_FAVICON              | If set, custom application favicon is used instead of default FilmDrop favicon. Favicon file of format `.ico` OR `.png` must be used and file must exist next to config in `/config` of the built deployment directory. Place in `public` directory during local development, but can also be added or adjusted post depolyment. File name in `config.json` must match extactly with file in config, see `config.example.json` for example. If not set or error in config/file, default FilmDrop favicon will be used.        | Optional |
| MAP_ZOOM                 | If set, starting map zoom level is set to this integer value. If not set, default value of `3` will be used.                                                                                                                                                                                                                                                                                                                                                                                                                  | Optional |
| MAP_CENTER               | If set, starting map center point is initialized with this location. If not set, default map location of `[30, 0]` will be used.                                                                                                                                                                                                                                                                                                                                                                                              | Optional |
| LAYER_LIST_ENABLED       | If set to `true`, reference layer list widget is displayed in map controls. NOTE: both `LAYER_LIST_ENABLED` and `LAYER_LIST_SERVICES` must exist in config for reference layer list widget to actually be displayed in the UI. If not set or `false`, reference layer list widget is not rendered.                                                                                                                                                                                                                            | Optional |
| LAYER_LIST_SERVICES      | Defines the services used as reference layers for the map. **Limitations:** Currently only WMS services are supported and only `EPSG:4326` or `EPSG:3857` are supported values for defining crs options. If not set or not formatted correctly, reference layer list widget will either be empty or will not render. Formatting should match example in `config.example.json`.                                                                                                                                                | Optional |
| STAC_LINK_ENABLED        | If set to `true`, STAC Item link will render in Item Details.                                                                                                                                                                                                                                                                                                                                                                                                                                                                 | Optional |
| SHOW_ITEM_AUTO_ZOOM      | If set to `true`, switch will render in `Filters` list to let the user toggle if the map automatically centers on item footprint when selected item is changed. Default when initialized is auto-zoom not enabled, user must opt-in by turning on (choice will persist for app session).                                                                                                                                                                                                                                      | Optional |

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

## Feature Support

Many of the advanced features of FilmDrop-UI rely on behaviors of
[stac-server](https://github.com/stac-utils/stac-server), part of the
FilmDrop family of services.

### Geohex Aggregated View

Support for STAC API [Aggregation Extension](https://github.com/stac-api-extensions/aggregation)
is necessary for the geohex aggregated view. As of September 2023, only stac-server implements
this extension.

The geohex aggregated view requires:

1. All Items that are to be aggregated must have the `proj:centroid` property defined,
2. The aggregation `grid_geohex_frequency` must be advertised by the `/aggregations` endpoint
   for each collection that has Items with the `proj:centroid` property.

### Grid Code Aggregated View

Support for STAC API [Aggregation Extension](https://github.com/stac-api-extensions/aggregation)
is necessary for the grid code aggregated view. At present, only stac-server implements
this extension.

The grid code view requires:

1. All Items that are to be aggregated must have the `grid:code` property defined,
2. The aggregation `grid_code_frequency` must be advertised by the `/aggregations` endpoint
   for each collection that has Items with the `grid:code` property.
3. The `grid:code` prefixes CDEM, DOQQ, MGRS, and WRS2 are supported by default. Any other grid
   code prefixes require customization of the filmdrop-ui application.

### Cloud Cover

The Cloud Cover filter widget is enabled when a Collection's `/queryables` endpoint advertises
it has a queryable named `eo:cloud_cover`. This should be configured for all Collections with the
`eo:cloud_cover`` property defined`.

### SAR

One limitation of the scene and mosaic views is that the assets they display must be consistent
across all items, e.g., if "red", "green", and "blue" are configured as the assets to composite,
then assets with these names must exist across all items in the collection. In the case of a
collection of SAR data, this is frequently not the case. For example, Sentinel-1 scenes have
some combination of assets "vv", "vh", "hv", and "hh". To work around this, the UI searches only
for items with the polarization `VV` present in the `sar:polarizations` property and then the
scene configuration only uses the `vv` asset in rendering.

To support this behavior, the queryable `sar:polarizations` must be advertised by a collection's
`/queryables` endpoint.

### Thumbnails

The thumbnail for a scene is determined by the existence of link with the relation `thumbnail`
for an item. stac-server will always present this relation, but making a request to it may result
in a 404 if no appropriate thumbnail can be determined for an item. stac-server determines the
appropriate thing to do by first looking for an asset with a role of `thumbnail`. If this asset
exists and the href starts with `http`, a 302 redirect is made to that URL. If this asset exists
and has an href starting with `s3://`, the URI is signed using stac-server's AWS credentials and
the pre-signed URL is redirected. For non-public S3 buckets, stac-server must be granted
permissions on that bucket or the pre-signed URL will get an Access Denied error.

### Scene Tiling Configuration

Scene tiling requires describing the form of the data and how titiler should create a single
image from an item.

The configurations include:

- `assets`: one or three assets. If three assets are specified, they will be composited as RGB.
- `color_formula`: the color formula to adjust a composite with
- `bidx`: if a single asset is defined, these indicies are used as the band indicies within that
  image to composite.
- `colormap_name`: the colormap to use for mapping values (typically used for single band)
- `rescale`: the rescale range to apply prior to color mapping (typically used for single band)

### Mosaic Tiling Configuration

Configuration of mosaic tiling is the same as for scene tiling, with the additional constraint
that multi-asset compositing cannot be done, so only as single asset may be specified for the
`assets` list.
