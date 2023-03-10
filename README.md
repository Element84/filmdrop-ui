# FilmDrop UI

- [FilmDrop UI](#filmdrop-ui)
  - [Summary](#summary)
  - [Running](#running)
    - [Environment Files](#environment-files)
    - [Links](#links)
  - [Scripts](#scripts)
    - [`npm start`](#npm-start)
    - [`npm test`](#npm-test)
    - [`npm run build`](#npm-run-build)
    - [`npm run eject`](#npm-run-eject)

## Summary

FilmDrop UI is a browser-based interface for displaying results from a STAC API. Additional information can be found in the [CHANGELOG](CHANGELOG.md).

## Running

### Environment Files

For local development, you should create an `.env` file with the appropriate configuration outlined in the table below.
The file `.env.example` is included in this repository as a representative file.

| Variable                     | Description                                                                                                                                                                                                                       | Required |
| ---------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- |
| PUBLIC_URL                   | URL for the FilmDrop UI. Useful when using a CDN to host application.                                                                                                                                                             | Optional |
| REACT_APP_APP_NAME           | Name for this app                                                                                                                                                                                                                 | Optional |
| REACT_APP_LOGO_URL           | URL for your custom logo                                                                                                                                                                                                          | Optional |
| REACT_APP_LOGO_ALT           | Alt image description for your custom logo                                                                                                                                                                                        | Optional |
| REACT_APP_DASHBOARD_BTN_URL  | URL for the Dashboard button at the top right of the UI. If not set, the button will not be visible.                                                                                                                              | Optional |
| REACT_APP_ANALYZE_BTN_URL    | URL for the Analyze button at the bottom left of the UI. If not set, the button will not be visible.                                                                                                                              | Optional |
| REACT_APP_SHOW_PUBLISH_BTN   | Flag for displaying the Publish button at the bottom left of the UI. Setting to `true` will display the button, any other value will not display the button. Default is to not display the button.                                | Optional |
| REACT_APP_STAC_API_URL       | URL for STAC API                                                                                                                                                                                                                  | Required |
| REACT_APP_API_MAX_ITEMS      | Maximum number of items requested from API. If not set, the default max items will be 200.                                                                                                                                        | Optional |
| REACT_APP_DEFAULT_COLLECTION | Default collection option for collection dropdown                                                                                                                                                                                 | Optional |
| REACT_APP_TILER_URL          | URL for map tiling                                                                                                                                                                                                                | Required |
| REACT_APP_TILER_PARAMS       | Per-collection configuration of TiTiler `assets`, `color_formula`, `bidx`, `mosaic_asset`, and `mosaic_color_formula` parameters. Example in [.env.example](.env.example)                                                         | Optional |
| REACT_APP_MIN_ZOOM_LEVEL     | Minimum zoom level for search results. If not set, the default zoom level will be 7.                                                                                                                                              | Optional |
| REACT_APP_CF_TEMPLATE_URL    | CloudFormation Template URL used to create a new stack. If not set, the Launch Your Own button will not be visible.                                                                                                               | Optional |
| REACT_APP_MOSAIC_TILER_URL   | URL for mosaic tiling. If not set, the View Mode selector will not be visible. The app requires the use of the [NASA IMPACT TiTiler fork](https://github.com/NASA-IMPACT/titiler) as it contains the mosaicjson endpoints needed. | Optional |
| REACT_APP_MOSAIC_MAX_ITEMS   | Maximum number of items in mosaic. If not set, the default max items will be 100.                                                                                                                                                 | Optional |

### Links

Static files are built with `npm run build` then moved to overwrite files in existing S3 buckets.

## Scripts

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

This project contains several NPM scripts for common tasks.

### `npm start`

Runs the app for local dev: at [http://localhost:3000](http://localhost:3000)

This uses the env vars found in `.env`.

### `npm test`

Launches the test runner in the interactive watch mode.

### `npm run build`

This builds using the env vars found in `.env`.

Builds the app for production to the `build` folder.

### `npm run eject`

Standard usage of eject script if needed (**warning! can't go back**): [npm run eject](https://create-react-app.dev/docs/available-scripts/#npm-run-eject).
