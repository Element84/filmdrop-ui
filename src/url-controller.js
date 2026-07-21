import {
  ROUTE_COLLECTION,
  ROUTE_COLLECTION_ITEM,
  ROUTE_INDEX
} from './route-constants'

let activeUrlController = null
const liveUrlControllers = new Set()
let hasWarnedAboutMultipleUrlControllers = false

function isDev() {
  return Boolean(import.meta.env?.DEV)
}

function normalizeControlledState(rawState) {
  const state = rawState || {}
  return {
    collectionId: state.collectionId,
    itemId: state.itemId,
    search: { ...(state.search || {}) }
  }
}

// Keep these three route branches and the generic else-fallback in sync —
// a 4th route type must update both, or itemId/collectionId clearing
// semantics will silently diverge between them.
function buildNextControlledState(currentState, options) {
  const nextState = normalizeControlledState(currentState)
  const routeParams = options?.params || {}

  if (options?.to === ROUTE_INDEX) {
    nextState.collectionId = undefined
    nextState.itemId = undefined
  } else if (options?.to === ROUTE_COLLECTION) {
    nextState.collectionId = routeParams.collectionId
    nextState.itemId = undefined
  } else if (options?.to === ROUTE_COLLECTION_ITEM) {
    nextState.collectionId = routeParams.collectionId
    nextState.itemId = routeParams.itemId
  } else {
    if ('collectionId' in routeParams) {
      nextState.collectionId = routeParams.collectionId
    }
    if ('itemId' in routeParams) {
      nextState.itemId = routeParams.itemId
    }
  }

  const searchUpdate = options?.search
  if (typeof searchUpdate === 'function') {
    nextState.search = searchUpdate(nextState.search) || {}
  } else if (searchUpdate && typeof searchUpdate === 'object') {
    nextState.search = { ...searchUpdate }
  }

  return nextState
}

export function createControlledUrlController({ getState, onChange }) {
  if (typeof getState !== 'function') {
    throw new Error('FilmDrop: createControlledUrlController requires getState')
  }

  return {
    navigate: (options) => {
      const nextState = buildNextControlledState(getState(), options)
      if (typeof onChange === 'function') {
        onChange(nextState, {
          replace: options?.replace,
          source: 'filmdrop-controller'
        })
      } else if (isDev()) {
        console.warn(
          'FilmDrop: controlled urlState requires onUrlStateChange for navigation updates.'
        )
      }
      return Promise.resolve()
    },
    getPathParams: () => {
      const state = normalizeControlledState(getState())
      return {
        collectionId: state.collectionId,
        itemId: state.itemId
      }
    },
    getSearch: () => {
      const state = normalizeControlledState(getState())
      return Object.freeze({ ...state.search })
    }
  }
}

export function setActiveUrlController(controller, options) {
  const action = options && options.action
  if (action === 'mount') {
    liveUrlControllers.add(controller)
    activeUrlController = controller
    if (
      liveUrlControllers.size > 1 &&
      isDev() &&
      !hasWarnedAboutMultipleUrlControllers
    ) {
      hasWarnedAboutMultipleUrlControllers = true
      console.warn(
        'FilmDrop: multiple live URL controllers detected. ' +
          'A single instance per page is assumed.'
      )
    }
  } else if (action === 'unmount') {
    liveUrlControllers.delete(controller)
    activeUrlController =
      liveUrlControllers.size > 0 ? Array.from(liveUrlControllers).at(-1) : null
  } else if (isDev()) {
    console.warn(
      "FilmDrop: setActiveUrlController requires { action: 'mount' | 'unmount' }"
    )
  }
}

export function getActiveUrlControllerOrNull() {
  return activeUrlController
}

export function getActiveUrlController() {
  const controller = getActiveUrlControllerOrNull()
  if (!controller) {
    throw new Error(
      'FilmDrop: URL controller accessed before FilmDropRoot mount.'
    )
  }
  return controller
}

export function __resetActiveUrlControllerForTests() {
  liveUrlControllers.clear()
  activeUrlController = null
}
