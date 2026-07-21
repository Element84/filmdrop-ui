import React from 'react'
import { render, screen } from '@testing-library/react'
import PopupResult from './PopupResult'
import { Provider } from 'react-redux'
import { store } from '../../redux/store'
import { setAppConfig } from '../../redux/slices/mainSlice'
import { mockAppConfig, mockClickResults } from '../../testing/shared-mocks'
import { describe, beforeEach, vi, it, expect } from 'vitest'

vi.mock('../../utils/mapHelper')

vi.mock('../../hooks/useUrlNavigate', () => ({
  useUrlNavigate: () => ({
    setTab: vi.fn(),
    setViz: vi.fn(),
    setItem: vi.fn(),
    clearItem: vi.fn()
  })
}))

describe('PopupResult', () => {
  const setup = (result = mockClickResults[0]) =>
    render(
      <Provider store={store}>
        <PopupResult result={result} />
      </Provider>
    )

  beforeEach(() => {
    store.dispatch(setAppConfig(mockAppConfig))
    vi.clearAllMocks()
    // Mock Image constructor to simulate successful image load
    global.Image = vi.fn(function () {
      const img = {
        onload: null,
        onerror: null,
        src: '',
        width: 100,
        height: 100
      }
      // Trigger onload when src is set
      Object.defineProperty(img, 'src', {
        set(value) {
          this._src = value
          if (this.onload) {
            this.onload.call(this)
          }
        },
        get() {
          return this._src
        }
      })
      return img
    })
  })

  describe('thumbnail display', () => {
    it('should render thumbnail container when image loads successfully', async () => {
      setup()
      // Wait for the useEffect and state update
      await screen.findByAltText('thumbnail')
      const thumbnailContainer = screen
        .getByTestId('testPopupResult')
        .querySelector('.popupResultThumbnailContainer')
      expect(thumbnailContainer).toBeInTheDocument()
    })

    it('should handle item without thumbnail gracefully', () => {
      const itemWithoutThumbnail = {
        ...mockClickResults[0],
        links: []
      }
      setup(itemWithoutThumbnail)

      const container = screen.getByTestId('testPopupResult')
      expect(container).toBeInTheDocument()
      // No thumbnail link means no thumbnail container should render
      const thumbnailContainer = container.querySelector(
        '.popupResultThumbnailContainer'
      )
      expect(thumbnailContainer).not.toBeInTheDocument()
    })

    it('should not render thumbnail container when image fails to load', () => {
      // Mock Image to simulate failed load (e.g., 404)
      global.Image = vi.fn(function () {
        const img = {
          onload: null,
          onerror: null,
          src: '',
          width: 0,
          height: 0
        }
        Object.defineProperty(img, 'src', {
          set(value) {
            this._src = value
            // Simulate image load but with width 0 (treated as failure)
            if (this.onload) {
              this.onload.call(this)
            }
          },
          get() {
            return this._src
          }
        })
        return img
      })
      setup()

      const container = screen.getByTestId('testPopupResult')
      // Thumbnail container should NOT render when image doesn't load properly
      const thumbnailContainer = container.querySelector(
        '.popupResultThumbnailContainer'
      )
      expect(thumbnailContainer).not.toBeInTheDocument()
    })
  })

  describe('empty state', () => {
    it('should render nothing when result is null', () => {
      setup(null)
      const container = screen.getByTestId('testPopupResult')
      expect(container.firstChild).toBeNull()
    })

    it('should render empty container when result is undefined', () => {
      setup(undefined)
      const container = screen.getByTestId('testPopupResult')
      expect(container).toBeInTheDocument()
    })
  })

  describe('styling', () => {
    it('should apply popupResultCartEnabled class when CART_ENABLED is true', () => {
      const configWithCart = {
        ...mockAppConfig,
        CART_ENABLED: true
      }
      store.dispatch(setAppConfig(configWithCart))
      setup()

      const container = screen.getByTestId('testPopupResult')
      expect(container).toHaveClass('popupResult', 'popupResultCartEnabled')
    })

    it('should apply only popupResult class when CART_ENABLED is false', () => {
      const configWithoutCart = {
        ...mockAppConfig,
        CART_ENABLED: false
      }
      store.dispatch(setAppConfig(configWithoutCart))
      setup()

      const container = screen.getByTestId('testPopupResult')
      expect(container).toHaveClass('popupResult')
      expect(container).not.toHaveClass('popupResultCartEnabled')
    })
  })
})
