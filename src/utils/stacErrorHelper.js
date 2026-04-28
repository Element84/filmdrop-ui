export const STAC_UPLOAD_ERROR_CONTEXT_LABEL =
  'Unable to search the uploaded area'

export const MAX_STAC_ERROR_BODY_CHARS = 32768

export function getStacErrorResult(result) {
  return result && result.error ? result : undefined
}

function unquoteIfJsonString(s) {
  const trimmed = s.trim()
  if (trimmed.startsWith('"') && trimmed.endsWith('"') && trimmed.length >= 2) {
    try {
      const unquoted = JSON.parse(trimmed)
      return typeof unquoted === 'string' ? unquoted : s
    } catch (e) {
      return s
    }
  }
  return s
}

export async function normalizeStacErrorResponse(response, contextLabel) {
  const status = response?.status ?? null
  const baseLabel = contextLabel || 'STAC request failed'

  let rawText = ''
  try {
    const fullText = await response.text()
    rawText =
      fullText.length > MAX_STAC_ERROR_BODY_CHARS
        ? `${fullText.slice(0, MAX_STAC_ERROR_BODY_CHARS)}\n…[truncated]`
        : fullText
  } catch (error) {
    // If we cannot read the body, fall back to status-only messaging
    return {
      error: true,
      status,
      code: null,
      summary: `${baseLabel} (status ${status ?? 'unknown'})`,
      details: ''
    }
  }

  if (!rawText) {
    return {
      error: true,
      status,
      code: null,
      summary: baseLabel,
      details: `Request failed${status ? ` (status ${status})` : ''}`
    }
  }

  try {
    const json = JSON.parse(rawText)
    const code = json.code || null
    const summary = baseLabel

    const rawDetails =
      json.message || json.detail || json.title || json.description || rawText

    // Some backends wrap the human message in a JSON-string, e.g.
    // description: "\"geo coordinates must be numbers\""
    // After JSON parsing, that becomes a string that still includes quotes.
    const details =
      typeof rawDetails === 'string'
        ? unquoteIfJsonString(rawDetails)
        : typeof rawDetails === 'undefined'
          ? ''
          : JSON.stringify(rawDetails)

    return {
      error: true,
      status,
      code,
      summary,
      details
    }
  } catch (error) {
    // Non-JSON body, treat as plain text
    return {
      error: true,
      status,
      code: null,
      summary: baseLabel,
      details: rawText
    }
  }
}

export function normalizeStacNetworkError(error, contextLabel) {
  const baseLabel = contextLabel || 'STAC request failed'

  return {
    error: true,
    status: null,
    code: null,
    summary: baseLabel,
    details: error?.message || String(error)
  }
}
