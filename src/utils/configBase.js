/**
 * Single source of truth for the base URL used to fetch FilmDrop's static
 * assets (config.json, favicon, data/*.json grid files).
 *
 * FilmDropRoot sets this at mount time from its `configUrl` prop. When unset,
 * services fall back to `${import.meta.env.BASE_URL}` (SPA behavior).
 */

let configBaseUrl = null

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
  // Fallback: Vite BASE_URL (SPA default). import.meta.env is available in
  // all supported bundlers; guard for non-bundler environments anyway.
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

export function resolveDataUrl(fileName) {
  return `${getConfigBaseUrl()}data/${fileName}.json`
}
