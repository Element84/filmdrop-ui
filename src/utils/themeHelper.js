import { DEFAULT_BASEMAP } from '../constants/defaults'

const THEME_STORAGE_KEY = 'APP_THEME_PREFERENCE'

/**
 * Returns true when FilmDrop should write branding to the host document
 * (title, favicon, <html> data-theme). Default true for SPA mode;
 * FilmDropRoot sets `window.__filmdropApplyBranding = false` when the
 * consumer passes `applyDocumentBranding={false}`.
 */
export function shouldApplyDocumentBranding() {
  if (typeof window === 'undefined') return true
  return window.__filmdropApplyBranding !== false
}

/**
 * Returns true when FilmDrop should persist theme preference to
 * localStorage. Gated by the `persistThemePreference` prop on
 * FilmDropRoot.
 */
export function shouldPersistThemePreference() {
  if (typeof window === 'undefined') return true
  return window.__filmdropPersistThemePreference !== false
}

export function getSystemTheme() {
  if (typeof window !== 'undefined' && window.matchMedia) {
    return window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light'
  }
  return 'light'
}

export function applyTheme(theme) {
  if (typeof document === 'undefined') return
  const themeValue = theme === 'filmdrop' ? 'filmdrop' : `filmdrop-${theme}`
  // Mirror onto any mounted .filmdrop-root container so the scoped
  // selectors (`.filmdrop-root[data-theme='filmdrop-*']`) match in
  // embedded mode.
  const roots = document.querySelectorAll('.filmdrop-root')
  roots.forEach((el) => el.setAttribute('data-theme', themeValue))
  if (shouldApplyDocumentBranding()) {
    document.documentElement.setAttribute('data-theme', themeValue)
  }
}

export function getThemeFromStorage() {
  if (typeof localStorage !== 'undefined') {
    return localStorage.getItem(THEME_STORAGE_KEY)
  }
  return null
}

export function saveThemeToStorage(theme) {
  if (typeof localStorage === 'undefined') return
  if (!shouldPersistThemePreference()) return
  localStorage.setItem(THEME_STORAGE_KEY, theme)
}

export function getBasemapConfig(appConfig, currentTheme) {
  // BASEMAP is always defined due to applyConfigDefaults()
  // Check if this is single basemap mode (has url property directly)
  if (appConfig.BASEMAP.url) {
    return {
      url: appConfig.BASEMAP.url,
      attribution: appConfig.BASEMAP.attribution
    }
  }

  // Theme-based basemap (THEME_SWITCHING_ENABLED must be true)
  if (appConfig.THEME_SWITCHING_ENABLED === true && currentTheme) {
    return appConfig.BASEMAP[currentTheme] || DEFAULT_BASEMAP
  }

  return DEFAULT_BASEMAP
}

export function getBrandLogoConfig(appConfig, currentTheme) {
  if (!appConfig.BRAND_LOGO) {
    return null
  }

  const config = appConfig.BRAND_LOGO
  let logoImage = config.image

  if (appConfig.THEME_SWITCHING_ENABLED === true && currentTheme) {
    if (currentTheme === 'light' && config.image_light) {
      logoImage = config.image_light
    } else if (currentTheme === 'dark' && config.image_dark) {
      logoImage = config.image_dark
    }
  }

  if (!logoImage) {
    return null
  }

  return {
    url: config.url,
    title: config.title,
    alt: config.alt,
    image: logoImage
  }
}

