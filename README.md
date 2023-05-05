# FilmDrop UI

- [FilmDrop UI](#filmdrop-ui)
  - [Summary](#summary)
  - [Running](#running)
    - [Environment Files](#environment-files)
    - [Links](#links)
  - [Scripts](#scripts)
    - [`npm start`](#npm-start)
    - [`npm test`](#npm-test)
    - [`prod build`](#prod-build)
    - [`npm run coverage`](#npm-run-coverage)
    - [`npm run serve`](#npm-run-serve)

## Summary

FilmDrop UI is a browser-based interface for displaying results from a STAC API. Additional information can be found in the [CHANGELOG](CHANGELOG.md).

## Running

### Environment Files

For local development, you should create a `./public/config.js` file with the appropriate configuration outlined in the table below.
The file `/public/config.example.js` is included in this repository as a representative file.

| Variable                    | Description                                                                                                                                                                                                                       | Required |
| --------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- |
| PUBLIC_URL                  | URL for the FilmDrop UI. Useful when using a CDN to host application.                                                                                                                                                             | Optional |
| VITE_APP_NAME               | Name for this app                                                                                                                                                                                                                 | Optional |
| VITE_LOGO_URL               | URL for your custom logo                                                                                                                                                                                                          | Optional |
| VITE_LOGO_ALT               | Alt image description for your custom logo                                                                                                                                                                                        | Optional |
| VITE_DASHBOARD_BTN_URL      | URL for the Dashboard button at the top right of the UI. If not set, the button will not be visible.                                                                                                                              | Optional |
| VITE_ANALYZE_BTN_URL        | URL for the Analyze button at the bottom left of the UI. If not set, the button will not be visible.                                                                                                                              | Optional |
| VITE_SHOW_PUBLISH_BTN       | Flag for displaying the Publish button at the bottom left of the UI. Setting to `true` will display the button, any other value will not display the button. Default is to not display the button.                                | Optional |
| VITE_STAC_API_URL           | URL for STAC API                                                                                                                                                                                                                  | Required |
| VITE_API_MAX_ITEMS          | Maximum number of items requested from API. If not set, the default max items will be 200.                                                                                                                                        | Optional |
| VITE_DEFAULT_COLLECTION     | Default collection option for collection dropdown                                                                                                                                                                                 | Optional |
| VITE_SCENE_TILER_URL        | URL for map tiling                                                                                                                                                                                                                | Required |
| VITE_SCENE_TILER_PARAMS     | Per-collection configuration of TiTiler `assets`, `color_formula`, `bidx`, `rescale`, `expression`, and `colormap_name` parameters. Example in [config.example.js](./public/config.example.js)                                    | Optional |
| VITE_MOSAIC_MIN_ZOOM_LEVEL  | Minimum zoom level for mosaic view search results. If not set, the default zoom level will be 7.                                                                                                                                  | Optional |
| VITE_CF_TEMPLATE_URL        | CloudFormation Template URL used to create a new stack. If not set, the Launch Your Own button will not be visible.                                                                                                               | Optional |
| VITE_MOSAIC_TILER_URL       | URL for mosaic tiling. If not set, the View Mode selector will not be visible. The app requires the use of the [NASA IMPACT TiTiler fork](https://github.com/NASA-IMPACT/titiler) as it contains the mosaicjson endpoints needed. | Optional |
| VITE_MOSAIC_TILER_PARAMS    | Per-collection configuration of TiTiler mosaic `assets`, `color_formula`, `bidx`, `rescale`, `expression`, and `colormap_name` parameters. Example in [config.example.js](./public/config.example.js)                             | Optional |
| VITE_MOSAIC_MAX_ITEMS       | Maximum number of items in mosaic. If not set, the default max items will be 100.                                                                                                                                                 | Optional |
| VITE_SEARCH_MIN_ZOOM_LEVELS | Per-collection configuration for minimum zoom levels needed for grid code aggregated results (medium zoom level) and single scene search results (high zoom level). Example in [config.example.js](/public/config.example.js)     | Optional |
| VITE_COLORMAP               | Color map used in low level hex grid search results. Complete list of colormaps are available here: [bpostlethwaite/colormap](https://github.com/bpostlethwaite/colormap). If not set, the default colormap will be "viridis".    | Optional |

### Links

Static files are built with `./prod_build.sh` then moved to overwrite files in existing S3 buckets.

## Scripts

This project contains several NPM scripts for common tasks.

### `npm start`

Runs the app locally at <http://localhost:5173>

This uses the env vars found in `./public/config.js`.

### `npm test`

Launches the test runner.

### `prod build`

Running `./prod_build.sh` will create a build using the env vars found in `./public/config.js`.

The result will appear in the `build` folder.

The `config.js` file will not be minimized, and can be replaced dynamically during deployment.

### `npm run coverage`

Runs tests and outputs a coverage report into console.

### `npm run serve`

Starts a local web server that serves the built solution from `build` folder.
