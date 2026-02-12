// General-purpose debounce utility with cancel and flush support
export default function debounce(func, wait, immediate) {
  let timeout
  let lastContext
  let lastArgs

  const executedFunction = function () {
    lastContext = this
    lastArgs = arguments

    const later = function () {
      timeout = null
      if (!immediate) func.apply(lastContext, lastArgs)
    }

    const callNow = immediate && !timeout

    clearTimeout(timeout)

    timeout = setTimeout(later, wait)

    if (callNow) func.apply(lastContext, lastArgs)
  }

  // Add cancel method to allow cleanup of pending debounced calls
  executedFunction.cancel = function () {
    clearTimeout(timeout)
    timeout = null
  }

  // Add flush method to immediately execute any pending debounced call
  executedFunction.flush = function () {
    if (timeout) {
      clearTimeout(timeout)
      timeout = null
      func.apply(lastContext, lastArgs)
    }
  }

  return executedFunction
}
