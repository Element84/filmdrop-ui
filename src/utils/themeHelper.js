// Theme Helper Utility
// Manages theme detection, calculation, persistence, and application

const THEME_STORAGE_KEY = 'APP_THEME_PREFERENCE'

/**
 * Detects the system's preferred color scheme
 * @returns {'light' | 'dark'} - The system's preferred theme
 */
export function getSystemTheme() {
  if (typeof window !== 'undefined' && window.matchMedia) {
    return window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light'
  }
  // Fallback to dark if matchMedia is not available
  return 'dark'
}

/**
 * Calculates the effective theme based on user preference
 * @param {string} userPreference - 'light', 'dark', or 'system'
 * @returns {'light' | 'dark'} - The theme that should actually be applied
 */
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

/**
 * Applies the theme to the DOM by setting data-theme attribute
 * @param {'light' | 'dark'} theme - The theme to apply
 */
export function applyTheme(theme) {
  if (typeof document !== 'undefined') {
    document.documentElement.setAttribute('data-theme', theme)
  }
}

/**
 * Retrieves the saved theme preference from localStorage
 * @returns {string | null} - The saved theme preference or null if not found
 */
export function getThemeFromStorage() {
  if (typeof localStorage !== 'undefined') {
    return localStorage.getItem(THEME_STORAGE_KEY)
  }
  return null
}

/**
 * Saves the theme preference to localStorage
 * @param {string} theme - The theme preference to save ('light', 'dark', or 'system')
 */
export function saveThemeToStorage(theme) {
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem(THEME_STORAGE_KEY, theme)
  }
}

/**
 * Cycles to the next theme in the sequence: light → dark → system → light
 * @param {string} currentTheme - The current theme preference
 * @returns {string} - The next theme in the cycle
 */
export function getNextTheme(currentTheme) {
  switch (currentTheme) {
    case 'light':
      return 'dark'
    case 'dark':
      return 'system'
    case 'system':
      return 'light'
    default:
      return 'light'
  }
}

/**
 * Sets up a listener for system theme changes
 * @param {Function} callback - Function to call when system theme changes
 * @returns {Function} - Cleanup function to remove the listener
 */
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

/**
 * Initializes the theme system with proper fallback priority
 * @param {Object} appConfig - The application configuration object
 * @returns {Object} - Object containing currentTheme and effectiveTheme
 */
export function initializeTheme(appConfig) {
  // Priority: localStorage → config → system
  let currentTheme = getThemeFromStorage()

  if (!currentTheme) {
    // Check config for DARK_THEME setting
    if (appConfig && typeof appConfig.DARK_THEME === 'boolean') {
      currentTheme = appConfig.DARK_THEME ? 'dark' : 'light'
    } else {
      // Fallback to system preference
      currentTheme = 'system'
    }
  }

  const effectiveTheme = calculateEffectiveTheme(currentTheme)

  return {
    currentTheme,
    effectiveTheme
  }
}
