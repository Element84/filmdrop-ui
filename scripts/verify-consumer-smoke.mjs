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
const allowedTopLevel = new Set([
  'package.json',
  'README.md',
  'LICENSE',
  'NOTICE',
  'CHANGELOG.md',
  'CONFIGURATION.md'
])
const disallowed = pack.files
  .map((f) => f.path)
  .filter((p) => {
    if (p.startsWith('dist/')) return false
    if (allowedTopLevel.has(p)) return false
    return true
  })
if (disallowed.length > 0) {
  fail(`npm tarball includes non-allowed paths: ${disallowed.join(', ')}`)
}
pass(
  `npm tarball clean: ${pack.files.length} files, unpacked ${pack.unpackedSize}B`
)

// Guard against accidental publish from FILMDROP_DEV_SRC mode.
if (process.env.FILMDROP_DEV_SRC === '1') {
  fail(
    'FILMDROP_DEV_SRC=1 is set; verify:consumer must run against a ' +
      'pristine published-style build. Unset and rerun.'
  )
}
pass('FILMDROP_DEV_SRC is not set.')

// Verify `.filmdrop-root` container-scoped theme selectors ship in
// style.css so embedded consumers get themed CSS variables without
// host DOM mutations.
const styleCss = readFileSync(resolve(root, 'dist/style.css'), 'utf8')
const requiredSelectorPairs = [
  ['filmdrop-dark', /\.filmdrop-root\[data-theme=['"]?filmdrop-dark['"]?\]/],
  ['filmdrop-light', /\.filmdrop-root\[data-theme=['"]?filmdrop-light['"]?\]/]
]
for (const [label, pattern] of requiredSelectorPairs) {
  if (!pattern.test(styleCss)) {
    fail(
      `Expected \`.filmdrop-root[data-theme='${label}']\` in dist/style.css (container-scoped theme selector missing).`
    )
  }
}
pass(
  'Container-scoped theme selectors (.filmdrop-root[data-theme=…]) present in style.css.'
)

// Lightweight schema check on the example starter's config.
const starterConfigPath = resolve(
  root,
  'examples/starter/public/config/config.json'
)
if (existsSync(starterConfigPath)) {
  let starterCfg
  try {
    starterCfg = JSON.parse(readFileSync(starterConfigPath, 'utf8'))
  } catch (err) {
    fail(`examples/starter config.json is not valid JSON: ${err.message}`)
  }
  if (!starterCfg.STAC_API_URL) {
    fail('examples/starter config.json must set STAC_API_URL.')
  }
  pass(
    `examples/starter config.json valid (STAC_API_URL=${starterCfg.STAC_API_URL}).`
  )
}

// Leaflet CSS is a peer responsibility — the library must not inline it.
if (
  /\.leaflet-container\b[^{]*\{/.test(styleCss) &&
  /\.leaflet-tile\b[^{]*\{/.test(styleCss)
) {
  fail('dist/style.css appears to inline leaflet.css.')
}
pass('dist/style.css does not inline leaflet.css.')

// Peer dedupe: every peer must resolve to a single physical version
// across the starter workspace.
try {
  const lsOut = execSync(
    'npm ls --workspace filmdrop-starter --all --json --silent',
    { cwd: root, encoding: 'utf8' }
  )
  const tree = JSON.parse(lsOut)
  const versions = new Map()
  function walk(node) {
    const deps = node.dependencies || {}
    for (const [name, child] of Object.entries(deps)) {
      if (peerNames.includes(name) && child.version) {
        if (!versions.has(name)) versions.set(name, new Set())
        versions.get(name).add(child.version)
      }
      walk(child)
    }
  }
  walk(tree)
  const dupes = [...versions.entries()].filter(([, s]) => s.size > 1)
  if (dupes.length > 0) {
    fail(
      'Peer-dependency duplication detected in starter workspace:\n' +
        dupes.map(([n, s]) => `  - ${n}: ${[...s].join(', ')}`).join('\n') +
        '\nAdd the offender to `resolve.dedupe` in examples/starter/vite.config.mts ' +
        'or align ranges in package.json.'
    )
  }
  pass(
    `Peer dedupe OK across starter workspace (${versions.size} peers checked).`
  )
} catch (err) {
  // Workspace not installed — skip rather than fail.
  console.log(
    `· Skipping peer-dedupe check (npm ls -w filmdrop-starter unavailable: ${err.message
      .split('\n')[0]
      .slice(0, 120)}).`
  )
}

console.log('\nAll consumer smoke checks passed.')
