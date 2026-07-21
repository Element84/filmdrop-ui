import React from 'react'
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Provider } from 'react-redux'
import { createFilmDropStore } from '../../redux/store'
import {
  setSearchLoading,
  setCurrentPage,
  setTotalPages,
  setPaginationNextLink,
  setPaginationPrevLink,
  setSearchResults,
  setPaginationHistory
} from '../../redux/slices/mainSlice'
import Pagination from './Pagination.jsx'

const { fetchPageServiceMock } = vi.hoisted(() => ({
  fetchPageServiceMock: vi.fn()
}))

vi.mock('../../services/get-pagination-service', () => ({
  FetchPageService: fetchPageServiceMock
}))

function renderSubject(setupState = () => {}) {
  const store = createFilmDropStore()
  setupState(store)

  const view = render(
    <Provider store={store}>
      <Pagination />
    </Provider>
  )

  return { ...view, store }
}

describe('Pagination', () => {
  beforeEach(() => {
    fetchPageServiceMock.mockReset()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('renders nothing when there are no search results', () => {
    const { container } = renderSubject()

    expect(container.firstChild).toBeNull()
  })

  it('renders nothing for aggregated results', () => {
    const { container } = renderSubject((store) => {
      store.dispatch(setSearchResults({ searchType: 'AggregatedResults' }))
    })

    expect(container.firstChild).toBeNull()
  })

  it('fetches the next page when next is clicked', () => {
    renderSubject((store) => {
      store.dispatch(setSearchResults({ searchType: 'SearchResults' }))
      store.dispatch(setCurrentPage(2))
      store.dispatch(setTotalPages(4))
      store.dispatch(setPaginationNextLink('https://example.com/page/3'))
      store.dispatch(setPaginationPrevLink('https://example.com/page/1'))
      store.dispatch(setSearchLoading(false))
    })

    fireEvent.click(screen.getByRole('button', { name: 'Next' }))

    expect(fetchPageServiceMock).toHaveBeenCalledWith(
      'https://example.com/page/3',
      3
    )
  })

  it('falls back to pagination history for the previous page when needed', () => {
    renderSubject((store) => {
      store.dispatch(setSearchResults({ searchType: 'SearchResults' }))
      store.dispatch(setCurrentPage(3))
      store.dispatch(setTotalPages(4))
      store.dispatch(setPaginationNextLink('https://example.com/page/4'))
      store.dispatch(setPaginationPrevLink(null))
      store.dispatch(
        setPaginationHistory([
          { page: 1, url: 'https://example.com/page/1' },
          { page: 2, url: 'https://example.com/page/2' }
        ])
      )
      store.dispatch(setSearchLoading(false))
    })

    fireEvent.click(screen.getByRole('button', { name: 'Previous' }))

    expect(fetchPageServiceMock).toHaveBeenCalledWith(
      'https://example.com/page/2',
      2
    )
  })

  it('disables pagination while loading', () => {
    renderSubject((store) => {
      store.dispatch(setSearchResults({ searchType: 'SearchResults' }))
      store.dispatch(setCurrentPage(2))
      store.dispatch(setTotalPages(4))
      store.dispatch(setPaginationNextLink('https://example.com/page/3'))
      store.dispatch(setPaginationPrevLink('https://example.com/page/1'))
      store.dispatch(setSearchLoading(true))
    })

    expect(screen.getByRole('button', { name: 'Previous' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Next' })).toBeDisabled()
  })
})
