/// <reference types="vitest" />
/// <reference types="vite/client" />
/// <reference types="vite-plugin-svgr/client" />

import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import react from '@vitejs/plugin-react'
import viteTsconfigPaths from 'vite-tsconfig-paths'
import { defineConfig, configDefaults } from 'vitest/config'
import svgrPlugin from 'vite-plugin-svgr'

const pkg = JSON.parse(
  readFileSync(
    fileURLToPath(new URL('./package.json', import.meta.url)),
    'utf8'
  )
)

export default defineConfig({
  base: '/',
  define: {
    'import.meta.env.VITE_APP_VERSION': JSON.stringify(pkg.version)
  },
  plugins: [react(), viteTsconfigPaths(), svgrPlugin()],
  resolve: {
    alias: [
      {
        find: /^filmdrop-ui\/style\.css$/,
        replacement: fileURLToPath(new URL('./src/index.css', import.meta.url))
      },
      {
        find: /^filmdrop-ui$/,
        replacement: fileURLToPath(
          new URL('./src/lib-entry.jsx', import.meta.url)
        )
      }
    ]
  },
  build: {
    outDir: 'build'
  },
  server: {
    open: true,
    hmr: {
      overlay: false
    }
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/setupTests.js'],
    pool: 'threads',
    coverage: {
      provider: 'v8',
      reporter: ['text'],
      thresholds: {
        statements: 69,
        branches: 58,
        functions: 73,
        lines: 70
      },
      exclude: [...(configDefaults.coverage.exclude ?? []), 'src/redux/*'] // ignore the redux boilerplate for coverage report
    }
  }
})
