import React, { useEffect } from 'react'
import './App.css'
import './index.css'

import Content from './components/Layout/Content/Content'
import PageHeader from './components/Layout/PageHeader/PageHeader'
import PublishModal from './components/PublishModal/PublishModal'
import LaunchModal from './components/LaunchModal/LaunchModal'
import LaunchImageModal from './components/LaunchModal/LaunchImageModal'
import UploadGeojsonModal from './components/UploadGeojsonModal/UploadGeojsonModal'

import { GetCollectionsService } from './services/get-collections-service'
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
  useEffect(() => {
    GetCollectionsService()
  }, [])

  return (
    <React.StrictMode>
      <div className="App">
        <PageHeader></PageHeader>
        <Content></Content>
        {_showPublishModal ? <PublishModal /> : null}
        {_showLaunchModal ? <LaunchModal /> : null}
        {_showLaunchImageModal ? <LaunchImageModal /> : null}
        {_showUploadGeojsonModal ? (
          <UploadGeojsonModal></UploadGeojsonModal>
        ) : null}
      </div>
    </React.StrictMode>
  )
}

export default App
