import React from 'react'
import './App.css'
import './index.css'

import Content from './components/Layout/Content/Content'
import PageHeader from './components/Layout/PageHeader/PageHeader'
import PublishModal from './components/PublishModal/PublishModal'
import LaunchModal from './components/LaunchModal/LaunchModal'
import LaunchImageModal from './components/LaunchModal/LaunchImageModal'

// redux imports
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

  return (
    <div className="App">
      <PageHeader></PageHeader>
      <Content></Content>
      {_showPublishModal ? <PublishModal /> : null}
      {_showLaunchModal ? <LaunchModal /> : null}
      {_showLaunchImageModal ? <LaunchImageModal /> : null}
    </div>
  )
}

export default App
