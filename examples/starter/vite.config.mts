import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// The starter mounts FilmDropRoot at the `/app` basepath to exercise the
// embedded integration path. Change `base` and the FilmDropRoot
// `basename` prop in `src/App.jsx` together when deploying to a
// different subpath.
export default defineConfig({
  base: '/app/',
  plugins: [react()],
  server: {
    port: 5180
  },
  preview: {
    port: 4173
  }
})
