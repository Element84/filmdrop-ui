import React, { useEffect, useMemo } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import {
  Select,
  MenuItem,
  OutlinedInput,
  Checkbox as MuiCheckbox
} from '@mui/material'
import { getCollectionVisualizations } from '../../utils/configHelper'
import { useUrlNavigate } from '../../hooks/useUrlNavigate'
import { setShowSceneOverlay } from '../../redux/slices/mainSlice'
import {
  clearLayer,
  debounceTitilerOverlay,
  CLICKED_SCENE_IMAGE_LAYER
} from '../../utils/mapLayers'
import './VisualizationDropdown.css'

const VisualizationDropdown = () => {
  const dispatch = useDispatch()
  const { setViz } = useUrlNavigate()
  const selectedCollection = useSelector(
    (state) => state.mainSlice.selectedCollection
  )
  const selectedVisualization = useSelector(
    (state) => state.mainSlice.selectedVisualization
  )
  const showSceneOverlay = useSelector(
    (state) => state.mainSlice.showSceneOverlay
  )
  const currentPopupResult = useSelector(
    (state) => state.mainSlice.currentPopupResult
  )

  const { visualizations, visualizationKeys, hasVisualizations } =
    useMemo(() => {
      return selectedCollection
        ? getCollectionVisualizations(selectedCollection)
        : {
            visualizations: null,
            visualizationKeys: [],
            hasVisualizations: false
          }
    }, [selectedCollection])

  // Build dropdown options from visualizations
  const options = useMemo(() => {
    return visualizationKeys.map((key) => ({
      value: key,
      label: visualizations[key]?.title || key
    }))
  }, [visualizations, visualizationKeys])

  // Auto-select first visualization when collection changes and has visualizations
  useEffect(() => {
    if (hasVisualizations && !selectedVisualization) {
      setViz(visualizationKeys[0])
    }
  }, [
    hasVisualizations,
    selectedCollection,
    selectedVisualization,
    setViz,
    visualizationKeys
  ])

  const handleVisualizationChange = (e) => {
    setViz(e.target.value)
  }

  const handleShowOnMapChange = (e) => {
    const checked = e.target.checked
    dispatch(setShowSceneOverlay(checked))
    if (checked) {
      if (currentPopupResult) {
        debounceTitilerOverlay(currentPopupResult)
      }
    } else {
      clearLayer(CLICKED_SCENE_IMAGE_LAYER)
    }
  }

  if (!hasVisualizations) return null

  return (
    <div className="VisualizationDropdown">
      <span className="VisualizationDropdown__label">Visualization</span>
      <div className="VisualizationDropdown__controls">
        <Select
          className="Dropdown__select"
          value={selectedVisualization || visualizationKeys[0] || ''}
          onChange={handleVisualizationChange}
          input={<OutlinedInput />}
          MenuProps={{
            classes: { paper: 'Dropdown__menu' }
          }}
        >
          {options.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </Select>
        <label
          className="VisualizationDropdown__checkbox"
          htmlFor="scene-overlay-checkbox"
        >
          <MuiCheckbox
            id="scene-overlay-checkbox"
            checked={showSceneOverlay}
            onChange={handleShowOnMapChange}
            size="small"
          />
          <span>Show on map</span>
        </label>
      </div>
    </div>
  )
}

export default VisualizationDropdown
