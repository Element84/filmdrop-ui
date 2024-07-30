import React, { useEffect } from 'react'
import './App.css'
import './index.css'
import Content from './components/Layout/Content/Content'
import PageHeader from './components/Layout/PageHeader/PageHeader'
import UploadGeojsonModal from './components/UploadGeojsonModal/UploadGeojsonModal'
import SystemMessage from './components/SystemMessage/SystemMessage'
import { GetCollectionsService } from './services/get-collections-service'
import { LoadConfigIntoStateService } from './services/get-config-service'
import { useDispatch, useSelector } from 'react-redux'
import CartModal from './components/Cart/CartModal/CartModal'
import { InitializeAppFromConfig } from './utils/configHelper'
import Login from './components/Login/Login'
import { setauthTokenExists } from './redux/slices/mainSlice'

function App() {
  const dispatch = useDispatch()
  const _showUploadGeojsonModal = useSelector(
    (state) => state.mainSlice.showUploadGeojsonModal
  )
  const _showApplicationAlert = useSelector(
    (state) => state.mainSlice.showApplicationAlert
  )
  const _appConfig = useSelector((state) => state.mainSlice.appConfig)
  const _showCartModal = useSelector((state) => state.mainSlice.showCartModal)
  const _authTokenExists = useSelector(
    (state) => state.mainSlice.authTokenExists
  )

  useEffect(() => {
    if (localStorage.getItem('APP_AUTH_TOKEN')) {
      dispatch(setauthTokenExists(true))
    }
    LoadConfigIntoStateService()
    try {
      console.log('Version: ' + process.env.REACT_APP_VERSION)
    } catch (err) {
      console.error('Error logging version:', err)
    }
  }, [])

  useEffect(() => {
    if (_appConfig) {
      if (_appConfig.APP_TOKEN_AUTH_ENABLED && !_authTokenExists) {
        return
      }
      InitializeAppFromConfig()
      GetCollectionsService()
    }
  }, [_appConfig, _authTokenExists])

  return (
    <React.StrictMode>
      {_appConfig ? (
        _appConfig.APP_TOKEN_AUTH_ENABLED && !_authTokenExists ? (
          <div className="App">
            <Login></Login>
          </div>
        ) : (
          <div className="App">
            <PageHeader></PageHeader>
            <Content></Content>
            {_showUploadGeojsonModal ? (
              <UploadGeojsonModal></UploadGeojsonModal>
            ) : null}
            {_showApplicationAlert ? <SystemMessage></SystemMessage> : null}
            {_showCartModal ? <CartModal></CartModal> : null}
          </div>
        )
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
