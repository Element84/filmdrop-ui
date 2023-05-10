/// <reference types="vitest" />
/// <reference types="vite/client" />
/// <reference types="vite-plugin-svgr/client" />

import react from '@vitejs/plugin-react'
import viteTsconfigPaths from 'vite-tsconfig-paths'
import { defineConfig, configDefaults } from 'vitest/config'
import svgrPlugin from 'vite-plugin-svgr'

export default defineConfig({
  plugins: [react(), viteTsconfigPaths(), svgrPlugin()],
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
    coverage: {
      provider: 'c8',
      reporter: ['text'],
      exclude: [...configDefaults.coverage.exclude, 'src/redux/*'] // ignore the redux boilerplate for coverage report
    }
  }
})
