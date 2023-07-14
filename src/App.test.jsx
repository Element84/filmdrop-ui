import React from 'react'
import { render, screen } from '@testing-library/react'
import App from './App'
import { Provider } from 'react-redux'
import { store } from './redux/store'
import {
  setShowPublishModal,
  setShowLaunchModal,
  setShowLaunchImageModal,
  setshowUploadGeojsonModal,
  setshowApplicationAlert,
  setappConfig
} from './redux/slices/mainSlice'
import { vi } from 'vitest'
import * as CollectionsService from './services/get-collections-service'
import { mockAppConfig } from './testing/shared-mocks'

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
    describe('when conditionally rendering PublishModal', () => {
      it('should not render PublishModal if showPublishModal in state is false', () => {
        setup()
        const PublishModalComponent = screen.queryByTestId('testPublishModal')
        expect(PublishModalComponent).toBeNull()
      })
      it('should render PublishModal if showPublishModal in state is true', () => {
        store.dispatch(setShowPublishModal(true))
        setup()
        const PublishModalComponent = screen.queryByTestId('testPublishModal')
        expect(PublishModalComponent).not.toBeNull()
      })
    })
    describe('when conditionally rendering LaunchModal', () => {
      it('should not render LaunchModal if showLaunchModal in state is false', () => {
        setup()
        const LaunchModalComponent = screen.queryByTestId('testLaunchModal')
        expect(LaunchModalComponent).toBeNull()
      })
      it('should render LaunchModal if showLaunchModal in state is true', () => {
        store.dispatch(setShowLaunchModal(true))
        setup()
        const LaunchModalComponent = screen.queryByTestId('testLaunchModal')
        expect(LaunchModalComponent).not.toBeNull()
      })
    })
    describe('when conditionally rendering LaunchImageModal', () => {
      it('should not render LaunchImageModal if showLaunchImageModal in state is false', () => {
        setup()
        const LaunchImageModalComponent = screen.queryByTestId(
          'testLaunchImageModal'
        )
        expect(LaunchImageModalComponent).toBeNull()
      })
      it('should render LaunchImageModal if showLaunchImageModal in state is true', () => {
        store.dispatch(setShowLaunchImageModal(true))
        setup()
        const LaunchImageModalComponent = screen.queryByTestId(
          'testLaunchImageModal'
        )
        expect(LaunchImageModalComponent).not.toBeNull()
      })
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
  })
})
