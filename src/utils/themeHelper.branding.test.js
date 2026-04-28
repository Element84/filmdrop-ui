import { describe, it, expect, afterEach } from 'vitest'
import {
  shouldApplyDocumentBranding,
  shouldPersistThemePreference
} from './themeHelper'

describe('shouldApplyDocumentBranding', () => {
  afterEach(() => {
    delete window.__filmdropApplyBranding
  })

  it('defaults to true when the flag is unset', () => {
    expect(shouldApplyDocumentBranding()).toBe(true)
  })

  it('returns true when flag is explicitly true', () => {
    window.__filmdropApplyBranding = true
    expect(shouldApplyDocumentBranding()).toBe(true)
  })

  it('returns false only when flag is strictly `false`', () => {
    window.__filmdropApplyBranding = false
    expect(shouldApplyDocumentBranding()).toBe(false)
  })

  it('treats string "false" as truthy (not a boolean false)', () => {
    window.__filmdropApplyBranding = 'false'
    expect(shouldApplyDocumentBranding()).toBe(true)
  })
})

describe('shouldPersistThemePreference', () => {
  afterEach(() => {
    delete window.__filmdropPersistThemePreference
  })

  it('defaults to true when the flag is unset', () => {
    expect(shouldPersistThemePreference()).toBe(true)
  })

  it('returns true when flag is explicitly true', () => {
    window.__filmdropPersistThemePreference = true
    expect(shouldPersistThemePreference()).toBe(true)
  })

  it('returns false only when flag is strictly `false`', () => {
    window.__filmdropPersistThemePreference = false
    expect(shouldPersistThemePreference()).toBe(false)
  })

  it('treats 0 as truthy (not a boolean false)', () => {
    window.__filmdropPersistThemePreference = 0
    expect(shouldPersistThemePreference()).toBe(true)
  })
})
