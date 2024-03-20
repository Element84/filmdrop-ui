/// <reference types="vitest" />
/// <reference types="vite/client" />
/// <reference types="vite-plugin-svgr/client" />

import react from '@vitejs/plugin-react'
import viteTsconfigPaths from 'vite-tsconfig-paths'
import { defineConfig, configDefaults } from 'vitest/config'
import svgrPlugin from 'vite-plugin-svgr'

export default defineConfig({
  base: './',
  define: {
    'process.env.REACT_APP_VERSION': JSON.stringify(
      require('./package.json').version
    )
  },
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
    pool: 'threads',
    coverage: {
      provider: 'v8',
      reporter: ['text'],
      exclude: [...configDefaults.coverage.exclude, 'src/redux/*'] // ignore the redux boilerplate for coverage report
    }
  }
})
