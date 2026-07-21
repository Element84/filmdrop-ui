/// <reference types="vite/client" />
/// <reference types="vite-plugin-svgr/client" />

import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { resolve } from 'node:path'
import react from '@vitejs/plugin-react'
import viteTsconfigPaths from 'vite-tsconfig-paths'
import svgrPlugin from 'vite-plugin-svgr'
import { defineConfig } from 'vite'

const pkg = JSON.parse(
  readFileSync(
    fileURLToPath(new URL('./package.json', import.meta.url)),
    'utf8'
  )
)

// Library build. Externalizes every peer dep so consumers install one
// copy of React, Redux, TanStack Router, MUI, Emotion, Leaflet, and
// react-leaflet. SPA build (vite.config.mts) is unaffected.

const peerExternals = [
  'react',
  'react-dom',
  'react-dom/client',
  'react/jsx-runtime',
  'react-redux',
  '@reduxjs/toolkit',
  '@tanstack/react-router',
  '@emotion/react',
  '@emotion/styled',
  '@mui/material',
  '@mui/icons-material',
  '@mui/x-date-pickers',
  '@mui/x-date-pickers/DatePicker',
  '@mui/x-date-pickers/LocalizationProvider',
  '@mui/x-date-pickers/AdapterDayjs',
  'leaflet',
  'leaflet-draw',
  'react-leaflet',
  'react-leaflet/MapContainer',
  'react-leaflet/TileLayer'
]

// Match deep imports of externalized peers (e.g. @mui/material/Button).
const externalPattern = new RegExp(
  `^(${peerExternals
    .map((name) => name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
    .join('|')})(\\/.*)?$`
)

export default defineConfig({
  plugins: [react(), viteTsconfigPaths(), svgrPlugin()],
  // public/ assets are consumer-supplied in library mode.
  publicDir: false,
  define: {
    'import.meta.env.VITE_APP_VERSION': JSON.stringify(pkg.version),
    // Required: `vite build` in lib mode does not replace this
    // automatically. Removing it regresses bundle size by ~23 KB
    // (dev-only branches in MUI/emotion stop being eliminated).
    'process.env.NODE_ENV': JSON.stringify('production')
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    sourcemap: true,
    cssCodeSplit: false,
    lib: {
      entry: resolve(
        fileURLToPath(new URL('.', import.meta.url)),
        'src/lib-entry.jsx'
      ),
      formats: ['es'],
      fileName: () => 'filmdrop-ui.js'
    },
    rollupOptions: {
      external: (id) => externalPattern.test(id),
      output: {
        // Ship one filmdrop-ui.js file instead of a chunk graph.
        inlineDynamicImports: true,
        assetFileNames: (asset) => {
          if (asset.name === 'style.css' || asset.name?.endsWith('.css')) {
            return 'style.css'
          }
          return 'assets/[name]-[hash][extname]'
        }
      }
    }
  }
})
