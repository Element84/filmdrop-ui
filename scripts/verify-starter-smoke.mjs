#!/usr/bin/env node
// Starter smoke verifier. Run after `npm run build:starter`.

import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs'
import { resolve, dirname, relative } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const starter = resolve(root, 'examples/starter')

function fail(msg) {
  console.error(`✗ ${msg}`)
  process.exit(1)
}
function pass(msg) {
  console.log(`✓ ${msg}`)
}

// 1. Source-mode guard.
if (process.env.FILMDROP_DEV_SRC === '1') {
  fail(
    'FILMDROP_DEV_SRC=1 is set. Verifier requires a published-style ' +
      'build (unset the env var and rerun build:starter).'
  )
}
pass('FILMDROP_DEV_SRC is not set.')

// 2. Library dist must exist (workspace resolves filmdrop-ui from there).
const distEntry = resolve(root, 'dist/filmdrop-ui.js')
if (!existsSync(distEntry)) {
  fail('dist/filmdrop-ui.js missing — run `npm run build:lib` first.')
}
pass('Library dist/ present (consumed by starter via workspace).')

// 3. Starter build output must exist.
const starterDist = resolve(starter, 'dist')
if (!existsSync(starterDist)) {
  fail('examples/starter/dist missing — run `npm run build:starter` first.')
}
const starterIndex = resolve(starterDist, 'index.html')
if (!existsSync(starterIndex)) {
  fail('examples/starter/dist/index.html missing.')
}
const starterHtml = readFileSync(starterIndex, 'utf8')
pass('examples/starter/dist/index.html present.')

// 4. The built HTML must reference the `/app/` base.
if (!/\/app\//.test(starterHtml)) {
  fail(
    'Built starter index.html does not reference `/app/` — Vite `base` ' +
      'and FilmDropRoot `basename` may be out of sync.'
  )
}
pass('Starter built with `/app/` base.')

// 5. config.json must exist and have STAC_API_URL.
const cfgPath = resolve(starter, 'public/config/config.json')
if (!existsSync(cfgPath)) fail('starter public/config/config.json missing.')
let cfg
try {
  cfg = JSON.parse(readFileSync(cfgPath, 'utf8'))
} catch (err) {
  fail(`starter config.json invalid JSON: ${err.message}`)
}
if (!cfg.STAC_API_URL) fail('starter config.json must set STAC_API_URL.')
pass(`starter config.json valid (STAC_API_URL=${cfg.STAC_API_URL}).`)

// 6. Brand assets must be byte-identical to the canonical copies under
//    repo-root public/.
const BRAND = [
  'brand-logo-element84-light-mode.svg',
  'brand-logo-element84-dark-mode.svg',
  'favicon.ico',
  'logo.png'
]
for (const file of BRAND) {
  const src = resolve(root, 'public', file)
  const dst = resolve(starter, 'public/config', file)
  if (!existsSync(src)) {
    fail(`Canonical brand asset missing: public/${file} (cannot drift-check).`)
  }
  if (!existsSync(dst)) {
    fail(
      `Starter brand asset missing: examples/starter/public/config/${file}. ` +
        'Run `npm run sync:starter-brand`.'
    )
  }
  const a = readFileSync(src)
  const b = readFileSync(dst)
  if (Buffer.compare(a, b) !== 0) {
    fail(
      `Brand drift: examples/starter/public/config/${file} != public/${file}. ` +
        'Run `npm run sync:starter-brand`.'
    )
  }
}
pass('Brand assets in starter match canonical public/ (no drift).')

// 7. Size budgets: code (js+css+html+map) and total (includes ~32 MB
//    of grid JSON copied from public/data/).
let totalSize = 0
let codeSize = 0
function walk(dir) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const p = resolve(dir, entry.name)
    if (entry.isDirectory()) {
      walk(p)
      continue
    }
    const sz = statSync(p).size
    totalSize += sz
    if (/\.(js|css|html|map)$/i.test(entry.name)) codeSize += sz
  }
}
walk(starterDist)
if (totalSize === 0) fail('starter dist is empty.')
const CODE_BUDGET = 4 * 1024 * 1024
const TOTAL_BUDGET = 60 * 1024 * 1024
if (codeSize > CODE_BUDGET) {
  fail(`starter dist code (js+css+html) ${codeSize}B > budget ${CODE_BUDGET}B.`)
}
if (totalSize > TOTAL_BUDGET) {
  fail(`starter dist total size ${totalSize}B > budget ${TOTAL_BUDGET}B.`)
}
pass(`starter dist size OK (code=${codeSize}B, total=${totalSize}B).`)

console.log(
  `\nAll starter smoke checks passed (${relative(process.cwd(), starter)}).`
)
