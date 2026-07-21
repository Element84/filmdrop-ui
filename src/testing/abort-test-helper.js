export function createAbortError(message = 'aborted') {
  return Object.assign(new Error(message), {
    name: 'AbortError'
  })
}

export function createAbortableRequest(immediate = false) {
  const controller = new AbortController()
  if (immediate) {
    controller.abort()
  }

  return {
    controller,
    signal: controller.signal,
    abort: () => controller.abort(),
    abortError: createAbortError()
  }
}
