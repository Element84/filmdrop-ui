import { describe, it, expect } from 'vitest'
import {
  filterLinks,
  groupLinksByRel,
  isHttpLink,
  getRelTypeTitle,
  getLinkTypeFromMimeOrUrl,
  truncateHref
} from './defaultLinkGrouping'

describe('defaultLinkGrouping utilities', () => {
  it('filters excluded rel types and invalid link entries', () => {
    const result = filterLinks([
      { rel: 'self', href: 'https://example.com/self' },
      { rel: 'thumbnail', href: 'https://example.com/thumb.jpg' },
      { href: 'https://example.com/no-rel' },
      null,
      { rel: 'license', href: 'https://example.com/license' }
    ])

    expect(result).toEqual([
      { rel: 'self', href: 'https://example.com/self' },
      { rel: 'license', href: 'https://example.com/license' }
    ])
  })

  it('groups links by rel and keeps self group first', () => {
    const groups = groupLinksByRel([
      { rel: 'license', href: 'https://example.com/license' },
      { rel: 'self', href: 'https://example.com/self' },
      { rel: 'license', href: 'https://example.com/license-2' }
    ])

    expect(groups.map((group) => group.rel)).toEqual(['self', 'license'])
    expect(groups[1].links).toHaveLength(2)
  })

  it('detects HTTP links and infers display names/types', () => {
    expect(isHttpLink('https://example.com')).toBe(true)
    expect(isHttpLink('s3://bucket/file.json')).toBe(false)

    expect(getRelTypeTitle('derived_from')).toBe('Derived From')
    expect(getRelTypeTitle('')).toBe('Link')

    expect(getLinkTypeFromMimeOrUrl('application/json', '')).toBe('JSON')
    expect(getLinkTypeFromMimeOrUrl('', 'https://example.com/file.pdf')).toBe(
      'PDF'
    )
    expect(getLinkTypeFromMimeOrUrl('', 'https://example.com/file.bin')).toBe(
      'Unknown'
    )
  })

  it('truncates long href values while preserving meaningful URL parts', () => {
    const longUrl =
      'https://planetary.example.com/collections/sentinel-2/items/scene-1234567890/very-long-filename-that-keeps-going.json'

    const truncated = truncateHref(longUrl, 60)

    expect(truncated).not.toBe(longUrl)
    expect(truncated).toContain('planetary.example.com')
    expect(truncated).toContain('...')
  })
})
