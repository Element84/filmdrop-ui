import { describe, it, expect, vi } from 'vitest'
import {
  STAC_UPLOAD_ERROR_CONTEXT_LABEL,
  MAX_STAC_ERROR_BODY_CHARS,
  getStacErrorResult,
  normalizeStacErrorResponse,
  normalizeStacNetworkError
} from './stacErrorHelper'

describe('normalizeStacErrorResponse', () => {
  it('returns status-only messaging for empty response body', async () => {
    const response = {
      status: 400,
      text: vi.fn(async () => '')
    }

    const result = await normalizeStacErrorResponse(
      response,
      STAC_UPLOAD_ERROR_CONTEXT_LABEL
    )

    expect(result).toEqual(
      expect.objectContaining({
        error: true,
        status: 400,
        code: null,
        summary: STAC_UPLOAD_ERROR_CONTEXT_LABEL,
        details: 'Request failed (status 400)'
      })
    )
  })

  it('treats non-JSON bodies as plain text', async () => {
    const response = {
      status: 400,
      text: vi.fn(async () => 'Bad Request')
    }

    const result = await normalizeStacErrorResponse(
      response,
      STAC_UPLOAD_ERROR_CONTEXT_LABEL
    )

    expect(result).toEqual(
      expect.objectContaining({
        error: true,
        status: 400,
        code: null,
        summary: STAC_UPLOAD_ERROR_CONTEXT_LABEL,
        details: 'Bad Request'
      })
    )
  })

  it('unwraps quoted JSON-string messages', async () => {
    const responseBody = {
      code: 'BadRequest',
      description: '"geo coordinates must be numbers"'
    }

    const response = {
      status: 400,
      text: vi.fn(async () => JSON.stringify(responseBody))
    }

    const result = await normalizeStacErrorResponse(
      response,
      STAC_UPLOAD_ERROR_CONTEXT_LABEL
    )

    expect(result).toEqual(
      expect.objectContaining({
        error: true,
        status: 400,
        code: 'BadRequest',
        summary: STAC_UPLOAD_ERROR_CONTEXT_LABEL,
        details: 'geo coordinates must be numbers'
      })
    )
  })

  it('stringifies non-string message objects', async () => {
    const responseBody = {
      code: 'BadRequest',
      message: { foo: 'bar' }
    }

    const response = {
      status: 400,
      text: vi.fn(async () => JSON.stringify(responseBody))
    }

    const result = await normalizeStacErrorResponse(
      response,
      STAC_UPLOAD_ERROR_CONTEXT_LABEL
    )

    expect(result).toEqual(
      expect.objectContaining({
        error: true,
        status: 400,
        code: 'BadRequest',
        summary: STAC_UPLOAD_ERROR_CONTEXT_LABEL,
        details: JSON.stringify(responseBody.message)
      })
    )
  })

  it('handles very long message strings', async () => {
    const longMessage = 'a'.repeat(20000)
    const responseBody = {
      code: 'BadRequest',
      message: longMessage
    }

    const response = {
      status: 400,
      text: vi.fn(async () => JSON.stringify(responseBody))
    }

    const result = await normalizeStacErrorResponse(
      response,
      STAC_UPLOAD_ERROR_CONTEXT_LABEL
    )

    expect(result.details).toBe(longMessage)
  })

  it('truncates oversized non-JSON error bodies', async () => {
    const huge = 'h'.repeat(MAX_STAC_ERROR_BODY_CHARS + 5000)
    const response = {
      status: 502,
      text: vi.fn(async () => huge)
    }

    const result = await normalizeStacErrorResponse(
      response,
      STAC_UPLOAD_ERROR_CONTEXT_LABEL
    )

    const suffix = '\n…[truncated]'
    expect(result.details.length).toBe(
      MAX_STAC_ERROR_BODY_CHARS + suffix.length
    )
    expect(result.details.endsWith(suffix)).toBe(true)
    expect(result.details.startsWith('h')).toBe(true)
  })
})

describe('normalizeStacNetworkError', () => {
  it('normalizes network errors into a STAC-like shape', () => {
    const result = normalizeStacNetworkError(
      new Error('Network error'),
      STAC_UPLOAD_ERROR_CONTEXT_LABEL
    )

    expect(result).toEqual(
      expect.objectContaining({
        error: true,
        status: null,
        code: null,
        summary: STAC_UPLOAD_ERROR_CONTEXT_LABEL,
        details: 'Network error'
      })
    )
  })
})

describe('getStacErrorResult', () => {
  it('returns result when error flag is present', () => {
    const result = { error: true, summary: 'Boom' }
    expect(getStacErrorResult(result)).toBe(result)
  })

  it('returns undefined when result is missing or not an error payload', () => {
    expect(getStacErrorResult(undefined)).toBeUndefined()
    expect(getStacErrorResult({})).toBeUndefined()
    expect(getStacErrorResult({ error: false })).toBeUndefined()
  })
})
