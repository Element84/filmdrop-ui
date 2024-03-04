import { React, useState, useEffect } from 'react'
import './CollectionDropdown.css'
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import NativeSelect from '@mui/material/NativeSelect'
import { useDispatch, useSelector } from 'react-redux'
import {
  setSelectedCollectionData,
  setShowZoomNotice,
  setSearchLoading,
  sethasCollectionChanged,
  setSelectedCollection
} from '../../redux/slices/mainSlice'
import {
  zoomToCollectionExtent,
  clearAllLayers,
  clearMapSelection
} from '../../utils/mapHelper'

const Dropdown = () => {
  const _selectedCollection = useSelector(
    (state) => state.mainSlice.selectedCollection
  )
  const _selectedCollectionData = useSelector(
    (state) => state.mainSlice.selectedCollectionData
  )
  const dispatch = useDispatch()
  const [collectionId, setCollectionId] = useState(_selectedCollection)
  const _collectionsData = useSelector(
    (state) => state.mainSlice.collectionsData
  )
  const _appConfig = useSelector((state) => state.mainSlice.appConfig)

  useEffect(() => {
    if (_collectionsData.length > 0) {
      if (_selectedCollection !== 'Select Collection') {
        setCollectionId(_selectedCollection)
        return
      }
      if (!_appConfig.DEFAULT_COLLECTION) {
        setCollectionId(_collectionsData[0].id)
        return
      }
      const defaultCollectionFound = !!_collectionsData.find(
        (o) => o.id === _appConfig.DEFAULT_COLLECTION
      )
      if (!defaultCollectionFound) {
        console.log('Configuration Error: DEFAULT_COLLECTION not found in API')
        setCollectionId(_collectionsData[0].id)
      } else {
        setCollectionId(_appConfig.DEFAULT_COLLECTION)
      }
    }
  }, [_collectionsData])

  useEffect(() => {
    const selectedCollection = _collectionsData?.find(
      (e) => e.id === collectionId
    )
    if (selectedCollection) {
      dispatch(setSelectedCollection(collectionId))
      dispatch(setSelectedCollectionData(selectedCollection))
      dispatch(setShowZoomNotice(false))
      dispatch(setSearchLoading(false))
      if (selectedCollection !== _selectedCollectionData) {
        zoomToCollectionExtent(selectedCollection)
      }
    }
  }, [collectionId])

  function onCollectionChanged(e) {
    dispatch(sethasCollectionChanged(true))
    setCollectionId(e.target.value)
    clearMapSelection()
    clearAllLayers()
  }

  function formatDate(dateString) {
    return dateString ? dateString.split('T')[0] : null
  }

  return (
    <Box>
      <label htmlFor="collectionDropdown">Collection</label>
      <Grid container alignItems="center">
        <Grid item xs>
          <NativeSelect
            id="collectionDropdown"
            value={collectionId}
            label="Collection"
            onChange={(e) => onCollectionChanged(e)}
          >
            <option value="selectOne" disabled={true}>
              Select Collection
            </option>
            {_collectionsData &&
              _collectionsData.map(({ id, title }) => (
                <option key={id} value={id}>
                  {title}
                </option>
              ))}
          </NativeSelect>
        </Grid>
      </Grid>
      {_selectedCollectionData?.extent?.temporal && (
        <div className="collectionRangeText">
          <span>Extent:&nbsp;</span>
          {formatDate(_selectedCollectionData.extent.temporal.interval[0][0]) ||
            'No Lower Limit'}{' '}
          to{' '}
          {formatDate(_selectedCollectionData.extent.temporal.interval[0][1]) ||
            'Present'}
        </div>
      )}
    </Box>
  )
}

export default Dropdown
