import { React, useState, useEffect } from 'react'
import './CollectionDropdown.css'
import PropTypes from 'prop-types'
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import NativeSelect from '@mui/material/NativeSelect'
import { VITE_DEFAULT_COLLECTION } from '../../assets/config.js'
import { useDispatch, useSelector } from 'react-redux'
import {
  setSelectedCollectionData,
  setShowZoomNotice,
  setSearchResults
} from '../../redux/slices/mainSlice'
import { zoomToCollectionExtent, clearAllLayers } from '../../utils/mapHelper'

const Dropdown = ({ error }) => {
  const DEFAULT_COLLECTION = VITE_DEFAULT_COLLECTION

  const dispatch = useDispatch()
  const [collectionId, setCollectionId] = useState('selectOne')

  const _collectionsData = useSelector(
    (state) => state.mainSlice.collectionsData
  )

  useEffect(() => {
    if (_collectionsData.length > 0) {
      const defaultCollectionFound = !!_collectionsData.find(
        (o) => o.id === DEFAULT_COLLECTION
      )
      if (!defaultCollectionFound) {
        console.log(
          'Configuration Error: VITE_DEFAULT_COLLECTION not found in API'
        )
      } else {
        setCollectionId(DEFAULT_COLLECTION)
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
      zoomToCollectionExtent(selectedCollection)
      clearAllLayers()
      dispatch(setSearchResults(null))
    }
  }, [collectionId])

  return (
    <Box>
      <label>
        Collection{' '}
        {error && (
          <span className="error-true">
            <em>Required</em>
          </span>
        )}
      </label>
      <Grid container alignItems="center">
        <Grid item xs>
          <NativeSelect
            id="collectionDropdown"
            value={collectionId}
            label="Collection"
            onChange={(e) => setCollectionId(e.target.value)}
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

Dropdown.propTypes = {
  error: PropTypes.bool
}

export default Dropdown
