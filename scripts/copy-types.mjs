#!/usr/bin/env node
// Copies the hand-authored src/index.d.ts into dist/ for publish.

import { copyFileSync, existsSync, mkdirSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
const root = resolve(here, '..')
const src = resolve(root, 'src/index.d.ts')
const distDir = resolve(root, 'dist')
const dest = resolve(distDir, 'index.d.ts')

if (!existsSync(src)) {
  console.error(`Missing ${src}`)
  process.exit(1)
}
if (!existsSync(distDir)) {
  mkdirSync(distDir, { recursive: true })
}
copyFileSync(src, dest)
console.log(`✓ Copied ${src} → ${dest}`)
