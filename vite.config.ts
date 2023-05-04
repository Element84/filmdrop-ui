/// <reference types="vitest" />

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import viteTsconfigPaths from 'vite-tsconfig-paths'
import svgrPlugin from 'vite-plugin-svgr'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), viteTsconfigPaths(), svgrPlugin()],
  build: {
    outDir: 'build',
    rollupOptions: {
      external: ['/config.js']
    }
  },
  server: {
    open: true,
    hmr: {
      overlay: false
    }
  },
  test: {
    coverage: {
      reporter: ['text']
    }
  }
})
