#!/usr/bin/env node
// Consumer smoke test. Run after `npm run build:lib`. Verifies dist/
// artifacts exist, FilmDropRoot is exported, peer deps remain external,
// bundle size is under budget, and `npm pack --dry-run` only ships
// whitelisted files.

import { execSync } from 'node:child_process'
import { existsSync, readFileSync, statSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')

function fail(msg) {
  console.error(`✗ ${msg}`)
  process.exit(1)
}
function pass(msg) {
  console.log(`✓ ${msg}`)
}

const required = ['dist/filmdrop-ui.js', 'dist/style.css', 'dist/index.d.ts']
for (const rel of required) {
  const abs = resolve(root, rel)
  if (!existsSync(abs)) fail(`Missing ${rel} — run npm run build:lib first.`)
}
pass('dist/filmdrop-ui.js, dist/style.css, dist/index.d.ts present.')

const bundle = readFileSync(resolve(root, 'dist/filmdrop-ui.js'), 'utf8')
if (!/FilmDropRoot/.test(bundle))
  fail('FilmDropRoot symbol not found in bundle.')
pass('FilmDropRoot exported from bundle.')

// Peer deps must remain bare imports, not inlined. List derives from
// `peerDependencies` in package.json MINUS peers the consumer installs
// but the library bundle does not directly import (react-dom,
// @emotion/{react,styled}, leaflet-draw — runtime-only for MUI/React
// rendering and Leaflet plugin side effects). Keep in sync with an
// audit of `grep -oE "from ['"][^'"]+['"]" dist/filmdrop-ui.js`.
const bareImports = bundle.match(/from\s*["']([^"']+)["']/g) || []
const peerNames = [
  'react',
  'react-redux',
  '@reduxjs/toolkit',
  '@tanstack/react-router',
  '@mui/material',
  '@mui/icons-material',
  '@mui/x-date-pickers',
  'leaflet',
  'react-leaflet'
]
const found = new Set()
for (const m of bareImports) {
  for (const p of peerNames) {
    if (
      m.includes(`"${p}"`) ||
      m.includes(`'${p}'`) ||
      m.includes(`"${p}/`) ||
      m.includes(`'${p}/`)
    ) {
      found.add(p)
    }
  }
}
const missing = peerNames.filter((p) => !found.has(p))
if (missing.length > 0) {
  fail(
    `Expected all declared peers to remain external as bare imports. ` +
      `Missing from bundle: ${missing.join(', ')}. ` +
      `Either the peer became bundled (fix vite.lib.config.mts externals) ` +
      `or it is no longer used (remove from peerNames + peerDependencies).`
  )
}
pass(`Peer externals intact: ${[...found].join(', ')}`)

const LIB_BUDGET = 1_600_000
const CSS_BUDGET = 120_000
const libSize = statSync(resolve(root, 'dist/filmdrop-ui.js')).size
const cssSize = statSync(resolve(root, 'dist/style.css')).size
if (libSize > LIB_BUDGET)
  fail(`dist/filmdrop-ui.js ${libSize} > budget ${LIB_BUDGET}`)
if (cssSize > CSS_BUDGET)
  fail(`dist/style.css ${cssSize} > budget ${CSS_BUDGET}`)
pass(`Bundle sizes OK: js=${libSize}B, css=${cssSize}B`)

// npm pack --dry-run
let packOutput
try {
  packOutput = execSync('npm pack --dry-run --json', {
    cwd: root,
    encoding: 'utf8'
  })
} catch (err) {
  fail(`npm pack --dry-run failed: ${err.message}`)
}
const pack = JSON.parse(packOutput)[0]
const disallowed = pack.files
  .map((f) => f.path)
  .filter(
    (p) =>
      p.startsWith('src/') || p.startsWith('build/') || p.startsWith('public/')
  )
if (disallowed.length > 0) {
  fail(`npm tarball includes non-dist paths: ${disallowed.join(', ')}`)
}
pass(
  `npm tarball clean: ${pack.files.length} files, unpacked ${pack.unpackedSize}B`
)

console.log('\nAll consumer smoke checks passed.')
