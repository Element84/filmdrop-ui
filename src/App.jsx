import React, { useEffect } from 'react'
import './App.css'
import './index.css'

import Content from './components/Layout/Content/Content'
import PageHeader from './components/Layout/PageHeader/PageHeader'
import PublishModal from './components/PublishModal/PublishModal'
import LaunchModal from './components/LaunchModal/LaunchModal'
import LaunchImageModal from './components/LaunchModal/LaunchImageModal'
import UploadGeojsonModal from './components/UploadGeojsonModal/UploadGeojsonModal'
import SystemMessage from './components/SystemMessage/SystemMessage'

import { GetCollectionsService } from './services/get-collections-service'
import { LoadConfigIntoStateService } from './services/get-config-service'
import { useSelector } from 'react-redux'

function App() {
  const _showPublishModal = useSelector(
    (state) => state.mainSlice.showPublishModal
  )
  const _showLaunchModal = useSelector(
    (state) => state.mainSlice.showLaunchModal
  )
  const _showLaunchImageModal = useSelector(
    (state) => state.mainSlice.showLaunchImageModal
  )
  const _showUploadGeojsonModal = useSelector(
    (state) => state.mainSlice.showUploadGeojsonModal
  )
  const _showApplicationAlert = useSelector(
    (state) => state.mainSlice.showApplicationAlert
  )
  const _appConfig = useSelector((state) => state.mainSlice.appConfig)

  useEffect(() => {
    LoadConfigIntoStateService()
  }, [])

  useEffect(() => {
    if (_appConfig) {
      GetCollectionsService()
    }
  }, [_appConfig])

  return (
    <React.StrictMode>
      {_appConfig ? (
        <div className="App">
          <PageHeader></PageHeader>
          <Content></Content>
          {_showPublishModal ? <PublishModal /> : null}
          {_showLaunchModal ? <LaunchModal /> : null}
          {_showLaunchImageModal ? <LaunchImageModal /> : null}
          {_showUploadGeojsonModal ? (
            <UploadGeojsonModal></UploadGeojsonModal>
          ) : null}
          {_showApplicationAlert ? <SystemMessage></SystemMessage> : null}
        </div>
      ) : (
        <div className="App">
          <div className="appLoading" data-testid="testAppLoading"></div>
          {_showApplicationAlert ? <SystemMessage></SystemMessage> : null}
        </div>
      )}
    </React.StrictMode>
  )
}

export default App
