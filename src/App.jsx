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
import { setAuthTokenExists, setCurrentTheme } from './redux/slices/mainSlice'
import { initializeTheme, applyTheme } from './utils/themeHelper'
import { showApplicationAlert } from './utils/alertHelper'
import L from 'leaflet'
import { clickedFootprintLayerStyle } from './utils/mapStyles'
import { clearLayer, zoomToItemExtent } from './utils/mapLayers'
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

  const _currentTheme = useSelector((state) => state.mainSlice.currentTheme)

  // Derived, not state — showLogin is a pure function of config and auth
  // token and does not need to live in Redux or local state.
  const showLogin = !!(_appConfig?.APP_TOKEN_AUTH_ENABLED && !_authTokenExists)

  const getConfigLoadMessage = (normalizedError) => {
    if (
      normalizedError?.code === 'LEGACY_CONFIG_NOT_SUPPORTED' ||
      normalizedError?.code === 'MIXED_CONFIG_NOT_SUPPORTED' ||
      normalizedError?.code === 'INVALID_CONFIG_FORMAT'
    ) {
      return normalizedError?.details || 'Error Fetching Config File'
    }
    return 'Error Fetching Config File'
  }

  // Effect 1 — one-time init: auth token, config load, version log.
  useEffect(() => {
    if (getAuthToken()) {
      dispatch(setAuthTokenExists(true))
    }
    Promise.resolve(LoadConfigIntoStateService()).then((result) => {
      if (result?.error === true) {
        showApplicationAlert('error', getConfigLoadMessage(result), null)
      }
    })
    const version = import.meta.env?.VITE_APP_VERSION
    if (version) {
      console.log('Version: ' + version)
    }
  }, [dispatch])

  // Effect 2 — config-reaction: runs once per config change. Handles
  // collections load + theme initialization.
  useEffect(() => {
    if (!_appConfig) return

    if (showLogin) return

    InitializeAppFromConfig(_appConfig, dispatch)

    // Only load collections if not already loaded (router may have loaded them).
    // Don't retry if there was a previous load error to prevent infinite loops.
    if (
      !_collectionsLoadError &&
      (!_collectionsData || _collectionsData.length === 0)
    ) {
      Promise.resolve(GetCollectionsService()).then((result) => {
        if (result?.error === true) {
          if (result.status === 403) {
            showApplicationAlert(
              'error',
              'STAC API returned 403. Bad Token OR needs STAC Auth Enabled in config.',
              null,
              true
            )
            return
          }
          showApplicationAlert('error', 'Error Fetching Collections')
          return
        }

        if (result?.collectionsCount === 0) {
          showApplicationAlert('error', 'Error: No Collections Found')
        }
      })
    }

    const { currentTheme, switchingEnabled } = initializeTheme(_appConfig)
    if (switchingEnabled) {
      dispatch(setCurrentTheme(currentTheme))
    }
    // applyTheme itself gates document branding writes via shouldApplyDocumentBranding.
    applyTheme(currentTheme)
  }, [_appConfig, showLogin, _collectionsData, _collectionsLoadError, dispatch])

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

  // Every `.App` div also carries `.filmdrop-root` + a mirrored
  // `data-theme` so the container-scoped theme selectors
  // (`.filmdrop-root[data-theme='filmdrop-*']`) resolve when FilmDrop
  // is mounted with `applyDocumentBranding={false}`.
  const themeAttr =
    _currentTheme === 'filmdrop'
      ? 'filmdrop'
      : _currentTheme
        ? `filmdrop-${_currentTheme}`
        : undefined
  const rootClassName = 'App filmdrop-root'

  return (
    <LayoutProvider>
      {_appConfig ? (
        showLogin ? (
          <div className={rootClassName} data-theme={themeAttr}>
            <Login></Login>
            {_showApplicationAlert ? <SystemMessage></SystemMessage> : null}
          </div>
        ) : (
          <div className={rootClassName} data-theme={themeAttr}>
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
        <div className={rootClassName} data-theme={themeAttr}>
          <div className="appLoading" data-testid="testAppLoading"></div>
          {_showApplicationAlert ? <SystemMessage></SystemMessage> : null}
        </div>
      )}
    </LayoutProvider>
  )
}

export default App
