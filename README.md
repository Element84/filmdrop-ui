# FilmDrop UI

> A modern, browser-based interface for exploring and visualizing STAC API catalogs

[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](LICENSE)

FilmDrop UI is a powerful web application for searching, visualizing, and interacting with
geospatial imagery catalogs through STAC (SpatioTemporal Asset Catalog) APIs. It
provides multiple visualization modes including aggregated views, mosaics, and
individual scenes with advanced filtering and export capabilities.

Check out
[FilmDrop-UI in action with Earth-Search](https://console.earth-search.aws.element84.com/).

![Sentinel-2 L2A Scene View](screenshots/s2-hex-aggregation.png)

## 📋 Table of Contents

- [✨ Key Features](#key-features)
- [🚀 Quick Start](#quick-start)
- [📖 Documentation](#documentation)
- [🎯 Configuration Examples](#configuration-examples)
- [📸 Screenshots](#screenshots)
- [🏗️ Architecture](#architecture)
- [🤝 Contributing](#contributing)
- [📚 Related Projects](#related-projects)
- [📄 License](#license)

## ✨ Key Features

- **🎨 Visualization**
  - Scene View - Individual imagery footprints and tile rendering with TiTiler
  - Mosaic View - Seamless imagery mosaics using TiTiler
  - Hex Aggregation - H3 geohex-based data density visualization
  - Grid Aggregation - Grid code (MGRS, WRS2) based aggregation
  - Customizable color formulas and band combinations

- **🔍 Search**
  - Date/time range filtering
  - Dynamic property filtering (based on collection queryables)
  - Draw or upload GeoJSON search bounds
  - Interactive map with Leaflet
  - Light/dark theme support

- **⚙️ Auto-Configuration**
  - Automatic collection discovery from STAC API with include/exclude filters
  - Automatic rendering configuration using STAC Render Extension (when TiTiler is available)
  - Minimal configuration required - works out-of-the-box with most STAC catalogs
  - Sensible defaults for common parameters

- **🔗 Direct Linking**
  - Share URLs to specific STAC items
  - Browser back/forward navigation
  - Bookmark scenes for later reference

## 🚀 Quick Start

### Prerequisites

- Node.js 20+ and npm 10+
- A STAC API endpoint
- (Optional) TiTiler instance for imagery visualization

```bash
# Clone the repository
git clone https://github.com/Element84/filmdrop-ui.git
cd filmdrop-ui

# Install dependencies
npm install

# Create configuration file
cp config_helper/config-new-format-example.json public/config/config.json

# Edit configuration (at minimum, set STAC_API_URL)
nano public/config/config.json

# Start development server
npm start

# Application available at http://localhost:5173
```

**For production deployment:**

```bash
# Create production build
npm run build

# Build output in ./build directory
# Deploy contents to web server
```

## 📖 Documentation

- **[Configuration Guide](CONFIGURATION.md)** - Complete configuration reference
  with migration guide
- **[Changelog](CHANGELOG.md)** - Version history and changes

### Configuration Quick Reference

Create `public/config/config.json` (development) or `build/config/config.json` (production):

```json
{
  "STAC_API_URL": "https://your-stac-api.com",
  "BASEMAP": {
    "url": "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
    "attribution": "&copy; OpenStreetMap"
  },
  "COLLECTIONS_CONFIG": {
    "your-collection-id": {
      "visualizations": {
        "default": {
          "assets": ["red", "green", "blue"]
        }
      },
      "sceneMinZoom": 7
    }
  }
}
```

### STAC API Requirements

Some FilmDrop features require specific STAC API extensions:

- **Aggregation Views** -
  [Aggregation Extension](https://github.com/stac-api-extensions/aggregation)
  - Hex view requires items with `proj:centroid` property
  - Currently supported by [stac-server](https://github.com/stac-utils/stac-server) and stac-fastapi-elasticsearch-opensearch
  - The aggregation `centroid_geohex_grid_frequency` or `grid_geohex_frequency` (Deprecated) must be advertised by the `/aggregations` endpoint

- **Grid Code Aggregation** - Custom `grid:code` property
  - Items must include grid identifier (e.g., MGRS, WRS2)

- **Dynamic Property Filtering** - Requires a [OGC API Queryables](https://docs.ogc.org/is/19-079r2/19-079r2.html#queryables) endpoint
  - FilmDrop auto-discovers filterable properties from each collection's queryables schema
  - Supported filter types: range sliders (numeric), multi-select (enums), text and numeric inputs
  - Use `queryableFilters` in `COLLECTIONS_CONFIG` to limit which properties appear as filters

- **Automatic Rendering** -
  [Render Extension](https://github.com/stac-extensions/render) (Optional)
  - When `SCENE_TILER_URL` is configured, FilmDrop will automatically configure
    visualization
  - Collections with the `renders` extension will have TiTiler parameters
    auto-configured
  - Eliminates need to manually configure `visualizations.default` for each collection

See [CONFIGURATION.md](CONFIGURATION.md) for detailed feature configuration.

### 📦 Config Format Evolution

FilmDrop UI evolved its configuration format to reduce repetition and improve maintainability. Legacy config keys are not auto-migrated at runtime.
Use the config tooling before startup:

- `npm run config:lint -- public/config/config.json`
- `npm run config:migrate -- --input public/config/config.json --output public/config/config.json.migrated`

See the [Configuration Migration Guide](CONFIGURATION.md#migration-guide) for details.

## 🎯 Configuration Examples

### Basic Setup

Minimal configuration for viewing a single collection:

```json
{
  "STAC_API_URL": "https://earth-search.aws.element84.com/v1",
  "BASEMAP": {
    "url": "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
    "attribution": "&copy; OpenStreetMap"
  },
  "COLLECTIONS_CONFIG": {
    "sentinel-2-l2a": {
      "sceneMinZoom": 7
    }
  }
}
```

### With Imagery Visualization

Add TiTiler for on-the-fly tile generation. Note that `assets` will be auto-configured
based on the collection's STAC metadata if not specified:

```json
{
  "STAC_API_URL": "https://earth-search.aws.element84.com/v1",
  "SCENE_TILER_URL": "https://titiler.xyz",
  "BASEMAP": {
    "url": "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
    "attribution": "&copy; OpenStreetMap"
  },
  "COLLECTIONS_CONFIG": {
    "sentinel-2-l2a": {
      "visualizations": {
        "default": {
          "assets": ["red", "green", "blue"],
          "color_formula": "Gamma+RGB+3.2+Saturation+0.8"
        }
      },
      "sceneMinZoom": 7
    }
  }
}
```

### Multiple Collections

```json
{
  "COLLECTIONS_CONFIG": {
    "sentinel-2-l2a": {
      "visualizations": { "default": { "assets": ["red", "green", "blue"] } },
      "sceneMinZoom": 7
    },
    "landsat-c2-l2": {
      "visualizations": { "default": { "assets": ["red", "green", "blue"] } },
      "sceneMinZoom": 7
    }
  }
}
```

## 📸 Screenshots

### Landsat Hex Aggregation in light mode

![Landsat hex aggregations in light mode](screenshots/landsat-lightmode.png)

### Sentinel-1 Footprints

![sentinel-1 footprints](screenshots/s1-footprints.png)

### Landsat footprints with rendered scene

![landsat footprints with rendered scene](screenshots/landsat-scene.png)

### Sentinel-2 Grid Aggregation (on MGRS grids)

![sentinel-2 grid aggregation MGRS](screenshots/s2-grid-aggregation.png)

## 📦 Use as a Library

FilmDrop UI is a React component library in addition to a standalone SPA.
Install the package and peer dependencies, then mount one `<FilmDropRoot />`.

For a runnable reference host-app that demonstrates embedded mount at a
non-root basepath with `applyDocumentBranding={false}`, see
[`examples/starter/`](examples/starter/README.md).

```bash
npm install filmdrop-ui \
  react react-dom react-redux @reduxjs/toolkit \
  @tanstack/react-router \
  @mui/material @mui/icons-material @mui/x-date-pickers \
  @emotion/react @emotion/styled \
  leaflet leaflet-draw react-leaflet
```

```jsx
import { FilmDropRoot } from 'filmdrop-ui'
import 'filmdrop-ui/style.css'
// Required by the Leaflet peer dependency (not bundled by filmdrop-ui):
import 'leaflet/dist/leaflet.css'
import 'leaflet-draw/dist/leaflet.draw.css'

export default function App() {
  return (
    <FilmDropRoot
      basename="/filmdrop"
      configUrl="/filmdrop/config/config.json"
      applyDocumentBranding={false}
      onError={(err, info) => console.error(err, info)}
    />
  )
}
```

### `<FilmDropRoot />` props

| Prop                     | Type                          | Default                         |
| ------------------------ | ----------------------------- | ------------------------------- |
| `basename`               | `string`                      | `'/'`                           |
| `configUrl`              | `string`                      | Vite `BASE_URL`                 |
| `configCacheBuster`      | `'timestamp'\|'none'\|string` | `'timestamp'`                   |
| `applyDocumentBranding`  | `boolean`                     | `true`                          |
| `persistThemePreference` | `boolean`                     | `true`                          |
| `onError`                | `(error, info) => void`       | —                               |
| `onOpenExternal`         | `(url, meta?) => void`        | `window.open(url, '_blank', …)` |

- `basename` — public alias of TanStack Router's `basepath`.
- `configUrl` — URL (or directory base) for `config/config.json` and `data/*.json`.
- `configCacheBuster` — `'timestamp'` (default) appends `?_cb=<Date.now()>`;
  `'none'` disables cache-busting so host CDN/ETag caching wins; any other
  string is used literally (e.g. a per-deploy commit hash).
- `applyDocumentBranding` — when `false`, FilmDrop does not mutate
  `document.title`, favicon, or `<html>`.
- `persistThemePreference` — when `false`, FilmDrop does not read or write
  `localStorage['APP_THEME_PREFERENCE']`.
- `onError` — `(error, info: { componentStack, phase }) => void`; fired by
  the library's ErrorBoundary.
- `onOpenExternal` — override outbound link handling for embedded hosts
  (default opens in a new tab with `noopener,noreferrer`).

### Consumer checklist

- **CSS imports (required).** `filmdrop-ui/style.css` plus the Leaflet
  CSS peers. FilmDrop does NOT bundle `leaflet/dist/leaflet.css` to avoid
  duplication with consumer code.
- **Fonts.** The library does NOT bundle the Inter font. Provide Inter
  (or an alternative) and your own `html, body` reset — `src/index.css`
  is deliberately excluded from the library bundle (Google Fonts import,
  body resets, and `#root` sizing are host-invasive).
- **Config + data files.** Serve your `config.json` under
  `${configUrl}` (or `${BASE_URL}config/config.json`). Grid-view data
  files (`cdem.json`, `doqq.json`, `mgrs.json`, `wrs2.json`) must live at
  `${configUrl base}/data/*.json`. Example layout:

  ```text
  your-host/
    filmdrop/
      config/
        config.json
        favicon.ico
        logo.png
      data/
        mgrs.json
        wrs2.json
        cdem.json
        doqq.json
  ```

- **Config asset paths.** `BRAND_LOGO`, `LOGIN_LOGO`, `APP_FAVICON`, and
  `LOGO_URL` in `config.json` resolve relative to the `configUrl` base.
  Copy your logos alongside `config.json`.
- **Reserved URL params.** `dt`, `view`, `viz`, `tab`, `z`, `c` are owned
  by FilmDrop. Do not read/write them in host code; they are part of the
  SemVer public surface.
- **Single-instance (v1).** Mount exactly one `<FilmDropRoot />` per page.
  `localStorage` keys `APP_AUTH_TOKEN`, `APP_THEME_PREFERENCE`, and
  `sessionStorage` key `POST_AUTH_REDIRECT_URL` are shared across all
  apps on the same origin — be aware in multi-app deployments.
  Multi-instance support is on the roadmap.
- **Next.js / SSR.** `lib-entry.jsx` declares `'use client'`, but Leaflet
  and MUI date pickers are client-only. Wrap `FilmDropRoot` in
  `next/dynamic` with `{ ssr: false }`.
- **CSP origins.** Allowlist your STAC API origin, TiTiler origin,
  `https://nominatim.openstreetmap.org` (leaflet-geosearch), and
  `https://fonts.googleapis.com` / `https://fonts.gstatic.com` if you load
  Inter via Google Fonts. `$ref` resolution in Queryables may fetch
  arbitrary external URLs declared in your STAC extensions.
- **React 19.** The library's peer range accepts React 18 and 19. React 19
  compatibility (`use()`, automatic batching, Suspense boundaries,
  ref-as-prop) is exercised via the StrictMode regression test
  (`src/FilmDropRoot.strictmode.test.jsx`). DOMPurify sanitizes
  user-supplied HTML in field formatting and STAC description rendering;
  see `src/utils/securityHelper.js` for the policy.

### Container-escape CSS contract

FilmDrop ships `.filmdrop-root` container-scoped selectors alongside the
host-scoped `:root[data-theme=…]` ones, and `App.jsx` renders a
`<div className="App filmdrop-root" data-theme=…>` wrapper. Embedded
consumers that pass `applyDocumentBranding={false}` get themed CSS
variables without FilmDrop writing to `<html>`.

Several layout rules (App loading overlay, UploadGeojsonModal,
PanelToggle, attribution tooltip) still use `position: fixed` for
viewport coverage. Embed-only consumers should:

1. Constrain `<FilmDropRoot />` inside a `position: relative; contain: layout;`
   container so overflow clipping is well-defined.
2. Set `applyDocumentBranding={false}` to avoid `<html>` mutations
   (title, favicon, `<html data-theme>`).
3. Set `persistThemePreference={false}` if your host app manages theme
   in its own preference store (avoids shared
   `localStorage['APP_THEME_PREFERENCE']`).
4. Expect full-viewport overlays (loading, modal) to cover host chrome
   when they appear — the `position: fixed` contract is part of the
   library surface.

### Post-authentication navigation

When `APP_TOKEN_AUTH_ENABLED` is true, FilmDrop stores the pre-auth URL
in `sessionStorage['POST_AUTH_REDIRECT_URL']` before the login form
mounts and reads it back on successful login. The navigation matrix:

| Mode                | `basename` | Stored URL       | Resolved target           |
| ------------------- | ---------- | ---------------- | ------------------------- |
| SPA                 | `'/'`      | `/collection/id` | `/collection/id`          |
| Embedded            | `/app`     | `/collection/id` | `/app/collection/id`      |
| Embedded (absolute) | `/app`     | `https://h/x`    | `https://h/x` (untouched) |

FilmDrop applies the active basepath to stored redirect URLs via
`applyBasepathToRedirect` (exported from
`src/services/post-auth-service.js` for unit tests). Absolute URLs and
already-prefixed paths are left alone.

### Bundle surface

The library ships:

- `dist/filmdrop-ui.js` — ESM bundle (~1.1 MB unminified, ~285 kB gzipped).
- `dist/style.css` — side-effect stylesheet (~75 kB).
- `dist/index.d.ts` — hand-authored TypeScript types (see
  `src/index.d.ts`).

`scripts/verify-lib-bundle.mjs` (run by `npm run build:lib`) asserts no
core Leaflet CSS rules leak into `dist/style.css`.

## 🏗️ Architecture

FilmDrop UI is built with:

- **React** - UI framework
- **Redux** - State management
- **Leaflet** - Interactive mapping
- **Vite** - Build tool and dev server

### Key Design Principles

- **Build-once, deploy-anywhere** - Runtime configuration
- **Responsive design** - Works on desktop and mobile
- **Extensible** - Easy to add new collections and visualizations
- **Performance** - Optimized for large result sets

## Versioning

FilmDrop UI follows [Semantic Versioning](https://semver.org/). The
public API surface is:

- The `FilmDropRoot` component and its props (see "Embedded host
  integration" above and `dist/index.d.ts`).
- Named exports listed in `dist/index.d.ts` (e.g. `clearFieldCaches`).
- The `config.json` schema documented in `CONFIGURATION.md`.
- The reserved URL params `dt`, `view`, `viz`, `tab`, `z`, `c`.

Breaking changes to any of the above are MAJOR. Config schema additions
are MINOR; removals/renames are MAJOR with one MINOR of legacy coverage.
Peer-dependency major bumps (e.g. React 19 → 20) are MAJOR for
FilmDrop UI. Deprecations land at `@deprecated` JSDoc + a runtime
`console.warn` one MINOR before removal.

## Accessibility

FilmDrop UI ships ESLint's `jsx-a11y` rules in lint-fix mode and runs
`@testing-library/jest-dom` accessibility matchers in tests. Known
accessibility gaps and ongoing work are tracked in the GitHub issue
tracker under the `accessibility` label. If you spot a regression,
please open an issue with reproduction steps and the affected component.

## Brand assets and trademarks

The `dist/` payload is the only thing shipped to npm consumers; the
Element 84 / FilmDrop logos in `public/` and `examples/starter/public/`
are not redistributed. Forks and external integrators must replace
these assets with their own and update `config.json`'s `BRAND_LOGO`,
`LOGIN_LOGO`, and `APP_FAVICON` paths. See [`NOTICE`](NOTICE) for the
trademark boundary; the Apache 2.0 license covers the source code only,
not Element 84's marks.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

### Guidelines

- Follow existing code style
- Use meaningful variable and function names
- Add details of the changes/updates to the CHANGELOG's `Unreleased` section
- Add tests for new features
- Update documentation as needed

### Available Scripts

```bash
npm start        # Start development server (localhost:5173)
npm test         # Run test suite
npm run build    # Create production build
npm run coverage # Generate test coverage report
npm run serve    # Serve production build locally
```

### Running Tests

```bash
# Run tests
npm test

# Run tests with coverage
npm run coverage

# Run tests in watch mode
npm test -- --watch
```

## 📚 Related Projects

- [STAC Specification](https://stacspec.org/) - Core STAC specification
- [stac-server](https://github.com/stac-utils/stac-server) - Serverless STAC API
  implementation
- [TiTiler](https://github.com/developmentseed/titiler) - Dynamic tile server
- [NASA IMPACT TiTiler](https://github.com/NASA-IMPACT/titiler) - Extended TiTiler
  with mosaicjson support

## 📄 License

Copyright 2020-2025 Element 84

Licensed under the Apache License, Version 2.0. See [LICENSE](LICENSE) for details.
