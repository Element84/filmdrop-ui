/// <reference types="vitest/config" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import svgrPlugin from 'vite-plugin-svgr'
import { fileURLToPath } from 'node:url'
import { resolve, dirname } from 'node:path'

const here = dirname(fileURLToPath(import.meta.url))

// FILMDROP_DEV_SRC=1 aliases `filmdrop-ui` to the parent package's
// source entry for fast HMR. Do not use for bundle measurement or
// release verification.
const useSrc = process.env.FILMDROP_DEV_SRC === '1'

export default defineConfig({
  base: '/app/',
  plugins: [react(), svgrPlugin()],
  resolve: {
    alias: useSrc
      ? {
          'filmdrop-ui/style.css': resolve(here, '../../src/style.css'),
          'filmdrop-ui': resolve(here, '../../src/lib-entry.jsx')
        }
      : undefined,
    dedupe: [
      'react',
      'react-dom',
      'react-redux',
      '@reduxjs/toolkit',
      '@tanstack/react-router',
      'leaflet',
      'react-leaflet'
    ]
  },
  server: {
    port: 5180
  },
  preview: {
    port: 4173
  },
  test: {
    environment: 'jsdom',
    globals: true,
    css: true
  }
})
