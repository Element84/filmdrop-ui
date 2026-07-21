#!/usr/bin/env node
// Mirror brand assets from repo `public/` into
// `examples/starter/public/config/`. Idempotent.

import { copyFileSync, existsSync, mkdirSync, readFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const src = resolve(root, 'public')
const dst = resolve(root, 'examples/starter/public/config')

const ASSETS = [
  'brand-logo-element84-light-mode.svg',
  'brand-logo-element84-dark-mode.svg',
  'favicon.ico',
  'logo.png'
]

if (!existsSync(dst)) mkdirSync(dst, { recursive: true })

let copied = 0
let unchanged = 0
for (const file of ASSETS) {
  const from = resolve(src, file)
  const to = resolve(dst, file)
  if (!existsSync(from)) {
    console.error(`✗ Missing source asset: public/${file}`)
    process.exit(1)
  }
  const same =
    existsSync(to) && Buffer.compare(readFileSync(from), readFileSync(to)) === 0
  if (same) {
    unchanged++
    continue
  }
  copyFileSync(from, to)
  copied++
  console.log(
    `  copied public/${file} -> examples/starter/public/config/${file}`
  )
}
console.log(
  `Brand asset sync complete: ${copied} copied, ${unchanged} unchanged.`
)