function validateThemeCSS(switchingEnabled) {
  if (typeof document === 'undefined') {
    return // Skip validation in non-browser environments
  }

  let hasFilmdropRootSelector = false
  let hasFilmdropDarkThemeSelector = false
  let hasFilmdropLightThemeSelector = false

  try {
    // Check all loaded stylesheets
    for (let i = 0; i < document.styleSheets.length; i++) {
      const stylesheet = document.styleSheets[i]

      try {
        // Check all CSS rules in this stylesheet
        const rules = stylesheet.cssRules || stylesheet.rules
        for (let j = 0; j < rules.length; j++) {
          const rule = rules[j]

          if (rule.selectorText) {
            // Accept either the host-scoped `:root[data-theme=…]`
            // selector (SPA mode) or the container-scoped
            // `.filmdrop-root[data-theme=…]` variant that ships
            // alongside it for embedded mode.
            const matches = rule.selectorText.matchAll(
              /(?::root|\.filmdrop-root)\[data-theme=['"](filmdrop(?:-dark|-light)?)['"]\]/g
            )
            for (const match of matches) {
              switch (match[1]) {
                case 'filmdrop':
                  hasFilmdropRootSelector = true
                  break
                case 'filmdrop-dark':
                  hasFilmdropDarkThemeSelector = true
                  break
                case 'filmdrop-light':
                  hasFilmdropLightThemeSelector = true
                  break
              }
            }
          }
        }
      } catch (e) {
        // Skip stylesheets that can't be accessed (CORS restrictions)
        continue
      }
    }
  } catch (e) {
    console.warn('Unable to validate CSS rules:', e.message)
    return
  }

  if (switchingEnabled) {
    if (!hasFilmdropDarkThemeSelector) {
      throw new Error(
        'THEME_SWITCHING_ENABLED is true but no :root[data-theme="filmdrop-dark"] CSS rule found. ' +
          'Theme switching requires :root[data-theme="filmdrop-dark"] and :root[data-theme="filmdrop-light"] selectors.'
      )
    }
    if (!hasFilmdropLightThemeSelector) {
      throw new Error(
        'THEME_SWITCHING_ENABLED is true but no :root[data-theme="filmdrop-light"] CSS rule found. ' +
          'Theme switching requires :root[data-theme="filmdrop-dark"] and :root[data-theme="filmdrop-light"] selectors.'
      )
    }
  } else {
    if (!hasFilmdropRootSelector) {
      throw new Error(
        'THEME_SWITCHING_ENABLED is false but no :root[data-theme="filmdrop"] CSS rule found. ' +
          'Single theme mode requires a :root[data-theme="filmdrop"] selector with CSS variables.'
      )
    }
  }
}

export function initializeTheme(appConfig) {
  const switchingEnabled = appConfig.THEME_SWITCHING_ENABLED === true

  validateThemeCSS(switchingEnabled)

  if (!switchingEnabled) {
    return {
      currentTheme: 'filmdrop',
      switchingEnabled: false
    }
  }

  let currentTheme = getThemeFromStorage()

  if (!currentTheme) {
    try {
      currentTheme = getSystemTheme()
    } catch (error) {
      currentTheme = 'light'
    }
  }

  return {
    currentTheme,
    switchingEnabled: true
  }
}

/**
 * Gets the computed value of a CSS custom property from the document root.
 * @param {string} variableName - The CSS variable name (e.g., '--map-geometry-search-result')
 * @returns {string} The computed value of the CSS variable
 */
export function getCSSVariable(variableName) {
  if (typeof document === 'undefined') {
    return ''
  }
  return getComputedStyle(document.documentElement)
    .getPropertyValue(variableName)
    .trim()
}

/**
 * Gets map geometry colors from CSS variables.
 * Call this when rendering map layers to get theme-aware colors.
 * @returns {Object} Object containing all map geometry color values
 */
export function getMapGeometryColors() {
  return {
    searchResult: getCSSVariable('--map-geometry-search-result') || '#3183f5',
    searchResultFill:
      getCSSVariable('--map-geometry-search-result-fill') || '#3183f52e',
    aoiBoundary: getCSSVariable('--map-geometry-aoi-boundary') || '#00c07b',
    highlighted: getCSSVariable('--map-geometry-highlighted') || '#bea835',
    cartItem: getCSSVariable('--map-geometry-cart-item') || '#ad5c11',
    cartItemFill: getCSSVariable('--map-geometry-cart-item-fill') || '#ad5c1129'
  }
}
