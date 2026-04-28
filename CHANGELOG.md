# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/en/1.0.0/)
and this project adheres to [Semantic Versioning](http://semver.org/spec/v2.0.0.html).

## Unreleased

### Added

- Added a NumericRangeInputs component for numeric fields that supports unbounded, min-only, and max-only queryables.
- Added unit tests for bbox coordinate rounding/clamping (`mapHelper`) and URL/search param bbox handling (`searchHelper`).
- Added mosaic search caching metadata to track the last mosaic request and top N item IDs for re-use across searches.
- Added STAC error normalization helpers (`stacErrorHelper`) and unit tests for normalized HTTP responses and network failures; oversized error bodies are truncated using `MAX_STAC_ERROR_BODY_CHARS`.
- Added `validateUploadedGeometry` in `searchHelper` and unit tests for upload validation independent of map view and zoom.
- Added unit tests for normalized error handling in search, aggregate, and mosaic STAC client modules.
- Added optional `AbortSignal` support on `SearchService`, `fetchTopItemsForMosaic`, `AggregateSearchService`, and `AddMosaicService`;
  `newSearch` accepts an optional `signal` and forwards it to those calls.
- Added JavaScript config utilities: `npm run config:lint` and `npm run config:migrate`.
- Added strict config validation tests for startup hard-fail on legacy config.

### Changed

- Moved Item pagination buttons from below to above the Item Details content.
- Limited bbox precision to 6 decimals in map bounds and search/URL params; longitude clamped to [-180, 180]. Exported `roundCoord`, `clampAndRoundBbox` for reuse.
- Item Details field grid: column layout set to `minmax(0, 40%) 1fr`, alignment and padding adjusted for clearer spacing and to avoid overflowing text.
- Updated mosaic search flow to fetch a small set of top items for comparison before creating a new mosaic, reducing redundant mosaic tiler requests.
- Prevented `newSearch` from clearing map layers and results when running in mosaic view where an existing mosaic image layer is being reused.
- Centralized STAC request headers in `buildStacRequestHeaders` (`stacRequest`) for search, aggregate, and mosaic top-items prefetch requests.
- GeoJSON upload flow: preflight STAC search validates the uploaded geometry; on success the AOI is added to the map and `newSearch` runs; inline `Alert` for normalized errors with scrollable details;
  modal flex layout, `max-height`, double-submit guard (`submissionInFlightRef`); **Cancel** clears Redux AOI and the draw layer and **aborts** in-flight upload/search requests.
  **Aborted** requests do not apply search results. A failed post-upload search clears the AOI so it does not drive later queries
  (geometry may appear briefly before the main search completes). `newSearch` still runs synchronously up to URL/layer setup before the first `await`;
  cancellation stops network completion and result application, not full URL rollback.
- STAC client modules: return structured error objects and log with the same `contextLabel` passed into normalization (per-service defaults: search, aggregate, mosaic, mosaic top-items prefetch).
- Enforced modern config format at runtime; legacy config keys now fail startup with migration guidance.
- Replaced Python-based config lint/migrate helper workflow with Node CLI scripts.
- Hardened config migration/lint policy to fail mixed-format configs (`COLLECTIONS_CONFIG` + legacy keys) instead of mutating ambiguous input.
- Updated docs/examples to use canonical `COLLECTIONS_CONFIG.visualizations.default` rendering configuration.

### Fixed

- Corrected the multi-select filter component to properly lose focus after deleting chips.
- Fixed map auto-zoom when loading items via `/:collectionId/:itemId` URLs.
- Fixed search and mosaic requests sending invalid or undefined bbox when viewport bounds are missing; URL bbox param and zoom-to-extent now handle null bounds safely.
- Resolve dependency vulnerabilities: DOMPurify XSS (GHSA-v2wj-7wpq-c8vv), Rollup path
  traversal (GHSA-mw96-cpmx-2vgc); upgrade `dompurify` to ^3.3.2, override `rollup` to ^4.59.0.
- Fixed repeated mosaic layer recreation on identical mosaic searches by reusing the existing mosaic image layer when the request parameters and top items have not changed.
- Dismissing the GeoJSON upload modal no longer leaves a staged AOI driving later searches; in-flight fetches are aborted so late completions do not repopulate results after **Cancel**.
- Non-upload flows do not inherit upload-specific error copy; mosaic prefetch uses a dedicated summary to avoid redundant generic search messaging.

## v7.1.0-pre - 2026-01-15

### Added

- Added `TILER_SETTINGS`, with properties `URL_SUBST`, `URL_SUBST_FIND`, `URL_SUBST_REPLACE`, to enable optional string substitution in TiTiler request URLs
- Added dynamic queryable-based filter generation with support for range sliders, multi-selects, and text inputs
- Added `queryableFilters` to `COLLECTIONS_CONFIG` for per-collection queryable allow-lists
- Added `$ref` resolution in queryables service for dereferencing external JSON schemas
- Added reusable UI components: `ButtonGroup`, `Card`, `Dropdown`, `MultiSelect`, `TextField`, `RangeSliderWithInputs`
- Added `useDebouncedCallback` and `useRenderableQueryables` hooks
- Added URL state management: collection and item selection use path segments (`/:collectionId/:itemId`), all other state persisted in URL search params for shareable links
- Added `useUrlNavigate` hook for components to update URL params (`setItem`, `clearItem`, `setTab`, `setViz`)
- Added `useUrlInitialize` hook for restoring full app state (collection, dates, filters, visualization, selected item) from URL on load
- Added `useUrlStateSync` hook for ongoing URL → Redux sync (merges path params + search params)
- Added `urlParamHelper` utilities for serializing/deserializing queryable filters to/from URL params
- Added unit tests for URL routing utilities, `useUrlInitialize`, and `useUrlStateSync`
- Added `AccordionStateContext` to persist Item Details accordion expansion state across tab switches, new searches, and item navigation within the same collection

### Changed

- Updated tile URL structure to support OGC API - Tiles conformant tilers (TiTiler 1.x+, other OGC-compliant tilers).
  Tile paths now include TileMatrixSetId: `/stac/tiles/{tileMatrixSetId}/{z}/{x}/{y}`. Currently hardcoded to `WebMercatorQuad`.
- Restricted visualization selector to the sidebar
- Unified control heights, border radii, padding, and font styling across components
- Refactored `Search` component with extracted `AreaOfInterestSelector` and `QueryableFilters`
- Replaced `react-datepicker` with `@mui/x-date-pickers`
- Refactored `router.jsx` to use path-based routes for collection/item selection and `validateSearch` for search param parsing
- Visualization selection now routed through URL params instead of direct Redux dispatch
- Consolidated store reads in `newSearch` to a single upfront snapshot to prevent stale-state bugs
- Replaced `JSON.stringify` with `shallowEqual` for queryable filter comparison
- Fixed stale state and race condition in `fetchAndDisplayItem`
- Fixed falsy value handling (`0`, `false`) in URL param sync default logic
- Skipped redundant API call when selected item is already in search results
- Changed the Search button to a split button with a Clear action that resets filters, URL params, and map view
- Changed tab rendering to keep both Search and Item Details mounted (hidden via CSS) instead of unmounting the inactive tab, preserving component state and avoiding unnecessary re-renders
- Set zoom level on initial load of the app such that there are not blank bands above and below the map
- Moved visualization selector to the Item Details tab

### Removed

- Removed `CloudSlider` component (replaced by queryable-based filters)
- Removed `VisualizationList` component (replaced by `VisualizationDropdown`)
- Removed `FieldInfoIcon` component
- Removed `routerHelper.js` (replaced by `urlParamHelper.js`)
- Removed unused `setMapView` from `useUrlNavigate`
- Removed dead `hasLeftPanelTabChanged` state and dual dispatch in `mapHelper`
- Removed `SEARCH_BY_GEOM_ENABLED` config option (now always enabled)

## 7.0.1 - 2026-01-14

### Changed

- Vite build config - base path changed to absolute (`/`) instead of relative (`./`)

## 7.0.0 - 2026-01-09

### 🚀 Major Features

- **Direct URL Routing:** Added TanStack Router integration. Users can now share deep links to specific items
  (e.g., `/item/{collection}/{id}`), which persist state, visualization selection, and authentication.

- **Zero-Config & Auto-Discovery:**
  - **Collections:** Added `autoConfigureCollections()` to fetch collections directly from the STAC API.

  - **Rendering:** Added `autoConfigureRendering()` to read the [STAC Render Extension](https://github.com/stac-extensions/render).
    If `STAC_API_URL` and `SCENE_TILER_URL` are set, visualizations are automatically generated.

  - **Defaults:** Major config parameters (Basemaps, Zoom levels, Export settings) now have sensible defaults, allowing for minimal configuration files.

- **New Visualization Engine:** Replaced `sceneTilerParams` with a robust `visualizations` dictionary.
  This supports multiple rendering presets (e.g., True Color, NDVI) and enables the new UI Visualization Selector.

### ✨ UI & UX Enhancements

- **Enhanced Details Panel:** Completely refactored the details pane using React components (replacing unsafe HTML strings) for better security and performance.

- **Smart Asset Grouping:** Assets are now automatically grouped by MIME type/role (e.g., Data, Metadata). Thumbnails are excluded from the file list to reduce clutter.

- **Grid & Field Discovery:** Added intelligent detection for MGRS, WRS, and UTM grid codes, plus strict ISO 8601 date formatting.

- **STAC Links Section:** New dedicated section for STAC links (License, Canonical, derived_from) with "Copy to Clipboard" functionality and type icons.

- **Unified View Mode:** Consolidated view switching into a single selector (Hex, Grid, Scene, Mosaic) with zoom-dependent auto-switching.

### 🛠 Configuration & Developer Experience

- **Config Consolidation:** Introduced `COLLECTIONS_CONFIG` to consolidate all collection-specific settings (`sceneTilerParams`, `mosaicTilerParams`, `popupDisplayFields`) into one structure.

- **STAC API Client:** Added a new internal client library for standardized API interaction, conformance checking, and authentication management.

- **Security:** Implemented `DOMPurify` for strict sanitization of field values to prevent XSS.

- **Maintenance:** Migrated from `pre-commit` to `Husky` for git hooks.

### 🐛 Bug Fixes

- **Security:** Fixed XSS vulnerabilities by removing `dangerouslySetInnerHTML` usage in popup results.

- **Mosaic Rendering:** Fixed a critical bug in `constructMosaicAssetVal()` that mutated Redux state and caused crashes during mosaic searches.

- **Stability:** Fixed duplicate `rescale` parameters in TiTiler requests and handled whitespace-only URL configurations gracefully.

- **Auth:** Fixed an issue where closing an error alert would inadvertently log the user out.

### ⚠️ Deprecations & Breaking Changes

- **Renamed:** `sceneTilerParams` is now `visualizations`.

- **Deprecated:** Global params `SCENE_TILER_PARAMS`, `MOSAIC_TILER_PARAMS`, `POPUP_DISPLAY_FIELDS`, and `DEFAULT_COLLECTION` are deprecated in favor of the unified `COLLECTIONS_CONFIG`.

- **Removed:** `LAYER_LIST_ENABLED` (now auto-detected based on service presence).

## 6.1.0 - 2025-09-25

### Changed

- Improves Presentation of STAC Search Results. ([441](https://github.com/Element84/filmdrop-ui/pull/441))
- Resolves moderate vulnerabilities in npm packages
  - Upgrades `vite` from 5.x to 7.17
    - and associated peer deps
  - Upgrades `remark-preset-lint-markdown-style-guide` from 5.1.3 to 6.0.1
    - Triggered a config change for `remark-lint-list-item-indent` value
  - Upgrades `dompurify` from 3.2.4 to 3.2.6
  - Upgrades `h3-js` from 4.1.0 to 4.2.1
  - Upgrades `react-tooltip` from 5.26.3 to 5.29.1

## 6.0.0 - 2025-08-25

### Added

- Added config option `MAP_ZOOM_MAX` to limit map zooming. ([413](https://github.com/Element84/filmdrop-ui/pull/413))
- Added config option `TILE_LAYER_PARAMS` to allow per-collection layer tiling parameters for leaflet. ([413](https://github.com/Element84/filmdrop-ui/pull/413))
- Added dark/Light theme switching ability. ([434](https://github.com/Element84/filmdrop-ui/pull/434))

### Fixed

- Cloud slider not expanding to fill available space. ([416](https://github.com/Element84/filmdrop-ui/pull/416))

### Changed

- Update packages per Snyk and Dependabot. ([417](https://github.com/Element84/filmdrop-ui/pull/417))
- Correct minor README.md errors. ([415](https://github.com/Element84/filmdrop-ui/pull/415))
- Resolve package vulnerabilities. ([415](https://github.com/Element84/filmdrop-ui/pull/415))
- Remove the `upgrade npm` step in the CI `test` job to avoid compatibility problems between the version of Node specified by the `.nvmrc` file and
  the latest `npm` version. ([415](https://github.com/Element84/filmdrop-ui/pull/415))
- ⚠️ **BREAKING CHANGE:** Replaced the configuration options `BASEMAP_URL`,
  `BASEMAP_DARK_THEME`, and `BASEMAP_HTML_ATTRIBUTION` with a single `BASEMAP` object
  for clean basemap configuration that supports optional dark/light mode theme
  switching. See the [README](./README.md) for the new `BASEMAP` object structure.
  ([434](https://github.com/Element84/filmdrop-ui/pull/434))
- ⚠️ **BREAKING CHANGE:** Replaced the boolean configuration option `SHOW_BRAND_LOGO` with
  a `BRAND_LOGO` object for clean configuration that supports optional dark/light mode
  theme switching and removes the hard-coded link href and title. See the
  [README](./README.md) for the new `BRAND_LOGO` object structure.
  ([434](https://github.com/Element84/filmdrop-ui/pull/434))

## 5.7.1 - 2024-09-24

### Added

- Client-side validation to login form fields

### Fixed

- User experience when re-authenticating due to token expiration or unauthorized request

### Changed

- Resolves moderate vulnerabilities in npm packages
  - Upgrades `@typescript-eslint/eslint-plugin` from 6.5 to 7.18
  - Upgrades `@typescript-eslint/parser` from 6.5 to 7.18
  - Upgrades `vite` from 5.1.4 to 5.1.8
  - Removes `@types/vite-plugin-react-svg`

## 5.7.0 - 2024-08-07

### Added

- Simple export feature to allow exporting search results as geojson

### Changed

- Refactor call to action button to reduce prominence and match export button size

### Fixed

- bump version in `package-lock.json` file ot match `package.json`

## 5.6.0 - 2024-08-02

### Added

- Added optional login feature
- Added optional config for ignoring aggregations feature if not supported by the STAC API

### Fixed

- Resolve high vulnerabilities in npm packages
- Fix bug with not showing search result count when Matched is not returned from a STAC API
- Changes from MUI Box to use a Stack component to fix build/rendering bug

### Changed

- Alerts of type `error` now force logout when encountered
- Alerts of type `warning` are used for non logout warnings shown to users

## 5.5.0 - 2024-05-28

### Added

- Support for scene and mosaic tiling `colormap` configuration.

## 5.4.0 - 2024-05-16

### Fixed

- Another instance of STAC API Item link using the first link in the links array,
  instead of looking up the "self" relation link by "rel" value.

## 5.3.0 - 2024-05-14

### Changed

- API calls via `fetch` now include configuration for including authentication.
  This can be changed with the config FETCH_CREDENTIALS, which defaults to the
  browser default of `same-origin`.

## 5.2.0 - 2024-05-08

### Fixed

- UI no longer throws an error if the STAC API does not support a queryables endpoint.
- STAC API Item link used the first link in the links array, instead of looking
  up the "self" relation link by "rel" value

## 5.1.0 - 2024-04-10

### Added

- Added initial console log of application deploy version number read from `package.json`
- Add support for `nodata` to tiling configurations.

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

- Move mosaic-specific tiler parameters (`mosaic_asset` and `mosaic_color_formula`) into REACT_APP_MOSAIC_TILER_PARAMS (new),
  and rename them to `assets` and `color_formula` to align with scene view tiler parameters.
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
