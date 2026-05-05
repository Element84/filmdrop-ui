import React, { useEffect, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate, useParams } from '@tanstack/react-router'
import {
  setSelectedCollectionData,
  setShowZoomNotice,
  setSearchLoading,
  setQueryableFilters,
  setSelectedVisualization
} from '../../redux/slices/mainSlice'
import {
  zoomToCollectionExtent,
  clearAllLayers,
  clearMapSelection
} from '../../utils/mapLayers'
import Dropdown from '../Dropdown/Dropdown'

const CollectionDropdown = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const params = useParams({ strict: false })
  const selectedCollection = useSelector(
    (state) => state.mainSlice.selectedCollection
  )
  const selectedCollectionData = useSelector(
    (state) => state.mainSlice.selectedCollectionData
  )
  const collectionsData = useSelector(
    (state) => state.mainSlice.collectionsData
  )
  const appConfig = useSelector((state) => state.mainSlice.appConfig)

  // Convert collections data to dropdown options
  const options = useMemo(() => {
    const placeholder = { value: 'selectOne', label: 'Select Collection' }

    if (!collectionsData || collectionsData.length === 0) {
      return [placeholder]
    }

    const collectionOptions = collectionsData.map(({ id, title }) => ({
      value: id,
      label: title ?? id
    }))

    // Include placeholder when no collection is selected yet to avoid
    // MUI warning about out-of-range value during the render before
    // the useEffect sets the default collection
    if (!selectedCollection) {
      return [placeholder, ...collectionOptions]
    }

    return collectionOptions
  }, [collectionsData, selectedCollection])

  // Initialize default collection on mount — navigate to collection path
  // so URL→Redux sync sets selectedCollection.
  // Skip if URL path already specifies a collection (useUrlInitialize will handle it).
  useEffect(() => {
    if (collectionsData.length === 0) return
    if (selectedCollection) return
    if (params.collectionId) return

    // Get default from config
    const defaultCollection = appConfig.COLLECTIONS?.default

    let defaultId
    if (!defaultCollection) {
      defaultId = collectionsData[0].id
    } else {
      const defaultCollectionExists = collectionsData.some(
        (c) => c.id === defaultCollection
      )
      if (!defaultCollectionExists) {
        console.warn('Configuration Error: default collection not found in API')
        defaultId = collectionsData[0].id
      } else {
        defaultId = defaultCollection
      }
    }

    navigate({
      to: '/$collectionId',
      params: { collectionId: defaultId },
      replace: true
    })
  }, [
    collectionsData,
    selectedCollection,
    appConfig,
    navigate,
    params.collectionId
  ])

  // Update collection data when selection changes
  useEffect(() => {
    if (!selectedCollection) return

    const collection = collectionsData.find((c) => c.id === selectedCollection)

    if (collection) {
      const isChanging = collection.id !== selectedCollectionData?.id

      dispatch(setSelectedCollectionData(collection))
      dispatch(setShowZoomNotice(false))
      dispatch(setSearchLoading(false))

      if (isChanging) {
        // Skip animation on initial selection so the zoom completes
        // before the loading overlay disappears (no visible shift).
        const animate = !!selectedCollectionData?.id
        zoomToCollectionExtent(collection, { animate })
      }
    }
  }, [
    selectedCollection,
    collectionsData,
    selectedCollectionData?.id,
    dispatch
  ])

  const handleCollectionChange = (e) => {
    const newCollectionId = e.target.value

    // Clear map and filters
    clearMapSelection()
    clearAllLayers()
    dispatch(setQueryableFilters({}))

    // Reset visualization so new collection's default is selected
    dispatch(setSelectedVisualization(null))

    // Navigate to collection path — URL→Redux sync handles setSelectedCollection
    navigate({
      to: '/$collectionId',
      params: { collectionId: newCollectionId },
      search: (prev) => ({
        // Preserve map position; clear search-committed params for new collection
        z: prev.z,
        c: prev.c,
        tab: prev.tab
      }),
      replace: true
    })
  }

  return (
    <Dropdown
      label="Collection"
      value={selectedCollection || 'selectOne'}
      onChange={handleCollectionChange}
      options={options}
    />
  )
}

export default CollectionDropdown
