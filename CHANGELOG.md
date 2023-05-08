# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/en/1.0.0/)
and this project adheres to [Semantic Versioning](http://semver.org/spec/v2.0.0.html).

## Unreleased - TBD

## Fixed

- Datetime search now searches from midnight UTC on the start date to immediately before midnight
  on the day after the end date (i.e., the last instant on the end date)

## v1.1.0 - TBD

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
- **Migrated from '.env' to './assets/config.js'**
  - Config vars are now in JSON format
  - You can specify new values when running locally, or during the build process

### Added

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
