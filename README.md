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

| Variable                     | Description                                                                                                                                                                                                                          | Required |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------- |
| PUBLIC_URL                   | URL for the FilmDrop UI. Useful when using a CDN to host application.                                                                                                                                                                | Optional |
| REACT_APP_LOGO_URL           | URL for your custom logo                                                                                                                                                                                                             | Optional |
| REACT_APP_LOGO_ALT           | Alt image description for your custom logo                                                                                                                                                                                           | Optional |
| REACT_APP_DASHBOARD_BTN_URL  | URL for the Dashboard button at the top right of the UI. If not set, the button will not be visible.                                                                                                                                 | Optional |
| REACT_APP_ANALYZE_BTN_URL    | URL for the Analyze button at the bottom left of the UI. If not set, the button will not be visible.                                                                                                                                 | Optional |
| REACT_APP_STAC_API_URL       | URL for STAC API                                                                                                                                                                                                                     | Required |
| REACT_APP_DEFAULT_COLLECTION | Default collection option for collection dropdown                                                                                                                                                                                    | Optional |
| REACT_APP_TILER_URL          | URL for map tiling                                                                                                                                                                                                                   | Required |
| REACT_APP_TILER_PARAMS       | Asset and color formula settings by collection name. Example: `{"sentinel-2-l2a": {"assets":["visual"]}, "landsat-c2-l2": {"assets":["red","green","blue"], "color_formula": "Gamma+RGB+1.7+Saturation+1.7+Sigmoidal+RGB+15+0.35"}}` | Optional |

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
