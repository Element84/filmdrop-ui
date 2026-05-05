/**
 * Single source of truth for the base URL used to fetch FilmDrop's static
 * assets (config.json, favicon, data/*.json grid files).
 *
 * FilmDropRoot sets this at mount time from its `configUrl` prop. When unset,
 * services fall back to `${import.meta.env.BASE_URL}` (SPA behavior).
 */

let configBaseUrl = null

// Cache-bust strategy for config/favicon/grid-data fetches.
// FilmDropRoot sets this from its `configCacheBuster` prop:
//   - 'timestamp'  (default) — append `?_cb=<Date.now()>` to every fetch
//   - 'none'       — never append a cache-busting query param
//   - any string   — literal revision stamp (`?_cb=<encoded value>`)
let configCacheBusterMode = 'timestamp'

export function setConfigCacheBuster(mode) {
  if (!mode) {
    configCacheBusterMode = 'timestamp'
    return
  }
  configCacheBusterMode = String(mode)
}

export function getCacheBusterSuffix() {
  if (configCacheBusterMode === 'none') return ''
  if (configCacheBusterMode === 'timestamp') return `?_cb=${Date.now()}`
  return `?_cb=${encodeURIComponent(configCacheBusterMode)}`
}

/**
 * @param {string|null|undefined} url - Base URL (with or without trailing slash),
 *   or a full config.json URL (we'll strip `config/config.json` if present).
 *   Pass `null`/`undefined` to clear.
 */
export function setConfigBaseUrl(url) {
  if (!url) {
    configBaseUrl = null
    return
  }
  // Accept either a directory ("/app/") or a full config URL
  let base = String(url)
  // Strip trailing config.json path if present
  base = base.replace(/config\/config\.json.*$/, '')
  // Ensure trailing slash
  if (!base.endsWith('/')) base += '/'
  configBaseUrl = base
}

export function getConfigBaseUrl() {
  if (configBaseUrl) return configBaseUrl
  // Fallback: Vite BASE_URL for SPA mode.
  try {
    return import.meta.env?.BASE_URL || '/'
  } catch {
    return '/'
  }
}

export function resolveConfigUrl() {
  return `${getConfigBaseUrl()}config/config.json`
}

export function resolveFaviconUrl(faviconName) {
  return `${getConfigBaseUrl()}config/${faviconName}`
}

/**
 * Resolve logo paths against the FilmDrop config base URL.
 *
 * Absolute, protocol-relative, data, and blob URLs are returned unchanged.
 * Root-relative paths stay host-rooted. Relative paths are resolved from the
 * active config base URL.
 *
 * @param {string|null|undefined} logoPath
 * @returns {string|null|undefined}
 */
export function resolveLogoUrl(logoPath) {
  if (!logoPath) return logoPath
  const path = String(logoPath).trim()
  if (!path) return path

  // Preserve externally-resolved URLs and browser object URLs as-is.
  if (
    /^(?:[a-z][a-z0-9+.-]*:)?\/\//i.test(path) ||
    /^data:/i.test(path) ||
    /^blob:/i.test(path)
  ) {
    return path
  }

  // Root-relative paths should remain host-rooted.
  if (path.startsWith('/')) {
    return path
  }

  const normalized = path.replace(/^\.\//, '')
  return `${getConfigBaseUrl()}${normalized}`
}

export function resolveDataUrl(fileName) {
  return `${getConfigBaseUrl()}data/${fileName}.json`
}
