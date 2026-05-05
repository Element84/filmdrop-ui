import { store } from '../redux/store'
import { buildStacRequestHeaders } from '../utils/stacRequest'
import {
  normalizeStacErrorResponse,
  normalizeStacNetworkError
} from '../utils/stacErrorHelper'

/**
 * Maximum nested $ref depth. Beyond this, treat the schema as hostile
 * (cycle or DoS) and bail.
 */
const MAX_REF_DEPTH = 10

/**
 * Recursive $ref resolver for JSON Schema. Exported for tests.
 *
 * Defends against:
 *   1. Circular `$ref` chains (tracked in `visited`).
 *   2. Pathologically deep nesting (`MAX_REF_DEPTH`).
 *   3. Redundant network fetches for the same URL (`fetchCache`).
 */
export async function resolveRefs(schema, ctx) {
  const visited = ctx?.visited || new Set()
  const fetchCache = ctx?.fetchCache || new Map()
  const depth = ctx?.depth || 0

  if (!schema || typeof schema !== 'object') {
    return schema
  }

  if (depth > MAX_REF_DEPTH) {
    console.warn(
      `Queryables $ref resolution aborted: depth exceeded ${MAX_REF_DEPTH}`
    )
    return schema
  }

  if (schema.$ref && typeof schema.$ref === 'string') {
    const refUrl = schema.$ref
    if (visited.has(refUrl)) {
      console.warn(
        `Queryables $ref cycle detected at ${refUrl}; leaving unresolved`
      )
      return schema
    }
    try {
      let refSchema
      if (fetchCache.has(refUrl)) {
        refSchema = fetchCache.get(refUrl)
      } else {
        const response = await fetch(refUrl, {
          headers: ctx?.requestHeaders,
          credentials: ctx?.fetchCredentials
        })
        if (!response.ok) {
          throw new Error(`Failed to fetch ${refUrl}`)
        }
        refSchema = await response.json()
        fetchCache.set(refUrl, refSchema)
      }

      let target = refSchema
      // If the $ref points to a fragment, drill down to it
      if (refUrl.includes('#')) {
        const [, fragment] = refUrl.split('#')
        const path = fragment.split('/').filter(Boolean)
        for (const part of path) {
          target = target[part]
          if (!target) {
            throw new Error(
              `Failed to resolve fragment path "${fragment}" in ${refUrl}: path segment "${part}" not found`
            )
          }
        }
      }

      // Clone `visited` rather than mutate-and-restore: the array /
      // object branches below recurse via `Promise.all`, so a sibling
      // would otherwise observe an in-flight `visited` entry and
      // skip a legitimate resolution.
      const nextVisited = new Set(visited)
      nextVisited.add(refUrl)
      return await resolveRefs(target, {
        visited: nextVisited,
        fetchCache,
        depth: depth + 1
      })
    } catch (error) {
      console.warn(`Failed to resolve $ref ${refUrl}:`, error)
      return schema
    }
  }

  // Recursively resolve $refs in arrays
  if (Array.isArray(schema)) {
    return Promise.all(
      schema.map((item) =>
        resolveRefs(item, { visited, fetchCache, depth: depth + 1 })
      )
    )
  }

  const entries = await Promise.all(
    Object.entries(schema).map(async ([key, value]) => [
      key,
      await resolveRefs(value, {
        visited,
        fetchCache,
        depth: depth + 1
      })
    ])
  )
  return Object.fromEntries(entries)
}

/**
 * Get queryables for a STAC collection
 * @param {Object} collection - Collection object with id and links array
 * @returns {Promise<Object>} Queryables properties object or error object (fully dereferenced)
 */
export function GetCollectionQueryablesService(collection) {
  const collectionId = collection.id
  const requestHeaders = buildStacRequestHeaders()
  const contextLabel = `Error fetching queryables for: ${collectionId}`

  // Check if collection has queryables link in its links array
  const queryablesLink = collection?.links?.find(
    (link) => link.rel === 'http://www.opengis.net/def/rel/ogc/1.0/queryables'
  )

  // Collection doesn't expose queryables — nothing to load.
  if (!queryablesLink) {
    return Promise.resolve({})
  }

  return fetch(queryablesLink.href, {
    credentials:
      store.getState().mainSlice.appConfig.FETCH_CREDENTIALS || 'same-origin',
    headers: requestHeaders
  })
    .then(async (response) => {
      if (!response.ok) {
        const normalizedError = await normalizeStacErrorResponse(
          response,
          contextLabel
        )
        console.error(contextLabel, normalizedError)
        return normalizedError
      }

      const json = await response.json()

      // Dereference all $ref URLs in the queryables properties
      try {
        const properties = json.properties || {}
        const credentials =
          store.getState().mainSlice.appConfig.FETCH_CREDENTIALS ||
          'same-origin'
        const dereferenced = await resolveRefs(properties, {
          requestHeaders,
          fetchCredentials: credentials
        })
        return dereferenced
      } catch (refError) {
        console.warn(
          `Failed to dereference $refs for ${collectionId}:`,
          refError
        )
        console.warn('Falling back to unresolved properties')
        // Fall back to returning properties as-is if dereferencing fails
        return json.properties || {}
      }
    })
    .catch((error) => {
      if (error?.name === 'AbortError') {
        return undefined
      }
      const normalizedError = normalizeStacNetworkError(error, contextLabel)
      console.error(contextLabel, normalizedError)
      return normalizedError
    })
}
