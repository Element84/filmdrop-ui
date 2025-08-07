const THEME_STORAGE_KEY = 'APP_THEME_PREFERENCE'

export function getSystemTheme() {
  if (typeof window !== 'undefined' && window.matchMedia) {
    return window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light'
  }
  // Fallback to dark if matchMedia is not available
  return 'dark'
}

export function calculateEffectiveTheme(userPreference) {
  switch (userPreference) {
    case 'light':
      return 'light'
    case 'dark':
      return 'dark'
    case 'system':
      return getSystemTheme()
    default:
      return 'dark' // Fallback to dark theme
  }
}

export function applyTheme(theme) {
  if (typeof document !== 'undefined') {
    document.documentElement.setAttribute('data-theme', theme)
  }
}

export function getThemeFromStorage() {
  if (typeof localStorage !== 'undefined') {
    return localStorage.getItem(THEME_STORAGE_KEY)
  }
  return null
}

export function saveThemeToStorage(theme) {
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem(THEME_STORAGE_KEY, theme)
  }
}

export function getNextTheme(currentTheme) {
  // Get next theme in the sequence: light → dark → system → light
  switch (currentTheme) {
    case 'light':
      return 'dark'
    case 'dark':
      return 'system'
    case 'system':
      return 'light'
    default:
      return 'dark' // Fallback to dark theme
  }
}

export function setupSystemThemeListener(callback) {
  if (typeof window !== 'undefined' && window.matchMedia) {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')

    const handleChange = (e) => {
      const newSystemTheme = e.matches ? 'dark' : 'light'
      callback(newSystemTheme)
    }

    // Use the newer addEventListener if available, fallback to addListener
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange)
      return () => mediaQuery.removeEventListener('change', handleChange)
    } else if (mediaQuery.addListener) {
      mediaQuery.addListener(handleChange)
      return () => mediaQuery.removeListener(handleChange)
    }
  }

  // Return a no-op cleanup function if no listener was set up
  return () => {}
}

export function getBasemapConfig(appConfig, effectiveTheme) {
  // Return null if no BASEMAP configuration exists
  if (!appConfig.BASEMAP) {
    return null
  }

  // Check if this is single basemap mode (has url property directly)
  if (appConfig.BASEMAP.url) {
    return {
      url: appConfig.BASEMAP.url,
      attribution: appConfig.BASEMAP.attribution
    }
  }

  // Theme switching enabled and not single basemap mode - use the effective theme
  if (appConfig.THEME_SWITCHING_ENABLED === true && effectiveTheme) {
    return appConfig.BASEMAP[effectiveTheme]
  }

  // No valid basemap found for the current theme
  return null
}

export function getBrandLogoConfig(appConfig, effectiveTheme) {
  // Check if brand logo is configured
  if (!appConfig.BRAND_LOGO) {
    return null
  }

  const config = appConfig.BRAND_LOGO
  let logoImage = config.image

  // Theme-specific logo selection (only when theme switching is enabled)
  if (appConfig.THEME_SWITCHING_ENABLED === true && effectiveTheme) {
    if (effectiveTheme === 'light' && config.image_light) {
      logoImage = config.image_light
    } else if (effectiveTheme === 'dark' && config.image_dark) {
      logoImage = config.image_dark
    }
  }

  // If no valid image found, return null (do not render logo)
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

export function initializeTheme(appConfig) {
  const switchingEnabled = appConfig.THEME_SWITCHING_ENABLED === true

  if (!switchingEnabled) {
    return {
      currentTheme: null, // Not used if not switching themes
      effectiveTheme: null, // Not used if not switching themes
      switchingEnabled: false
    }
  }

  const defaultTheme = appConfig.DEFAULT_THEME || 'dark'

  let currentTheme = getThemeFromStorage()
  if (!currentTheme) {
    currentTheme = defaultTheme
  }

  const effectiveTheme = calculateEffectiveTheme(currentTheme)

  return {
    currentTheme,
    effectiveTheme,
    switchingEnabled: true
  }
}
