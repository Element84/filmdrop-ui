import { vi } from 'vitest'
import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import Search from './Search'
import { Provider } from 'react-redux'
import { store } from '../../redux/store'
import { setAppConfig } from '../../redux/slices/mainSlice'
import { mockAppConfig } from '../../testing/shared-mocks'
import { newSearch, clearSearch } from '../../utils/searchHelper'
import * as useRenderableQueryablesModule from '../../hooks/useRenderableQueryables'

vi.mock('@tanstack/react-router', () => ({
  useNavigate: () => vi.fn(),
  useParams: () => ({}),
  createRootRoute: vi.fn(() => ({ addChildren: vi.fn(() => ({})) })),
  createRoute: vi.fn(() => ({ addChildren: vi.fn(() => ({})) })),
  createRouter: vi.fn(() => ({
    state: { location: { search: {} }, matches: [] }
  })),
  defaultStringifySearch: vi.fn()
}))

vi.mock('../../utils/mapHelper')
vi.mock('../../utils/searchHelper')

vi.mock('../../hooks/useUrlNavigate', () => ({
  useUrlNavigate: () => ({
    setTab: vi.fn(),
    setViz: vi.fn(),
    setItem: vi.fn(),
    clearItem: vi.fn()
  })
}))

describe('Search', () => {
  const setup = (configOverrides = {}) => {
    store.dispatch(
      setAppConfig({
        ...mockAppConfig,
        ...configOverrides
      })
    )
    return render(
      <Provider store={store}>
        <Search />
      </Provider>
    )
  }

  beforeEach(() => {
    vi.clearAllMocks()
    vi.spyOn(
      useRenderableQueryablesModule,
      'useRenderableQueryables'
    ).mockReturnValue({
      fields: [],
      hasFields: false,
      error: null
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('basic rendering', () => {
    it('should render the search button', () => {
      setup()
      expect(screen.getByRole('button', { name: 'Search' })).toBeInTheDocument()
    })

    it('should render the clear search button', () => {
      setup()
      expect(
        screen.getByRole('button', { name: /clear search/i })
      ).toBeInTheDocument()
    })

    it('should render Location & Date section heading', () => {
      setup()
      expect(screen.getByText('Location & Date')).toBeInTheDocument()
    })

    it('should render View & Search section heading', () => {
      setup()
      expect(screen.getByText('View & Search')).toBeInTheDocument()
    })
  })

  describe('search button interaction', () => {
    it('should call newSearch when search button is clicked', () => {
      setup()
      const searchButton = screen.getByRole('button', { name: 'Search' })
      fireEvent.click(searchButton)
      expect(newSearch).toHaveBeenCalledTimes(1)
    })

    it('should call clearSearch when clear button is clicked', () => {
      setup()
      const clearButton = screen.getByRole('button', { name: /clear search/i })
      fireEvent.click(clearButton)
      expect(clearSearch).toHaveBeenCalledTimes(1)
    })

    it('should not call newSearch when clear button is clicked', () => {
      setup()
      const clearButton = screen.getByRole('button', { name: /clear search/i })
      fireEvent.click(clearButton)
      expect(newSearch).not.toHaveBeenCalled()
    })
  })

  describe('conditional rendering', () => {
    describe('Filters section', () => {
      it('should not render Filters section when hasFields is false', () => {
        setup()
        expect(screen.queryByText('Filters')).not.toBeInTheDocument()
      })

      it('should render Filters section when hasFields is true', () => {
        vi.spyOn(
          useRenderableQueryablesModule,
          'useRenderableQueryables'
        ).mockReturnValue({
          fields: [
            ['cloudCover', { type: 'number', minimum: 0, maximum: 100 }]
          ],
          hasFields: true,
          error: null
        })
        setup()
        expect(screen.getByText('Filters')).toBeInTheDocument()
      })
    })

    describe('ViewSelector', () => {
      it('should always render ViewSelector regardless of tiler config', () => {
        setup({ MOSAIC_TILER_URL: '', SCENE_TILER_URL: '' })
        expect(screen.getByText('View Mode')).toBeInTheDocument()
      })
    })
  })
})
