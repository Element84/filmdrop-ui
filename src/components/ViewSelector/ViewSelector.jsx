import { React, useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { setViewMode } from '../../redux/slices/mainSlice'
import './ViewSelector.css'
import { Stack, Tooltip } from '@mui/material'
import Grid from '@mui/material/Grid'
import Button from '@mui/material/Button'
import ButtonGroup from '@mui/material/ButtonGroup'
import { getCurrentMapZoomLevel } from '../../utils/mapHelper'
import { getCollectionConfig } from '../../utils/configHelper'

const DEFAULT_SCENE_MIN_ZOOM = 7

const ViewSelector = () => {
  const _viewMode = useSelector((state) => state.mainSlice.viewMode)
  const _selectedCollectionData = useSelector(
    (state) => state.mainSlice.selectedCollectionData
  )
  const _map = useSelector((state) => state.mainSlice.map)

  const dispatch = useDispatch()
  const [selectedView, setSelectedView] = useState(_viewMode)
  const [currentZoom, setCurrentZoom] = useState(0)
  const [prevCollectionId, setPrevCollectionId] = useState(null)
  const [isManualSelection, setIsManualSelection] = useState(false)

  // Check if collection supports hex and grid aggregations
  const supportsHex = _selectedCollectionData?.aggregations?.some(
    (el) => el.name === 'grid_geohex_frequency'
  )
  const supportsGrid = _selectedCollectionData?.aggregations?.some(
    (el) => el.name === 'grid_code_frequency'
  )

  // Get minimum zoom level for scene/mosaic views
  const sceneMinZoom = _selectedCollectionData
    ? getCollectionConfig(_selectedCollectionData.id, 'sceneMinZoom') ||
      DEFAULT_SCENE_MIN_ZOOM
    : DEFAULT_SCENE_MIN_ZOOM

  // Reset to default view when collection changes
  useEffect(() => {
    if (
      _selectedCollectionData &&
      _selectedCollectionData.id !== prevCollectionId
    ) {
      setPrevCollectionId(_selectedCollectionData.id)
      // Default to hex if available, otherwise grid, otherwise scene
      const defaultView = supportsHex
        ? 'hex'
        : supportsGrid
          ? 'grid-code'
          : 'scene'
      setSelectedView(defaultView)
      setIsManualSelection(false) // Reset manual selection flag on collection change
    }
  }, [_selectedCollectionData, supportsHex, supportsGrid])

  // Update current zoom when map changes
  useEffect(() => {
    if (_map && _map.on) {
      const updateZoom = () => {
        setCurrentZoom(getCurrentMapZoomLevel())
      }
      _map.on('zoomend', updateZoom)
      updateZoom() // Initial update

      return () => {
        _map.off('zoomend', updateZoom)
      }
    }
  }, [_map])

  // Auto-switch view based on zoom level (only when not manually selected)
  // Switches between hex (if available) and scene based on zoom
  useEffect(() => {
    if (isManualSelection) return // Don't auto-switch if user manually selected a view
    if (selectedView === 'mosaic') return // Don't auto-switch in mosaic mode

    const canUseScene = currentZoom >= sceneMinZoom

    // Auto-switch based on zoom
    if (canUseScene) {
      // High zoom: switch to scene if not already there
      if (selectedView !== 'scene') {
        setSelectedView('scene')
      }
    } else {
      // Low zoom: prefer hex if available, otherwise scene (will show zoom notice)
      if (supportsHex && selectedView !== 'hex') {
        setSelectedView('hex')
      }
    }
  }, [currentZoom, sceneMinZoom, supportsHex, selectedView, isManualSelection])

  // Update Redux state when view changes
  useEffect(() => {
    dispatch(setViewMode(selectedView))
  }, [selectedView, dispatch])

  // Scene and Mosaic views require minimum zoom level
  const canUseScene = currentZoom >= sceneMinZoom

  const handleViewChange = (view) => {
    setSelectedView(view)
    setIsManualSelection(true) // Mark as manual selection
  }

  return (
    <Stack sx={{ width: 165 }} className="viewSelector">
      <label htmlFor="ViewModeToggle">View Mode</label>
      <Grid container spacing={2} alignItems="center">
        <Grid size="grow">
          <ButtonGroup
            variant="contained"
            aria-label="view mode button group"
            fullWidth
            size="small"
          >
            <Tooltip
              title={
                !supportsHex
                  ? 'Hex aggregation not available for this collection'
                  : ''
              }
              arrow
              disableInteractive
            >
              <span>
                <Button
                  color={selectedView === 'hex' ? 'primary' : 'secondary'}
                  onClick={() => handleViewChange('hex')}
                  disabled={!supportsHex}
                >
                  Hex
                </Button>
              </span>
            </Tooltip>

            <Tooltip
              title={
                !supportsGrid
                  ? 'Grid aggregation not available for this collection'
                  : ''
              }
              arrow
              disableInteractive
            >
              <span>
                <Button
                  color={selectedView === 'grid-code' ? 'primary' : 'secondary'}
                  onClick={() => handleViewChange('grid-code')}
                  disabled={!supportsGrid}
                >
                  Grid
                </Button>
              </span>
            </Tooltip>

            <Tooltip
              title={!canUseScene ? `Zoom in for scene view` : ''}
              arrow
              disableInteractive
            >
              <span>
                <Button
                  color={selectedView === 'scene' ? 'primary' : 'secondary'}
                  onClick={() => handleViewChange('scene')}
                  disabled={!canUseScene}
                >
                  Scene
                </Button>
              </span>
            </Tooltip>

            <Tooltip
              title={
                !canUseScene
                  ? `Zoom to level ${sceneMinZoom} or higher for mosaic view`
                  : ''
              }
              arrow
              disableInteractive
            >
              <span>
                <Button
                  color={selectedView === 'mosaic' ? 'primary' : 'secondary'}
                  onClick={() => handleViewChange('mosaic')}
                  disabled={!canUseScene}
                >
                  Mosaic
                </Button>
              </span>
            </Tooltip>
          </ButtonGroup>
        </Grid>
      </Grid>
    </Stack>
  )
}

export default ViewSelector
