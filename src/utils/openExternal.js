/**
 * External link opener with consumer override hook.
 *
 * FilmDropRoot can set `window.__filmdropOnOpenExternal = fn` to intercept
 * all external-link opens (embedded contexts, popup-blocked UAs).
 * Defaults to `window.open(url, '_blank', 'noopener,noreferrer')`.
 */
export function openExternal(url, meta) {
  if (typeof window === 'undefined') return
  const override = window.__filmdropOnOpenExternal
  if (typeof override === 'function') {
    try {
      override(url, meta)
      return
    } catch (err) {
      console.error('FilmDrop onOpenExternal handler threw:', err)
    }
  }
  window.open(url, '_blank', 'noopener,noreferrer')
}
