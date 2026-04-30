import React from 'react'
import { describe, it, expect, vi } from 'vitest'

import { render } from '@testing-library/react'
import { FilmDropRoot } from 'filmdrop-ui'
import App from './App'

// Mock the library so the test exercises App's wiring only.
vi.mock('filmdrop-ui', () => ({
  FilmDropRoot: vi.fn(() => null)
}))
vi.mock('filmdrop-ui/style.css', () => ({}))
vi.mock('leaflet/dist/leaflet.css', () => ({}))
vi.mock('leaflet-draw/dist/leaflet.draw.css', () => ({}))

describe('starter App.jsx contract', () => {
  it('mounts FilmDropRoot exactly once', () => {
    render(<App />)
    expect(FilmDropRoot).toHaveBeenCalledTimes(1)
  })

  it('passes embedded-host flags to FilmDropRoot', () => {
    render(<App />)
    const props = FilmDropRoot.mock.calls[0][0]
    expect(props.basename).toBe('/app')
    expect(props.applyDocumentBranding).toBe(false)
    expect(props.persistThemePreference).toBe(false)
    expect(props.configCacheBuster).toBe('none')
  })

  it('points configUrl at the /app config file', () => {
    render(<App />)
    const props = FilmDropRoot.mock.calls[0][0]
    expect(props.configUrl).toBe('/app/config/config.json')
  })

  it('wires onError and onOpenExternal as functions', () => {
    render(<App />)
    const props = FilmDropRoot.mock.calls[0][0]
    expect(typeof props.onError).toBe('function')
    expect(typeof props.onOpenExternal).toBe('function')
  })
})
