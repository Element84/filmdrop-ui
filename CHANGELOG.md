# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/en/1.0.0/)
and this project adheres to [Semantic Versioning](http://semver.org/spec/v2.0.0.html).

## Unreleased

### Added

- Added initial console log of application deploy version number read from `package.json`

## 5.0.2 - 2024-03-06

### Added

- Added `.gitkeep` to empty config directory so it gets put into version control.

## 5.0.1 - 2024-03-04

### Added

- Added `lint_config.py` helper script to assist in validating `config.json` files.

### Changed

- Moved example config out of public so it doesn't get added to build.
- Update readme for config keys showing as `required` to correctly reflect app run requirements.

### Fixed

- Bug fixed for zoom to collection extent running on every collection dropdown re-render.
- Bug fixed for `select scenes` button not changing to item details tab when clicked.

## 5.0.0 - 2024-02-27

### Added

- Added support for `COLLECTIONS` to be defined in the `config.json` file.
- Run search shortcut added for `SPACE` bar key press.
- Added config option for `SHOW_ITEM_AUTO_ZOOM` to render switch that lets user toggle behavior of map center/zooming automatically on selected scene.
- Added config option for `STAC_LINK_ENABLED` to render link out to item in STAC API when set to `true`.
- Added `results not found message` when search results are empty.

### Changed

- Move to vertical filter and search instead of top filters.
- Change `ADVANCED_SEARCH_ENABLED` in config settings to be `SEARCH_BY_GEOM_ENABLED`.
- Cart component from `stac-selector` effort moved to be in top nav bar.
- Top nav bar and components height reduced.
- Search does not re-run automatically on view mode changed, search button must be clicked or `SPACE` key pressed.
- Results info panel relocated to be sticky to top left of map frame.
- Fetch requests to files in hosted app build directory now use relative path.
- Config parameter for `LAUNCH_URL` renamed to `ACTION_BUTTON` and structure changed to be an object.
- Analyze button moved into top nav.
- Scene count design refactored to reduce size.
- `Images not visible...` message moved to be next to search button in bottom left of map pane.
- Results popup now renders in left panel.
- Tabs added to left panel to switch between results and info panels.
- Refactor of loading indicator to specify when imagery overlay is loading instead vs. search loading.
- Style adjusted for switch to be in line with other UI elements.
- Replace date picker library `DateTimeRangePicker` to use `react-datepicker`.
- Collection range is now always visible in search panel.
- Date Range Picker does not get changed on collection change. Only set on initial load and then manually by user.

### Fixed

- Bug fix that made `DEFAULT_COLLECTION` required instead of optional, per the readme. It is now actually optional.
- Fix bug where grid-code aggregation results didn't render if `grid_code_frequency` included a key that didn't match the expected pattern
- Resolved bug with map tooltip not closing on mouseout that lead to extra tooltip rendering.
- Improved responsiveness for mid-size screens.
- Bug fix for when multiple grid-code grids are selected, bug was only showing one grid-code in results.
- Refactor keyboard shortcut for running search. Changed to use `ctrl+space`.
- Date range format now renders and searches correctly using UTC instead of using local timezone.

### Removed

- Auto-search function has been removed since it's behavior was deemed to be undesirable.
- Publish button and modal from an old demo no longer needed for any projects.
- Collapsible feature search results panel removed.

## 4.4.0 - 2023-12-01

### Fixed

- Update link tag for manifest.json so that it uses basic auth credentials, fixes load when running behind CloudFront with basic auth

### Removed

- Special handling of `grid_code_landsat_frequency` aggregation

## 4.3.0 - 2023-10-13

### Fixed

- resolve security @vitejs/plugin-react@4.0.4 vulnerabilities coming from `babel`

### Changed

- Updated max-height of main logo to be 40px

### Added

- Added config option for applying dark style to custom basemap URL

## 4.2.0 - 2023-10-03

### Changed

- Mosaic tiling parameter `bidx` is now passed as multiple parameters
  (e.g., `bidx=1&bidx=2&bidx=3`) instead of a single comma-delimited value
  (e.g., `bidx=1,2,3`). This is to accomodate a change to titler-mosaicjson
  as of v0.14.0

## 4.1.0 - 2023-09-14

### Added

- Added config option for starting map zoom level
- Added config option for starting map center location
- Added config options for enabling and defining reference map layers (only wms currently supported)

## 4.0.1 - 2023-09-12

### Changed

- Bug fix for grid-code not working properly on map click events.

## 4.0.0 - 2023-08-29

### Added

- Add buttons for: `loading all scenes` and `selecting all scenes on map` to show in popup if more than initial load of 200 scenes is matched.
- Add favicon config setting to allow custom favicon to be set.

### Changed

- Migrate vitest coverage provider to use v8 instead of c8.
- Added cache-busting to config and data asset fetching to prevent caching of stale files.
- Update map attribution to show until user interaction.
- Move app title from env variable to config file for completing build once deploy anywhere approach.
- Removed mention of env variables from README as they are no longer used.

## 3.3.0 - 2023-08-17

### Added

- Cart button to `Add all to cart` & `Add/Remove scene from cart` added to search bar if `CART_ENABLED` set to true in `config.json` (WIP feature)
- Cart items are now shown in layer on map if `CART_ENABLED` set to true in `config.json` and Items exist in cart. (WIP feature)

### Changed

- Map legend updated to always show 'Scenes in Cart' symbology when `CART_ENABLED` set to true in `config.json` and Items exist in cart. (WIP feature)
- PopupResults component updated to allow users to minimize/maximize popup results component content.
- Metadata in `PopupResult` changed to show additional properties about the scene if `POPUP_DISPLAY_FIELDS` set in the `config.json`.
- Bug fix to handle grid aggregations that 'landsat' in the title but `grid-code-frequency` in the properties.

## 3.2.0 - 2023-08-02

### Changed

- SHOW_BRAND_LOGO now defaults to `true`.

### Added

- Added Legend

## 3.1.0 - 2023-07-27

### Changed

- Launch modals have been removed along with the `CF_TEMPLATE_URL` config parameter.
  Instead, the 'Launch Your Own' button will redirect to the URL configured for the
  `LAUNCH_URL` parameter

## 3.0.0

### Changed

- Refactor map code and related files
- Refactor API calls
- Moved config reference from `envSetupVars.js` into `search.jsx`
- Geosearch moved under zoom control and changed to be collapsed
- `VITE_ADVANCED_SEARCH_ENABLED` and `VITE_CART_ENABLED` must be set in `config.js`
- Moved config location from `src/assets/config.js` to `public/config/config.json`
- Refactor config to be a json object instead of separate exported constants
- Changed config key names to remove the word `VITE` (leftover from when they were .env vars)
- Refactor `default.js` to remove dead code and rename vars
- Conditionally render E84 FilmDrop Logo based on config var for `SHOW_BRAND_LOGO`
- Consolidate hex legend into single new legend component

### Fixed

- Map selection and popup now close in unison
- Fix styling of popup results component

### Added

- Added 'thumbnail not found' image placeholder
- Added Config feature flags for Advanced Search Options and Cart
- Added draw boundary feature to allow user to draw polygon on map (WIP)
- When polygon drawn, use as search intersects param instead of map viewport bbox
- Added upload geojson feature to allow users to select a geojson file to add to map
- Reusable System Message component for showing app alerts
- Load `config.json` into redux on app load once instead of direct imports
- Add pre-initialization page to handle and show error (and not render app) if config is missing
- Add `SHOW_BRAND_LOGO` config option to optionally hide brand logo
- Added Hawaii DOQQ grid (for NAIP)
- Add new Legend component for map

### Removed

- Delete `envSetupVars.js` after moving functions and const into other files

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
