import { useRef, useMemo, useEffect } from 'react'
import debounce from '../utils/debounce'

// Registry of active debounced callbacks for flushing
const pendingCallbacks = new Set()

/**
 * Immediately execute all pending debounced callbacks.
 * Used by Search to ensure text field values are committed before searching.
 */
export function flushAllPendingCallbacks() {
  pendingCallbacks.forEach((fn) => fn.flush())
}

/**
 * React hook for debouncing callbacks with proper cleanup
 * @param {Function} callback - Function to debounce
 * @param {number} delay - Debounce delay in milliseconds
 * @returns {Function} Debounced callback with .cancel() and .flush() methods
 */
export const useDebouncedCallback = (callback, delay) => {
  const callbackRef = useRef(callback)

  // Always keep callback ref current (avoids stale closures)
  callbackRef.current = callback

  const debouncedFn = useMemo(
    () => debounce((...args) => callbackRef.current(...args), delay),
    [delay]
  )

  // Register in flush registry; cleanup on unmount
  useEffect(() => {
    pendingCallbacks.add(debouncedFn)
    return () => {
      pendingCallbacks.delete(debouncedFn)
      debouncedFn.cancel()
    }
  }, [debouncedFn])

  return debouncedFn
}
