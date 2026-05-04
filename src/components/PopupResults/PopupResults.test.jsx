import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import PopupResults from './PopupResults'
import { Provider } from 'react-redux'
import { store } from '../../redux/store'
import { LayoutProvider } from '../../contexts/LayoutContext'
import { AccordionStateProvider } from '../../contexts/AccordionStateContext'
import { setappConfig, setcartItems } from '../../redux/slices/mainSlice'
import { mockAppConfig, mockClickResults } from '../../testing/shared-mocks'
import { describe, vi } from 'vitest'

vi.mock('../../hooks/useUrlNavigate', () => ({
  useUrlNavigate: () => ({
    setTab: vi.fn(),
    setViz: vi.fn(),
    setItem: vi.fn(),
    clearItem: vi.fn()
  })
}))

describe('PopupResult', () => {
  const setup = () =>
    render(
      <Provider store={store}>
        <LayoutProvider>
          <AccordionStateProvider>
            <PopupResults results={mockClickResults} />
          </AccordionStateProvider>
        </LayoutProvider>
      </Provider>
    )

  beforeEach(() => {
    store.dispatch(setappConfig(mockAppConfig))
  })

  describe('on conditional render', () => {
    describe('cart buttons', () => {
      it('should render cart button in footer if cart enabled in config', () => {
        const mockAppConfigCartEnabled = {
          ...mockAppConfig,
          CART_ENABLED: 'true'
        }
        store.dispatch(setappConfig(mockAppConfigCartEnabled))
        setup()
        expect(
          screen.queryByRole('button', {
            name: /add to cart/i
          })
        ).toBeInTheDocument()
      })
      it('should not render cart button in footer if cart not enabled in config', () => {
        store.dispatch(setappConfig(mockAppConfig))
        setup()
        expect(
          screen.queryByRole('button', {
            name: /add to cart/i
          })
        ).not.toBeInTheDocument()
      })
      it('should show remove from cart button if scene already in cart', () => {
        const mockAppConfigCartEnabled = {
          ...mockAppConfig,
          CART_ENABLED: 'true'
        }
        store.dispatch(setappConfig(mockAppConfigCartEnabled))
        store.dispatch(setcartItems([mockClickResults[0]]))
        setup()
        expect(
          screen.queryByRole('button', {
            name: /remove from cart/i
          })
        ).toBeInTheDocument()
      })
    })
  })
  describe('on button clicks', () => {
    describe('on cart button clicked', () => {
      it('should add scene to cart if scene not in cart', () => {
        const mockAppConfigCartEnabled = {
          ...mockAppConfig,
          CART_ENABLED: 'true'
        }
        store.dispatch(setappConfig(mockAppConfigCartEnabled))
        setup()
        expect(store.getState().mainSlice.cartItems.length).toBe(0)
        fireEvent.click(screen.getByRole('button', { name: /add to cart/i }))
        expect(store.getState().mainSlice.cartItems.length).toBe(1)
      })
      it('should remove scene from cart if scene in cart', () => {
        const mockAppConfigCartEnabled = {
          ...mockAppConfig,
          CART_ENABLED: 'true'
        }
        store.dispatch(setappConfig(mockAppConfigCartEnabled))
        store.dispatch(setcartItems([mockClickResults[0]]))
        setup()
        expect(store.getState().mainSlice.cartItems.length).toBe(1)
        fireEvent.click(
          screen.getByRole('button', { name: /remove from cart/i })
        )
        expect(store.getState().mainSlice.cartItems.length).toBe(0)
      })
    })
    describe('on prev & next scene buttons clicked', () => {
      it('should set scene result in redux to next and prev scene if not out of range', () => {
        store.dispatch(setappConfig(mockAppConfig))
        setup()
        expect(store.getState().mainSlice.currentPopupResult).toEqual(
          mockClickResults[0]
        )
        fireEvent.click(screen.getByTestId('ChevronRightIcon'))
        expect(store.getState().mainSlice.currentPopupResult).toEqual(
          mockClickResults[1]
        )
        fireEvent.click(screen.getByTestId('ChevronRightIcon'))
        expect(store.getState().mainSlice.currentPopupResult).toEqual(
          mockClickResults[1]
        )
        fireEvent.click(screen.getByTestId('ChevronLeftIcon'))
        expect(store.getState().mainSlice.currentPopupResult).toEqual(
          mockClickResults[0]
        )
        fireEvent.click(screen.getByTestId('ChevronLeftIcon'))
        expect(store.getState().mainSlice.currentPopupResult).toEqual(
          mockClickResults[0]
        )
      })
    })
  })

  describe('effect consolidation', () => {
    it('rapid result changes dispatch setCurrentPopupResult once per change (no duplicates)', () => {
      store.dispatch(setappConfig(mockAppConfig))

      const dispatchSpy = vi.spyOn(store, 'dispatch')

      const { rerender } = render(
        <Provider store={store}>
          <LayoutProvider>
            <AccordionStateProvider>
              <PopupResults results={mockClickResults} />
            </AccordionStateProvider>
          </LayoutProvider>
        </Provider>
      )

      const countSetCurrent = () =>
        dispatchSpy.mock.calls.filter(
          ([action]) =>
            action &&
            typeof action === 'object' &&
            action.type === 'mainSlice/setCurrentPopupResult'
        ).length

      const initialCount = countSetCurrent()

      // Rerender with the same results several times in succession.
      rerender(
        <Provider store={store}>
          <LayoutProvider>
            <AccordionStateProvider>
              <PopupResults results={[...mockClickResults]} />
            </AccordionStateProvider>
          </LayoutProvider>
        </Provider>
      )
      rerender(
        <Provider store={store}>
          <LayoutProvider>
            <AccordionStateProvider>
              <PopupResults results={[...mockClickResults]} />
            </AccordionStateProvider>
          </LayoutProvider>
        </Provider>
      )

      // Contract: exactly one setCurrentPopupResult dispatch per
      // results-identity change. We perform two rerenders that each pass a
      // fresh array spread (`[...mockClickResults]`), so the effect's
      // `props.results` dep changes twice and dispatch fires twice — once
      // per identity change, never twice per change. Pre-consolidation,
      // two effects each dispatched setCurrentPopupResult, doubling the
      // count per render (would be 4 here).
      const finalCount = countSetCurrent()
      const dispatchedThisTest = finalCount - initialCount
      expect(dispatchedThisTest).toBe(2)

      dispatchSpy.mockRestore()
    })
  })
})
