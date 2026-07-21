let activeRuntime = null
const liveRuntimes = new Set()

export function registerRuntime(runtimeInstance) {
  liveRuntimes.add(runtimeInstance)
  activeRuntime = runtimeInstance
  return liveRuntimes.size
}

export function unregisterRuntime(runtimeInstance) {
  liveRuntimes.delete(runtimeInstance)
  activeRuntime = liveRuntimes.size > 0 ? Array.from(liveRuntimes).at(-1) : null
  return activeRuntime
}

export function getRuntimeOrNull() {
  return activeRuntime
}

export function resetRuntimeStateForTests() {
  liveRuntimes.clear()
  activeRuntime = null
}
