import { vi } from 'vitest'
import React from 'react'
import { render, screen } from '@testing-library/react'
import Search from './Search'
import { Provider } from 'react-redux'
import { store } from '../../redux/store'

describe('Search', () => {
  const setup = () =>
    render(
      <Provider store={store}>
        <Search />
      </Provider>
    )

  beforeEach(() => {
    vi.mock('../../assets/config', async () => {
      const actualConfig = await vi.importActual('../../assets/config')
      return {
        ...actualConfig,
        VITE_ADVANCED_SEARCH_ENABLED: false
      }
    })
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  describe('on render', () => {
    it('should render auto search when VITE_ADVANCED_SEARCH_ENABLED is false', () => {
      setup()
      expect(screen.getByText(/auto search/i)).toBeInTheDocument()
    })
  })
})
