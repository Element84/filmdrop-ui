import React from 'react'
import { useSelector, useDispatch } from 'react-redux'
import {
  setCurrentTheme,
  setEffectiveTheme
} from '../../redux/slices/mainSlice'
import {
  getNextTheme,
  calculateEffectiveTheme,
  applyTheme,
  saveThemeToStorage
} from '../../utils/themeHelper'
import SunIcon from '../../assets/sun-icon.svg?react'
import MoonIcon from '../../assets/moon-icon.svg?react'
import SystemIcon from '../../assets/system-icon.svg?react'
import './ThemeSwitcher.css'

const ThemeSwitcher = () => {
  const dispatch = useDispatch()
  const currentTheme = useSelector((state) => state.mainSlice.currentTheme)

  const handleThemeSwitch = () => {
    // Get the next theme in the cycle
    const nextTheme = getNextTheme(currentTheme)

    // Calculate what the effective theme should be
    const newEffectiveTheme = calculateEffectiveTheme(nextTheme)

    // Update Redux state
    dispatch(setCurrentTheme(nextTheme))
    dispatch(setEffectiveTheme(newEffectiveTheme))

    // Apply theme to DOM
    applyTheme(newEffectiveTheme)

    // Save preference to localStorage
    saveThemeToStorage(nextTheme)
  }

  const getThemeIcon = () => {
    switch (currentTheme) {
      case 'light':
        return <SunIcon />
      case 'dark':
        return <MoonIcon />
      case 'system':
        return <SystemIcon />
      default:
        return <MoonIcon />
    }
  }

  const getThemeLabel = () => {
    switch (currentTheme) {
      case 'light':
        return 'Light mode'
      case 'dark':
        return 'Dark mode'
      case 'system':
        return 'System mode'
      default:
        return 'Dark mode'
    }
  }

  return (
    <button
      className="theme-switcher"
      onClick={handleThemeSwitch}
      title={`Current: ${getThemeLabel()}. Click to switch themes.`}
      aria-label={`Switch theme. Currently ${getThemeLabel()}`}
      data-testid="theme-switcher-button"
    >
      <span className="theme-switcher-icon" aria-hidden="true">
        {getThemeIcon()}
      </span>
    </button>
  )
}

export default ThemeSwitcher
