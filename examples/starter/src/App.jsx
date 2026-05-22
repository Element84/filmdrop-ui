import React from 'react'
import { FilmDropRoot } from 'filmdrop-ui'
// Leaflet CSS is a peer dependency — FilmDrop does NOT bundle it.
import 'leaflet/dist/leaflet.css'
import 'leaflet-draw/dist/leaflet.draw.css'
import 'filmdrop-ui/style.css'

/**
 * Minimal embedded mount.
 *
 * Demonstrated flags:
 *  - `basename="/app"` matches vite.config.mts `base: '/app/'`
 *  - `applyDocumentBranding={false}` keeps the host `<title>` and favicon
 *  - `persistThemePreference={false}` lets the host own theme preference
 *  - `configCacheBuster="none"` relies on host CDN caching
 *  - `onError` forwards errors to the host's own observability stack
 *  - `onOpenExternal` demonstrates an override (opens in same window here)
 */
export default function App() {
  return (
    <div
      style={{
        position: 'relative',
        contain: 'layout',
        height: 'calc(100vh - 34px)'
      }}
    >
      <FilmDropRoot
        basename="/app"
        configUrl="/app/config/config.json"
        applyDocumentBranding={false}
        persistThemePreference={false}
        configCacheBuster="none"
        onError={(error, info) => {
          // eslint-disable-next-line no-console
          console.error('[host] FilmDrop error:', info.phase, error)
        }}
        onOpenExternal={(url) => {
          window.location.href = url
        }}
      />
    </div>
  )
}
