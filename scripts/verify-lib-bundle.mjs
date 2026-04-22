#!/usr/bin/env node
// Fails the build if core Leaflet CSS leaked into dist/style.css.
// Consumers own Leaflet CSS. Our own `.leaflet-*` theme overrides are
// allowed; the selectors below are shipped only by Leaflet core.

import { readFileSync, existsSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
const cssPath = resolve(here, '..', 'dist/style.css')

if (!existsSync(cssPath)) {
  console.error(`Missing ${cssPath}; run build:lib first.`)
  process.exit(1)
}

const css = readFileSync(cssPath, 'utf8')

const leaks = [
  '.leaflet-tile-pane',
  '.leaflet-marker-pane',
  '.leaflet-shadow-pane',
  '.leaflet-popup-pane',
  '.leaflet-draw-toolbar',
  '.leaflet-draw-actions'
]

const found = leaks.filter((sel) => css.includes(sel))
if (found.length > 0) {
  console.error(
    `✗ Leaflet CSS leaked into dist/style.css: ${found.join(', ')}\n` +
      `  Remove the @import / side-effect CSS import pulling Leaflet's stylesheet.`
  )
  process.exit(1)
}

console.log('✓ No Leaflet CSS leakage detected in dist/style.css')
