# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/en/1.0.0/)
and this project adheres to [Semantic Versioning](http://semver.org/spec/v2.0.0.html).

## 2.0.2 - 2023-05-18

### Fixed

- Publish button was not displaying with boolean true value set.

## 2.0.1 - 2023-05-17

### Fixed

- Legend for geohex aggregation now displays.

## 2.0.0 - 2023-05-16

### Changed

- Rename REACT_APP_MIN_ZOOM_LEVEL to REACT_APP_MOSAIC_MIN_ZOOM_LEVEL
- **Migrate from create-react-app to vite:**
  - Changed npm start, build, and test commands in package.json
  - Rename REACT_APP\_ in .env's to be VITE\_
  - Moved index.html into project root
  - Rename index.html link references, title and src
  - Updated readme to remove cra references
  - Renamed react component files to be .jsx instead of .js
  - Updated leaflet css import path
  - Refactor inputs to `getTilerParams` to reference full .env object before passing into function
  - Change from 'require' to ES6 module import in `colormap.js`
- Pre-commit hook for test changed to use test-pre-commit with `--run` flag
- Bump vite-plugin-svgr from 2.4.0 to 3.2.0
- **Migrated from '.env' to './assets/config.js'**
  - Config vars are now in JSON format
  - You can specify new values when running locally, or during the build process
- Update precision for hex geo-aggregate to be defined per zoom levels instead of set based on a quotient
- Change default styles for gridCode and footprint layers to be defined in `Search.jsx`
- Updated leaflet basemap to try to read from config if set, else default to OpenStreetMap with css darkmode

### Fixed

- Datetime search now searches from midnight UTC on the start date to immediately before midnight
  on the day after the end date (i.e., the last instant on the end date)
- Set ref for `zoomLevelRef.current` on initial map load

### Added

- For high DPI screens (e.g., Retina), scene image tiling is now done at scale of 2 (previously, scale of 1).
- Grid code aggregated results view at medium zoom levels
- Toggle to enable auto-search or manual search with Search Button
- Geo hex aggregated results view at low zoom levels
- Env variable REACT_APP_SEARCH_MIN_ZOOM_LEVELS
- Env variable REACT_APP_COLORMAP
- **Migrate from create-react-app to vite:**
  - Added `vite.config.js`
  - Added eslint-plugin-jsx-a11y
  - Vitest and related testing library libs
  - Added NPM `coverage` and `serve` commands
- Added types for react, react-dom, testing-library\_\_jest-dom, and vite-plugin-react-svg
- Set coverage provider to use c8
- Added setup under test in `vite.config.ts`
- Added `tsconfig.node.json`
- Added reference and excludes sections in `tsconfig.json`
- Reducer to reset redux state back to initialization state for use between tests
- Test ids added for `Content` and `PageHeader` components
- Example tests for `App.jsx` in `App.test.jsx`
- Example test for `PageHeader.jsx` in `PageHeader.test.jsx`
- Added dompurify library for sanitizing before rendering configurable HTML

### Removed

- Types declaration from `tsconfig.json`
- Tests directory from include section in `tsconfig.json`

## v1.1.0 - 2023-05-05

### Added

- Grid code aggregated results view at medium zoom levels
- Toggle to enable auto-search or manual search with Search Button
- Geo hex aggregated results view at low zoom levels

## v1.0.0 - 2023-03-24

### Changed

- Move the viewport to include collection spatial bounds if it is outside those bounds
- Set the date picker to the collection temporal date range if date picker is outside that range

### Added

- Search by geolocation

## v0.5.0 - 2023-03-20

### Changed

- Move mosaic-specific tiler parameters (`mosaic_asset` and `mosaic_color_formula`) into REACT_APP_MOSAIC_TILER_PARAMS (new), and rename them to `assets` and `color_formula` to align with scene view tiler parameters.
- Rename REACT_APP_TILER_URL to REACT_APP_SCENE_TILER_URL
- Rename REACT_APP_TILER_PARAMS to REACT_APP_SCENE_TILER_PARAMS

### Added

- Env variable REACT_APP_MOSAIC_TILER_PARAMS
- `rescale`, `colormap_name`, and `expression` tiler parameters

## v0.4.0 - 2023-03-14

### Changed

- Env variable REACT_APP_TILER_PARAMS key `asset_bidx` changed to `bidx`. The format is
  now just a comma-separated list of indexes (e.g., `1,2,3`) rather than of the form `asset-name|1,2,3`

### Added

- Add mosaic view mode if REACT_APP_MOSAIC_TILER_URL (new) is defined
- Env variable REACT_APP_MOSAIC_MAX_ITEMS
- `mosaic_asset` and `mosaic_color_formula` tiler parameters
- Env variable REACT_APP_API_MAX_ITEMS

## Fixed

- Single-file, multi-band mosaic compositing (e.g., NAIP) now works

## v0.3.0 - 2023-03-06

### Changed

- Rename env variable REACT_APP_TITILER to REACT_APP_TILER_URL
- Rename env variable REACT_APP_STAC_API_ENDPOINT to REACT_APP_STAC_API_URL
- Rename env variable REACT_APP_COLLECTIONS to REACT_APP_DEFAULT_COLLECTION
- Rename env variable REACT_APP_DASHBOARD_LINK to REACT_APP_DASHBOARD_BTN_URL
- Rename env variable REACT_APP_ANALYZE_LINK to REACT_APP_ANALYZE_BTN_URL
- Make date/time field required
- Date function to calculate the last 2 weeks
- Make REACT_APP_MIN_ZOOM_LEVEL optional
- Improve use of MIN_ZOOM constant
- Enable cloud cover dependency based on collection

### Added

- Env variable PUBLIC_URL
- Env variable REACT_APP_LOGO_URL
- Env variable REACT_APP_LOGO_ALT
- Env variable REACT_APP_TILER_PARAMS
- Collection dropdown to Search that is dynamically populated from API
- Error indicators for UI elements
- Support for Landsat thumbnail preview
- Functionality for custom Logo and alt description
- Env variable REACT_APP_SHOW_PUBLISH_BTN
- FilmDrop - Element 84 logo
- Minimum zoom level for search
- Env variable REACT_APP_MIN_ZOOM_LEVEL
- Add support for `asset_bidx` tiler configuration
- Env variable REACT_APP_CF_TEMPLATE_URL
- Env variable REACT_APP_APP_NAME

### Removed

- Remove BBOX button
- Make Publish button configurable in env variable
- Remove time from date range
- Remove Search button

## v0.2.0 - 2023-Jan-13

- Start of changelog
