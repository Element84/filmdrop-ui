import React, { useEffect } from 'react'
import './App.css'
import './index.css'
import Content from './components/Layout/Content/Content'
import PageHeader from './components/Layout/PageHeader/PageHeader'
import UploadGeojsonModal from './components/UploadGeojsonModal/UploadGeojsonModal'
import SystemMessage from './components/SystemMessage/SystemMessage'
import { GetCollectionsService } from './services/get-collections-service'
import { LoadConfigIntoStateService } from './services/get-config-service'
import { useSelector } from 'react-redux'
import CartModal from './components/Cart/CartModal/CartModal'
import { InitializeAppFromConfig } from './utils/configHelper'

function App() {
  const _showUploadGeojsonModal = useSelector(
    (state) => state.mainSlice.showUploadGeojsonModal
  )
  const _showApplicationAlert = useSelector(
    (state) => state.mainSlice.showApplicationAlert
  )
  const _appConfig = useSelector((state) => state.mainSlice.appConfig)
  const _showCartModal = useSelector((state) => state.mainSlice.showCartModal)

  useEffect(() => {
    LoadConfigIntoStateService()
    try {
      console.log('Version: ' + process.env.REACT_APP_VERSION)
    } catch (err) {
      console.error('Error logging version:', err)
    }
  }, [])

  useEffect(() => {
    if (_appConfig) {
      InitializeAppFromConfig()
      GetCollectionsService()
    }
  }, [_appConfig])

  return (
    <React.StrictMode>
      {_appConfig ? (
        <div className="App">
          <PageHeader></PageHeader>
          <Content></Content>
          {_showUploadGeojsonModal ? (
            <UploadGeojsonModal></UploadGeojsonModal>
          ) : null}
          {_showApplicationAlert ? <SystemMessage></SystemMessage> : null}
          {_showCartModal ? <CartModal></CartModal> : null}
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
