import { store } from '../redux/store'
import { getAuthToken } from '../utils/authHelper'
import { appendStacHeaderCookies } from '../utils/stacRequest'

/**
 * Recursive $ref resolver for JSON Schema
 * @param {Object} schema - Schema object that may contain $ref
 * @returns {Promise<Object>} Resolved schema
 */
async function resolveRefs(schema) {
  if (!schema || typeof schema !== 'object') {
    return schema
  }

  // If we have a $ref, resolve it
  if (schema.$ref && typeof schema.$ref === 'string') {
    try {
      const response = await fetch(schema.$ref)
      if (!response.ok) {
        throw new Error(`Failed to fetch ${schema.$ref}`)
      }
      const refSchema = await response.json()

      // If the $ref points to a fragment, return just that fragment
      if (schema.$ref.includes('#')) {
        const [, fragment] = schema.$ref.split('#')
        const path = fragment.split('/').filter(Boolean)
        let resolved = refSchema
        for (const part of path) {
          resolved = resolved[part]
          if (!resolved) {
            throw new Error(
              `Failed to resolve fragment path "${fragment}" in ${schema.$ref}: path segment "${part}" not found`
            )
          }
        }
        return resolved
      }
      return refSchema
    } catch (error) {
      console.warn(`Failed to resolve $ref ${schema.$ref}:`, error)
      return schema
    }
  }

  // Recursively resolve $refs in nested and arrays
  if (Array.isArray(schema)) {
    return Promise.all(schema.map((item) => resolveRefs(item)))
  }

  // Recursively resolve $refs in nested objects
  const resolved = {}
  for (const [key, value] of Object.entries(schema)) {
    resolved[key] = await resolveRefs(value)
  }
  return resolved
}

/**
 * Get queryables for a STAC collection
 * @param {Object} collection - Collection object with id and links array
 * @returns {Promise<Object>} Queryables properties object or error object (fully dereferenced)
 */
export function GetCollectionQueryablesService(collection) {
  const collectionId = collection.id
  const requestHeaders = new Headers()
  const JWT = getAuthToken()
  const isSTACTokenAuthEnabled =
    store.getState().mainSlice.appConfig.APP_TOKEN_AUTH_ENABLED ?? false
  if (JWT && isSTACTokenAuthEnabled) {
    requestHeaders.append('Authorization', `Bearer ${JWT}`)
  }
  appendStacHeaderCookies(requestHeaders)

  // Check if collection has queryables link in its links array
  const queryablesLink = collection?.links?.find(
    (link) => link.rel === 'http://www.opengis.net/def/rel/ogc/1.0/queryables'
  )

  // If no queryables link found, return empty object (no queryables support)
  if (!queryablesLink) {
    return Promise.resolve({})
  }

  return fetch(queryablesLink.href, {
    credentials:
      store.getState().mainSlice.appConfig.FETCH_CREDENTIALS || 'same-origin',
    headers: requestHeaders
  })
    .then((response) => {
      if (response.ok) {
        return response.json()
      }
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    })
    .then(async (json) => {
      // Dereference all $ref URLs in the queryables properties
      try {
        const properties = json.properties || {}
        const dereferenced = await resolveRefs(properties)
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
      const message = `Error fetching queryables for: ${collectionId}`
      console.error(message, error)
      return {
        error: true,
        message: error.message || 'Failed to load queryables'
      }
    })
}
