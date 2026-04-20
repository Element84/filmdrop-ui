import React, { useEffect } from 'react'
import './App.css'
import './themes/theme.css'
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
import { setauthTokenExists, setCurrentTheme } from './redux/slices/mainSlice'
import { initializeTheme, applyTheme } from './utils/themeHelper'
import L from 'leaflet'
import {
  clickedFootprintLayerStyle,
  clearLayer,
  zoomToItemExtent
} from './utils/mapHelper'
import { LayoutProvider } from './contexts/LayoutContext'
import { useUrlStateSync } from './hooks/useUrlStateSync'
import { Outlet } from '@tanstack/react-router'
import { getAuthToken } from './utils/authHelper'

function App() {
  useUrlStateSync()
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
  const _currentPopupResult = useSelector(
    (state) => state.mainSlice.currentPopupResult
  )
  const _map = useSelector((state) => state.mainSlice.map)
  const _autoCenterOnItemChanged = useSelector(
    (state) => state.mainSlice.autoCenterOnItemChanged
  )
  const _collectionsData = useSelector(
    (state) => state.mainSlice.collectionsData
  )
  const _collectionsLoadError = useSelector(
    (state) => state.mainSlice.collectionsLoadError
  )

  // Derived, not state — showLogin is a pure function of config and auth
  // token and does not need to live in Redux or local state.
  const showLogin = !!(_appConfig?.APP_TOKEN_AUTH_ENABLED && !_authTokenExists)

  // Effect 1 — one-time init: auth token, config load, version log.
  useEffect(() => {
    if (getAuthToken()) {
      dispatch(setauthTokenExists(true))
    }
    LoadConfigIntoStateService()
    try {
      // process.env.REACT_APP_VERSION — defined in SPA build; may be absent
      // in library mode. Swallow in try/catch.
      console.log('Version: ' + process.env.REACT_APP_VERSION)
    } catch (err) {
      console.error('Error logging version:', err)
    }
  }, [])

  // Effect 2 — config-reaction: runs once per config change. Handles
  // collections load + theme initialization. Only applies branding/theme if
  // FilmDropRoot has not opted out via applyDocumentBranding=false.
  useEffect(() => {
    if (!_appConfig) return

    if (showLogin) return

    InitializeAppFromConfig()

    // Only load collections if not already loaded (router may have loaded them).
    // Don't retry if there was a previous load error to prevent infinite loops.
    if (
      !_collectionsLoadError &&
      (!_collectionsData || _collectionsData.length === 0)
    ) {
      GetCollectionsService()
    }

    const shouldApplyBranding =
      typeof window === 'undefined' || window.__filmdropApplyBranding !== false

    if (shouldApplyBranding) {
      const { currentTheme, switchingEnabled } = initializeTheme(_appConfig)
      if (switchingEnabled) {
        dispatch(setCurrentTheme(currentTheme))
      }
      applyTheme(currentTheme)
    }
  }, [_appConfig, _authTokenExists, _collectionsData, _collectionsLoadError])

  // Effect 3 — item display side-effects (genuine DOM/leaflet side effect).
  useEffect(() => {
    if (_currentPopupResult && _map && Object.keys(_map).length > 0) {
      clearLayer('clickedSceneHighlightLayer')

      const clickedFootprintsFound = L.geoJSON(_currentPopupResult, {
        style: clickedFootprintLayerStyle
      })
      _map.eachLayer(function (layer) {
        if (layer.layer_name === 'clickedSceneHighlightLayer') {
          clickedFootprintsFound.addTo(layer)
        }
      })

      // Auto-zoom to item extent if enabled and checkbox is checked
      if (_appConfig?.SHOW_ITEM_AUTO_ZOOM && _autoCenterOnItemChanged) {
        zoomToItemExtent(_currentPopupResult)
      }
    }
  }, [_currentPopupResult, _map, _appConfig, _autoCenterOnItemChanged])

  return (
    <LayoutProvider>
      {_appConfig ? (
        showLogin ? (
          <div className="App">
            <Login></Login>
            {_showApplicationAlert ? <SystemMessage></SystemMessage> : null}
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
            <Outlet />
          </div>
        )
      ) : (
        <div className="App">
          <div className="appLoading" data-testid="testAppLoading"></div>
          {_showApplicationAlert ? <SystemMessage></SystemMessage> : null}
        </div>
      )}
    </LayoutProvider>
  )
}

export default App
