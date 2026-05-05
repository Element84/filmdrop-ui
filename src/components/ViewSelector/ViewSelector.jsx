import React, { useState, useEffect, useMemo, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  setViewMode,
  setAutoCenterOnItemChanged
} from '../../redux/slices/mainSlice'
import { Checkbox as MuiCheckbox } from '@mui/material'
import './ViewSelector.css'
import ButtonGroup from '../ButtonGroup/ButtonGroup'
import { getCurrentMapZoomLevel } from '../../utils/mapLayers'
import { getCollectionConfig } from '../../utils/configHelper'
import { DEFAULT_SCENE_MIN_ZOOM } from '../../constants/defaults'
import { getActiveRouterOrNull } from '../../router-test-hooks'

const ViewSelector = () => {
  const dispatch = useDispatch()
  const viewMode = useSelector((state) => state.mainSlice.viewMode)
  const selectedCollectionData = useSelector(
    (state) => state.mainSlice.selectedCollectionData
  )
  const map = useSelector((state) => state.mainSlice.map)
  const appConfig = useSelector((state) => state.mainSlice.appConfig)
  const autoCenterOnItemChanged = useSelector(
    (state) => state.mainSlice.autoCenterOnItemChanged
  )

  // Read the initial `view` search param from the active router once at
  // mount. urlHasView controls a one-time "skip default-view reset on
  // initial load" behavior below.
  const [initialUrlView] = useState(
    () => !!getActiveRouterOrNull()?.state?.location?.search?.view
  )

  const [currentZoom, setCurrentZoom] = useState(0)
  // Track whether user has manually selected a view mode.
  // Once true, auto-switching based on zoom level is disabled until
  // the collection changes. This preserves the user's explicit choice
  // while still resetting on collection change.
  // URL-provided view is treated as a manual selection, so auto-zoom
  // doesn't override it on page load.
  const urlHasView = useRef(initialUrlView)
  const [isManualSelection, setIsManualSelection] = useState(
    () => initialUrlView
  )

  // Check if collection supports hex and grid aggregations
  const supportsHex = useMemo(
    () =>
      selectedCollectionData?.aggregations?.some(
        (el) =>
          el.name === 'centroid_geohex_grid_frequency' ||
          el.name === 'grid_geohex_frequency'
      ) || false,
    [selectedCollectionData]
  )

  const supportsGrid = useMemo(
    () =>
      selectedCollectionData?.aggregations?.some(
        (el) => el.name === 'grid_code_frequency'
      ) || false,
    [selectedCollectionData]
  )

  // Get minimum zoom level for scene/mosaic views
  const sceneMinZoom = useMemo(() => {
    return selectedCollectionData
      ? getCollectionConfig(selectedCollectionData.id, 'sceneMinZoom') ||
          DEFAULT_SCENE_MIN_ZOOM
      : DEFAULT_SCENE_MIN_ZOOM
  }, [selectedCollectionData])

  const canUseScene = currentZoom >= sceneMinZoom

  // Reset to default view when collection changes
  useEffect(() => {
    if (!selectedCollectionData?.id) return

    // On initial load from a shared URL with an explicit view param,
    // skip the default-view reset so the URL's view mode is preserved.
    if (urlHasView.current) {
      urlHasView.current = false
      return
    }

    // Default to hex if available, otherwise grid, otherwise scene
    const defaultView = supportsHex
      ? 'hex'
      : supportsGrid
        ? 'grid-code'
        : 'scene'
    dispatch(setViewMode(defaultView))
    setIsManualSelection(false)
  }, [selectedCollectionData?.id, dispatch, supportsHex, supportsGrid])

  // Update current zoom when map changes
  useEffect(() => {
    if (!map?.on) return

    const updateZoom = () => {
      setCurrentZoom(getCurrentMapZoomLevel())
    }

    map.on('zoomend', updateZoom)
    updateZoom() // Initial update

    return () => {
      map.off('zoomend', updateZoom)
    }
  }, [map])

  // Auto-switch view based on zoom level (only when not manually selected)
  useEffect(() => {
    if (isManualSelection) return
    if (viewMode === 'mosaic') return // Don't auto-switch in mosaic mode

    if (canUseScene && appConfig?.SCENE_TILER_URL) {
      // High zoom: switch to scene if not already there
      if (viewMode !== 'scene') {
        dispatch(setViewMode('scene'))
      }
    } else {
      // Low zoom: prefer hex if available, otherwise stay on current view
      if (supportsHex && viewMode !== 'hex') {
        dispatch(setViewMode('hex'))
      }
    }
  }, [
    canUseScene,
    appConfig?.SCENE_TILER_URL,
    supportsHex,
    viewMode,
    isManualSelection,
    dispatch
  ])

  const handleViewChange = (view) => {
    dispatch(setViewMode(view))
    setIsManualSelection(true)
  }

  const handleAutoZoomChange = (e) => {
    dispatch(setAutoCenterOnItemChanged(e.target.checked))
  }

  // Build buttons array for ButtonGroup
  const buttons = [
    {
      value: 'hex',
      label: 'Hex',
      onClick: () => handleViewChange('hex'),
      active: viewMode === 'hex',
      disabled: !supportsHex
    },
    {
      value: 'grid-code',
      label: 'Grid',
      onClick: () => handleViewChange('grid-code'),
      active: viewMode === 'grid-code',
      disabled: !supportsGrid
    },
    {
      value: 'scene',
      label: 'Scene',
      onClick: () => handleViewChange('scene'),
      active: viewMode === 'scene',
      disabled: !canUseScene || !appConfig?.SCENE_TILER_URL
    },
    {
      value: 'mosaic',
      label: 'Mosaic',
      onClick: () => handleViewChange('mosaic'),
      active: viewMode === 'mosaic',
      disabled: !canUseScene || !appConfig?.MOSAIC_TILER_URL
    }
  ]

  return (
    <ButtonGroup label="View Mode" buttons={buttons}>
      {appConfig?.SHOW_ITEM_AUTO_ZOOM && (
        <label
          className="ViewSelector__checkbox"
          htmlFor="viewSelectorAutoZoom"
        >
          <MuiCheckbox
            id="viewSelectorAutoZoom"
            checked={autoCenterOnItemChanged}
            onChange={handleAutoZoomChange}
            size="small"
          />
          <span>Item Auto-Zoom</span>
        </label>
      )}
    </ButtonGroup>
  )
}

export default ViewSelector
