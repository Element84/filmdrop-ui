#!/usr/bin/env node
// Compile a TypeScript fixture against `dist/index.d.ts` to verify the
// published type surface.

import { mkdtempSync, writeFileSync, rmSync, existsSync } from 'node:fs'
import { execSync } from 'node:child_process'
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

const dts = resolve(root, 'dist/index.d.ts')
if (!existsSync(dts)) {
  fail('dist/index.d.ts not found — run `npm run build:lib` first.')
}

// Place the fixture inside the repo so TypeScript resolves peer types
// from the repo's node_modules.
const dir = mkdtempSync(resolve(root, '.types-fixture-'))

// Map filmdrop-ui to the dist d.ts via a tsconfig path alias.
const tsconfig = {
  compilerOptions: {
    target: 'ES2022',
    module: 'ESNext',
    moduleResolution: 'Bundler',
    jsx: 'react',
    strict: true,
    noEmit: true,
    skipLibCheck: true,
    esModuleInterop: true,
    baseUrl: '.',
    paths: {
      'filmdrop-ui': [resolve(root, 'dist/index.d.ts')]
    }
  },
  include: ['fixture.tsx']
}
writeFileSync(resolve(dir, 'tsconfig.json'), JSON.stringify(tsconfig, null, 2))

const fixture = `
import * as React from 'react'
import FilmDropRoot, {
  FilmDropRoot as Named,
  clearFieldCaches,
  type FilmDropRootProps,
  type FilmDropErrorInfo,
  type FilmDropOnError,
  type FilmDropOnOpenExternal
} from 'filmdrop-ui'

const onError: FilmDropOnError = (err, info) => {
  // phase must narrow to the documented union
  const phase: 'render' | 'effect' | 'config-load' | 'auth' = info.phase
  void phase
  void err.message
  void info.componentStack
}

const onOpenExternal: FilmDropOnOpenExternal = (url, meta) => {
  void url.toLowerCase()
  void (meta?.source ?? 'unknown')
}

const props: FilmDropRootProps = {
  basename: '/app',
  configUrl: '/app/',
  configCacheBuster: 'none',
  applyDocumentBranding: false,
  persistThemePreference: false,
  onError,
  onOpenExternal
}

export function App() {
  clearFieldCaches()
  return (
    <>
      <FilmDropRoot {...props} />
      <Named basename="/embed" />
    </>
  )
}
`
writeFileSync(resolve(dir, 'fixture.tsx'), fixture)

try {
  execSync(`npx --no-install tsc -p ${JSON.stringify(dir)}`, {
    cwd: root,
    stdio: 'pipe'
  })
} catch (err) {
  const out = (err.stdout?.toString() ?? '') + (err.stderr?.toString() ?? '')
  rmSync(dir, { recursive: true, force: true })
  fail(`Type fixture failed to compile against dist/index.d.ts:\n${out}`)
}
rmSync(dir, { recursive: true, force: true })
pass('Type fixture compiles against dist/index.d.ts.')

console.log('\nverify:types passed.')
