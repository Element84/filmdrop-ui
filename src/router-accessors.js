import { extractPathParamsFromMatches } from './router-path-params'

export function createRouterAccessors(router) {
  if (!router) {
    throw new Error(
      'FilmDrop: createRouterAccessors requires a router instance'
    )
  }

  return {
    navigate: (options) => router.navigate(options),
    getPathParams: () => extractPathParamsFromMatches(router?.state?.matches),
    // Return an immutable snapshot to avoid accidental external mutation.
    getSearch: () =>
      Object.freeze({ ...(router.state?.location?.search || {}) })
  }
}
