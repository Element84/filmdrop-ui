import { React } from 'react'

import Content from './components/Layout/Content/Content'
import PageHeader from './components/Layout/PageHeader/PageHeader'
import PublishModal from './components/PublishModal/PublishModal'

import './App.css'
import './index.css'

// redux imports
import { useSelector } from 'react-redux'

function App () {
  const _showPublishModal = useSelector(
    (state) => state.mainSlice.showPublishModal
  )

  return (
    <div className="App">
      <PageHeader></PageHeader>
      <Content></Content>
      {_showPublishModal ? <PublishModal></PublishModal> : null}
    </div>
  )
}

export default App
