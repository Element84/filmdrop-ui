import { describe, it, expect, afterEach } from 'vitest'
import {
  shouldApplyDocumentBranding,
  shouldPersistThemePreference,
  applyTheme,
  initializeTheme,
  getBrandLogoConfig
} from './themeHelper'

function mockThemeStylesheet() {
  Object.defineProperty(document, 'styleSheets', {
    configurable: true,
    value: [
      {
        cssRules: [
          { selectorText: ":root[data-theme='filmdrop']" },
          { selectorText: ":root[data-theme='filmdrop-dark']" },
          { selectorText: ":root[data-theme='filmdrop-light']" }
        ]
      }
    ]
  })
}

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

describe('applyTheme', () => {
  afterEach(() => {
    delete window.__filmdropApplyBranding
    document.documentElement.removeAttribute('data-theme')
    document.documentElement.removeAttribute('data-filmdrop-theme')
  })

  it('always sets data-filmdrop-theme on html', () => {
    window.__filmdropApplyBranding = false

    applyTheme('dark')

    expect(document.documentElement.getAttribute('data-filmdrop-theme')).toBe(
      'filmdrop-dark'
    )
  })

  it('does not set data-theme on html when document branding is disabled', () => {
    window.__filmdropApplyBranding = false

    applyTheme('light')

    expect(document.documentElement.getAttribute('data-theme')).toBeNull()
  })

  it('sets data-theme on html when document branding is enabled', () => {
    window.__filmdropApplyBranding = true

    applyTheme('light')

    expect(document.documentElement.getAttribute('data-theme')).toBe(
      'filmdrop-light'
    )
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

describe('initializeTheme', () => {
  afterEach(() => {
    delete window.__filmdropPersistThemePreference
    localStorage.removeItem('APP_THEME_PREFERENCE')
  })

  it('ignores localStorage when persistThemePreference is false', () => {
    mockThemeStylesheet()
    window.__filmdropPersistThemePreference = false
    localStorage.setItem('APP_THEME_PREFERENCE', 'dark')
    window.matchMedia = () => ({ matches: false })

    const result = initializeTheme({ THEME_SWITCHING_ENABLED: true })

    expect(result.currentTheme).toBe('light')
  })

  it('normalizes legacy filmdrop-dark value from localStorage', () => {
    mockThemeStylesheet()
    window.__filmdropPersistThemePreference = true
    localStorage.setItem('APP_THEME_PREFERENCE', 'filmdrop-dark')

    const result = initializeTheme({ THEME_SWITCHING_ENABLED: true })

    expect(result.currentTheme).toBe('dark')
  })

  it('falls back to system theme when stored value is invalid', () => {
    mockThemeStylesheet()
    window.__filmdropPersistThemePreference = true
    localStorage.setItem('APP_THEME_PREFERENCE', 'not-a-theme')
    window.matchMedia = () => ({ matches: true })

    const result = initializeTheme({ THEME_SWITCHING_ENABLED: true })

    expect(result.currentTheme).toBe('dark')
  })

  it('returns single-theme token when switching is disabled', () => {
    mockThemeStylesheet()
    window.__filmdropPersistThemePreference = false

    const result = initializeTheme({ THEME_SWITCHING_ENABLED: false })

    expect(result.currentTheme).toBe('filmdrop')
    expect(result.switchingEnabled).toBe(false)
  })
})

describe('getBrandLogoConfig', () => {
  it('uses system theme image when currentTheme is null and theme switching is enabled', () => {
    window.matchMedia = () => ({ matches: true })
    const result = getBrandLogoConfig(
      {
        THEME_SWITCHING_ENABLED: true,
        BRAND_LOGO: {
          url: 'https://example.com',
          title: 'Brand',
          alt: 'Brand Logo',
          image: null,
          image_light: '/app/config/brand-light.svg',
          image_dark: '/app/config/brand-dark.svg'
        }
      },
      null
    )

    expect(result).toBeTruthy()
    expect(result.image).toBe('/app/config/brand-dark.svg')
  })
})
