import { React, useState, useEffect } from 'react'
import './CollectionDropdown.css'
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import NativeSelect from '@mui/material/NativeSelect'
import { useDispatch, useSelector } from 'react-redux'
import {
  setSelectedCollectionData,
  setShowZoomNotice,
  setSearchResults,
  setSearchLoading,
  sethasCollectionChanged
} from '../../redux/slices/mainSlice'
import {
  zoomToCollectionExtent,
  clearAllLayers,
  clearMapSelection
} from '../../utils/mapHelper'

const Dropdown = () => {
  const dispatch = useDispatch()
  const [collectionId, setCollectionId] = useState('Select Collection')

  const _collectionsData = useSelector(
    (state) => state.mainSlice.collectionsData
  )

  const _appConfig = useSelector((state) => state.mainSlice.appConfig)

  useEffect(() => {
    if (_collectionsData.length > 0) {
      const defaultCollectionFound = !!_collectionsData.find(
        (o) => o.id === _appConfig.VITE_DEFAULT_COLLECTION
      )
      if (!defaultCollectionFound) {
        console.log('Configuration Error: DEFAULT_COLLECTION not found in API')
      } else {
        setCollectionId(_appConfig.VITE_DEFAULT_COLLECTION)
      }
    }
  }, [_collectionsData])

  useEffect(() => {
    const selectedCollection = _collectionsData?.find(
      (e) => e.id === collectionId
    )
    if (selectedCollection) {
      dispatch(setSelectedCollectionData(selectedCollection))
      dispatch(setShowZoomNotice(false))
      dispatch(setSearchResults(null))
      dispatch(setSearchLoading(false))
      zoomToCollectionExtent(selectedCollection)
      clearMapSelection()
      clearAllLayers()
    }
  }, [collectionId])

  function onCollectionChanged(e) {
    dispatch(sethasCollectionChanged(true))
    setCollectionId(e.target.value)
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
    </Box>
  )
}

export default Dropdown
