# FilmDrop UI

> A modern, browser-based interface for exploring and visualizing STAC API catalogs

[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](LICENSE)

FilmDrop UI is a powerful web application for searching, visualizing, and interacting with
geospatial imagery catalogs through STAC (SpatioTemporal Asset Catalog) APIs. It provides
multiple visualization modes including aggregated views, mosaics, and individual scenes with
advanced filtering and export capabilities.

Check out [FilmDrop-UI in action with Earth-Search](https://console.earth-search.aws.element84.com/).

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
  - Cloud cover filtering
  - Draw or upload GeoJSON search bounds
  - Interactive map with Leaflet
  - Light/dark theme support

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
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

- **[Configuration Guide](CONFIGURATION.md)** - Complete configuration reference with migration guide
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
      "sceneTilerParams": {
        "assets": ["red", "green", "blue"]
      },
      "sceneMinZoom": 7,
      "popupDisplayFields": ["datetime", "platform"]
    }
  }
}
```

### STAC API Requirements

Some FilmDrop features require specific STAC API extensions:

- **Aggregation Views** - [Aggregation Extension](https://github.com/stac-api-extensions/aggregation)
  - Hex view requires items with `proj:centroid` property
  - Currently supported by [stac-server](https://github.com/stac-utils/stac-server) and stac-fastapi-elasticsearch-opensearch
  - The aggregation `centroid_geohex_grid_frequency` or `grid_geohex_frequency` (Deprecated) must be advertised by the `/aggregations` endpoint

- **Grid Code Aggregation** - Custom `grid:code` property
  - Items must include grid identifier (e.g., MGRS, WRS2)

- **Cloud Cover Filtering** - [EO Extension](https://github.com/stac-extensions/eo)

See [CONFIGURATION.md](CONFIGURATION.md) for detailed feature configuration.

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

Add TiTiler for on-the-fly tile generation:

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
      "sceneTilerParams": {
        "assets": ["red", "green", "blue"],
        "color_formula": "Gamma+RGB+3.2+Saturation+0.8"
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
      "sceneTilerParams": { "assets": ["red", "green", "blue"] },
      "sceneMinZoom": 7,
      "popupDisplayFields": ["datetime", "platform", "eo:cloud_cover"]
    },
    "landsat-c2-l2": {
      "sceneTilerParams": { "assets": ["red", "green", "blue"] },
      "sceneMinZoom": 7,
      "popupDisplayFields": ["datetime", "platform", "instruments"]
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
- [stac-server](https://github.com/stac-utils/stac-server) - Serverless STAC API implementation
- [TiTiler](https://github.com/developmentseed/titiler) - Dynamic tile server
- [NASA IMPACT TiTiler](https://github.com/NASA-IMPACT/titiler) - Extended TiTiler with mosaicjson support

## 📄 License

Copyright 2020-2025 Element 84

Licensed under the Apache License, Version 2.0. See [LICENSE](LICENSE) for details.
