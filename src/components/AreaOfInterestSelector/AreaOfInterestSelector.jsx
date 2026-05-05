import React, { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import {
  setIsDrawingEnabled,
  setSearchGeojsonBoundary,
  setShowUploadGeojsonModal
} from '../../redux/slices/mainSlice'
import ButtonGroup from '../ButtonGroup/ButtonGroup'
import { enableMapPolyDrawing } from '../../utils/mapInteraction'
import { clearLayer, zoomToCollectionExtent } from '../../utils/mapLayers'

const AreaOfInterestSelector = () => {
  const dispatch = useDispatch()
  const [selectedAOI, setSelectedAOI] = useState('mapview')

  const searchGeojsonBoundary = useSelector(
    (state) => state.mainSlice.searchGeojsonBoundary
  )
  const isDrawingEnabled = useSelector(
    (state) => state.mainSlice.isDrawingEnabled
  )
  const showUploadGeojsonModal = useSelector(
    (state) => state.mainSlice.showUploadGeojsonModal
  )
  const selectedCollectionData = useSelector(
    (state) => state.mainSlice.selectedCollectionData
  )

  // Reset to map view when draw/upload is cancelled or boundary is cleared
  useEffect(() => {
    // If drawing was cancelled (Draw button selected but drawing disabled and no boundary)
    if (selectedAOI === 'draw' && !isDrawingEnabled && !searchGeojsonBoundary) {
      setSelectedAOI('mapview')
      return
    }
    // If upload was cancelled (Upload button selected but modal closed and no boundary)
    if (
      selectedAOI === 'upload' &&
      !showUploadGeojsonModal &&
      !searchGeojsonBoundary
    ) {
      setSelectedAOI('mapview')
    }
  }, [
    searchGeojsonBoundary,
    isDrawingEnabled,
    showUploadGeojsonModal,
    selectedAOI
  ])

  const handleDraw = () => {
    // Clear any existing boundary to allow redrawing
    if (searchGeojsonBoundary) {
      dispatch(setSearchGeojsonBoundary(null))
      clearLayer('drawBoundsLayer')
    }
    setSelectedAOI('draw')
    dispatch(setIsDrawingEnabled(true))
    enableMapPolyDrawing()
  }

  const handleUpload = () => {
    // Clear any existing boundary to allow reuploading
    if (searchGeojsonBoundary) {
      dispatch(setSearchGeojsonBoundary(null))
      clearLayer('drawBoundsLayer')
    }
    setSelectedAOI('upload')
    dispatch(setShowUploadGeojsonModal(true))
  }

  const handleMapView = () => {
    setSelectedAOI('mapview')
    // Clear any drawn boundary when switching to map view
    dispatch(setSearchGeojsonBoundary(null))
    clearLayer('drawBoundsLayer')

    // Optionally zoom to collection extents if available
    if (selectedCollectionData) {
      zoomToCollectionExtent(selectedCollectionData)
    }
  }

  const buttons = [
    {
      value: 'draw',
      label: 'Draw',
      onClick: handleDraw,
      active: selectedAOI === 'draw',
      disabled: false
    },
    {
      value: 'upload',
      label: 'Upload',
      onClick: handleUpload,
      active: selectedAOI === 'upload',
      disabled: false
    },
    {
      value: 'mapview',
      label: 'Map View',
      onClick: handleMapView,
      active: selectedAOI === 'mapview',
      disabled: false
    }
  ]

  return <ButtonGroup label="Area of Interest" buttons={buttons} />
}

export default AreaOfInterestSelector
