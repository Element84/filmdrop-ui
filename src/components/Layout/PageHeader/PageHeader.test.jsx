import React from 'react'
import { render, screen } from '@testing-library/react'
import PageHeader from './PageHeader'
import { Provider } from 'react-redux'
import { store } from '../../../redux/store'
import { setappConfig } from '../../../redux/slices/mainSlice'
import { mockAppConfig } from '../../../testing/shared-mocks'

describe('PageHeader', () => {
  const setup = () =>
    render(
      <Provider store={store}>
        <PageHeader />
      </Provider>
    )

  beforeEach(() => {
    store.dispatch(setappConfig(mockAppConfig))
  })
  describe('on app render', () => {
    it('should load the filmdrop logo into the document if SHOW_BRAND_LOGO set to true in config', () => {
      setup()
      expect(
        screen.queryByRole('img', {
          name: /filmdrop by element 84/i
        })
      ).toBeInTheDocument()
    })
    it('should load the filmdrop logo into the document if SHOW_BRAND_LOGO does not exists in config', () => {
      const SHOW_BRAND_LOGO = mockAppConfig.SHOW_BRAND_LOGO
      const mockAppConfigSearchEnabled = {
        SHOW_BRAND_LOGO,
        ...mockAppConfig
      }
      store.dispatch(setappConfig(mockAppConfigSearchEnabled))
      setup()
      expect(
        screen.queryByRole('img', {
          name: /filmdrop by element 84/i
        })
      ).toBeInTheDocument()
    })
    it('should not load the filmdrop logo into the document if SHOW_BRAND_LOGO set to false in config', () => {
      const mockAppConfigSearchEnabled = {
        ...mockAppConfig,
        SHOW_BRAND_LOGO: false
      }
      store.dispatch(setappConfig(mockAppConfigSearchEnabled))
      setup()
      expect(
        screen.queryByRole('img', {
          name: /filmdrop by element 84/i
        })
      ).not.toBeInTheDocument()
    })
  })
})
