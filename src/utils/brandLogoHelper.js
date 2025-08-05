/**
 * Brand Logo Helper Utility
 * Manages brand logo configuration and theme-aware logo selection
 */

/**
 * Gets brand logo configuration based on current theme
 * @param {Object} appConfig - Application configuration
 * @param {string} effectiveTheme - Current effective theme ('light' or 'dark')
 * @returns {Object|null} - Brand logo config or null if disabled
 */
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
    // If no theme-specific image found, fall back to default config.image
  }

  // If no valid image found, return null (don't render logo)
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
