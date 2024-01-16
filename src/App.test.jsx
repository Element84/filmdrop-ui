import React from 'react'
import { render, screen } from '@testing-library/react'
import App from './App'
import { Provider } from 'react-redux'
import { store } from './redux/store'
import {
  setshowUploadGeojsonModal,
  setshowApplicationAlert,
  setappConfig,
  setshowCartModal
} from './redux/slices/mainSlice'
import { vi } from 'vitest'
import * as CollectionsService from './services/get-collections-service'
import * as LoadConfigService from './services/get-config-service'
import { mockAppConfig } from './testing/shared-mocks'
import * as ConfigHelper from './utils/configHelper'

describe('App', () => {
  const setup = () =>
    render(
      <Provider store={store}>
        <App />
      </Provider>
    )

  describe('on app render with config', () => {
    beforeEach(() => {
      store.dispatch(setappConfig(mockAppConfig))
    })
    afterEach(() => {
      vi.restoreAllMocks()
    })
    it('should call GetCollectionsService once', () => {
      const spy = vi.spyOn(CollectionsService, 'GetCollectionsService')
      setup()
      expect(spy).toHaveBeenCalledTimes(1)
    })
    it('should call InitializeAppFromConfig once', () => {
      const spy = vi.spyOn(ConfigHelper, 'InitializeAppFromConfig')
      setup()
      expect(spy).toHaveBeenCalledTimes(1)
    })
    it('should call LoadConfigIntoStateService once', () => {
      const spy = vi.spyOn(LoadConfigService, 'LoadConfigIntoStateService')
      setup()
      expect(spy).toHaveBeenCalledTimes(1)
    })
    it('should render the PageHeader component', () => {
      setup()
      const PageHeaderComponent = screen.queryByTestId('testPageHeader')
      expect(PageHeaderComponent).not.toBeNull()
    })
    it('should render the Content Component', () => {
      setup()
      const ContentComponent = screen.queryByTestId('testContent')
      expect(ContentComponent).not.toBeNull()
    })
    describe('when conditionally rendering UploadGeojsonModal', () => {
      it('should not render UploadGeojsonModal if showUploadGeojsonModal in state is false', () => {
        setup()
        const UploadGeojsonModalComponent = screen.queryByTestId(
          'testUploadGeojsonModal'
        )
        expect(UploadGeojsonModalComponent).toBeNull()
      })
      it('should render UploadGeojsonModal if showUploadGeojsonModal in state is true', () => {
        store.dispatch(setshowUploadGeojsonModal(true))
        setup()
        const UploadGeojsonModalComponent = screen.queryByTestId(
          'testUploadGeojsonModal'
        )
        expect(UploadGeojsonModalComponent).not.toBeNull()
      })
    })
    describe('when conditionally rendering SystemMessage', () => {
      it('should not render SystemMessage if showApplicationAlert in state is false', () => {
        setup()
        const SystemMessageComponent = screen.queryByTestId('testSystemMessage')
        expect(SystemMessageComponent).toBeNull()
      })
      it('should render SystemMessage if showApplicationAlert in state is true', () => {
        store.dispatch(setshowApplicationAlert(true))
        setup()
        const SystemMessageComponent = screen.queryByTestId('testSystemMessage')
        expect(SystemMessageComponent).not.toBeNull()
      })
    })
    describe('when conditionally rendering Cart Modal', () => {
      it('should not render CartModal if showCartModal in state is false', () => {
        setup()
        const CartModalComponent = screen.queryByTestId('testCartModal')
        expect(CartModalComponent).toBeNull()
      })
      it('should render CartModal if showCartModal in state is true', () => {
        store.dispatch(setshowCartModal(true))
        setup()
        const CartModalComponent = screen.queryByTestId('testCartModal')
        expect(CartModalComponent).not.toBeNull()
      })
    })
  })
  describe('on app render without config', () => {
    afterEach(() => {
      vi.restoreAllMocks()
    })
    it('should showAppLoading page', () => {
      setup()
      const PageHeaderComponent = screen.queryByTestId('testAppLoading')
      expect(PageHeaderComponent).not.toBeNull()
    })
    it('should call LoadConfigIntoStateService once', () => {
      const spy = vi.spyOn(LoadConfigService, 'LoadConfigIntoStateService')
      setup()
      expect(spy).toHaveBeenCalledTimes(1)
    })
    it('should call not GetCollectionsService', () => {
      const spy = vi.spyOn(CollectionsService, 'GetCollectionsService')
      setup()
      expect(spy).not.toHaveBeenCalled()
    })
    it('should call not InitializeAppFromConfig', () => {
      const spy = vi.spyOn(ConfigHelper, 'InitializeAppFromConfig')
      setup()
      expect(spy).not.toHaveBeenCalled()
    })
  })
})
