import { createContext, useContext } from 'react'
import {
  registerRuntime,
  unregisterRuntime,
  getRuntimeOrNull
} from './runtime-state'

export const RuntimeContext = createContext(null)

function isDev() {
  return Boolean(import.meta.env?.DEV)
}

export function setActiveRuntime(runtimeInstance, options) {
  const action = options && options.action
  if (action === 'mount') {
    const liveRuntimeCount = registerRuntime(runtimeInstance)
    if (liveRuntimeCount > 1 && isDev()) {
      console.warn(
        'FilmDrop: multiple live runtime containers detected. ' +
          'A single instance per page is assumed.'
      )
    }
  } else if (action === 'unmount') {
    unregisterRuntime(runtimeInstance)
  } else if (isDev()) {
    console.warn(
      "FilmDrop: setActiveRuntime requires { action: 'mount' | 'unmount' }"
    )
  }
}

export function getActiveRuntimeOrNull() {
  return getRuntimeOrNull()
}

export function getActiveRuntime() {
  const activeRuntime = getRuntimeOrNull()
  if (!activeRuntime && isDev()) {
    console.warn('FilmDrop: getActiveRuntime called before FilmDropRoot mount')
  }
  return activeRuntime
}

export function useRuntime() {
  const runtime = useContext(RuntimeContext)
  if (!runtime) {
    throw new Error('FilmDrop: useRuntime must be used within FilmDropRoot')
  }
  return runtime
}
