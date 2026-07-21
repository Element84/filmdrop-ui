#!/usr/bin/env node
// Mirror grid JSON from repo `public/data/` into
// `examples/starter/public/data/`. Destination is gitignored (~32 MB).

import { copyFileSync, existsSync, mkdirSync, statSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const src = resolve(root, 'public/data')
const dst = resolve(root, 'examples/starter/public/data')

const FILES = ['cdem.json', 'doqq.json', 'mgrs.json', 'wrs2.json']

if (!existsSync(dst)) mkdirSync(dst, { recursive: true })

let copied = 0
let unchanged = 0
for (const file of FILES) {
  const from = resolve(src, file)
  const to = resolve(dst, file)
  if (!existsSync(from)) {
    console.error(`✗ Missing source data file: public/data/${file}`)
    process.exit(1)
  }
  const sameSize = existsSync(to) && statSync(from).size === statSync(to).size
  // Size match is sufficient for these large generated grid files.
  if (sameSize) {
    unchanged++
    continue
  }
  copyFileSync(from, to)
  copied++
  console.log(
    `  copied public/data/${file} -> examples/starter/public/data/${file}`
  )
}
console.log(`Data sync complete: ${copied} copied, ${unchanged} unchanged.`)
