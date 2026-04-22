'use client'
// Library entry point. Consumers import `FilmDropRoot` plus the
// side-effect stylesheet at `filmdrop-ui/style.css`. Leaflet and
// leaflet-draw CSS are peer-owned and not bundled. `src/index.css` is
// SPA-only (fonts, body resets) and deliberately excluded here.

export { default as FilmDropRoot } from './FilmDropRoot'
