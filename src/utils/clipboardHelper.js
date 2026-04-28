/**
 * Copy text to clipboard via `navigator.clipboard.writeText`. Do not
 * reintroduce a `document.execCommand('copy')` fallback — it required
 * appending a hidden textarea to `document.body`, breaking
 * container-scoping for embedded hosts.
 *
 * @param {string} text - Text to copy
 * @param {Function} setCopiedState - State setter for copied state
 * @param {string} itemKey - Unique key for the item
 * @param {number} resetDelay - Delay before resetting state (default: 2000)
 * @returns {Promise<{success: boolean, timeoutId: number|null}>}
 */
export const copyToClipboard = async (
  text,
  setCopiedState,
  itemKey,
  resetDelay = 2000
) => {
  if (
    typeof navigator === 'undefined' ||
    !navigator.clipboard ||
    typeof navigator.clipboard.writeText !== 'function'
  ) {
    console.error(
      'Clipboard API unavailable (non-secure context or unsupported browser).'
    )
    return { success: false, timeoutId: null }
  }

  try {
    await navigator.clipboard.writeText(text)
    setCopiedState(itemKey)

    const timeoutId = setTimeout(() => {
      setCopiedState(null)
    }, resetDelay)

    return { success: true, timeoutId }
  } catch (err) {
    console.error('Failed to copy to clipboard:', err)
    return { success: false, timeoutId: null }
  }
}

/**
 * Hook for managing clipboard state
 * @param {Function} setCopiedState - State setter function
 * @returns {Object} Copy function and cleanup function
 */
export const useClipboard = (setCopiedState) => {
  const timeouts = new Set()

  const copy = async (text, itemKey, resetDelay = 2000) => {
    const result = await copyToClipboard(
      text,
      setCopiedState,
      itemKey,
      resetDelay
    )
    if (result.timeoutId) {
      timeouts.add(result.timeoutId)
    }
    return result.success
  }

  const cleanup = () => {
    timeouts.forEach((timeoutId) => clearTimeout(timeoutId))
    timeouts.clear()
  }

  return { copyToClipboard: copy, cleanup }
}
