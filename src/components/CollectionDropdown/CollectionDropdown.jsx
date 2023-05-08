import { React, useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import NativeSelect from '@mui/material/NativeSelect'

import './CollectionDropdown.css'

// most of this component comes from the material core UI started code
// https://mui.com/material-ui/react-select/#native-select

import { useDispatch } from 'react-redux'
import {
  setSarPolarizations,
  setSelectedCollection,
  setCollectionTemporalData,
  setCollectionSpatialData,
  setFullCollectionData,
  setShowAppLoading
} from '../../redux/slices/mainSlice'

const Dropdown = ({ error }) => {
  const API_ENDPOINT = import.meta.env.VITE_STAC_API_URL
  const DEFAULT_COLLECTION = import.meta.env.VITE_DEFAULT_COLLECTION

  const dispatch = useDispatch()
  const [collectionId, setCollectionId] = useState()
  const [collectionData, setCollectionData] = useState(null)
  const [collectionComplete, setCollectionComplete] = useState(null)

  useEffect(() => {
    // fetch all available collections from API
    fetch(`${API_ENDPOINT}/collections`)
      .then((response) => response.json())
      .then((actualData) => {
        const sortedData = actualData.collections.sort((a, b) =>
          a.id > b.id ? 1 : b.id > a.id ? -1 : 0
        )
        setCollectionData(sortedData)
      })
      .catch((err) => {
        console.log('Collections Fetch Error: ', err.message)
      })
  }, [API_ENDPOINT])

  useEffect(() => {
    if (collectionData) {
      mapCollection(collectionData).then((data) => {
        setCollectionComplete(data)
        dispatch(setFullCollectionData(data))
        dispatch(setShowAppLoading(false))
      })
    }
  }, [collectionData])

  function fetchQueryables(collectionId) {
    return fetch(`${API_ENDPOINT}/collections/${collectionId}/queryables`)
      .then((response) => response.json())
      .then((data) => {
        return { 'sar:polarizations': !!data?.properties['sar:polarizations'] }
      })
      .catch((err) => {
        console.log('Fetch Error: ', err.message)
      })
  }

  function fetchAggregations(collectionId) {
    // fetch geo-aggregations or grid aggregation support by collection
    return fetch(`${API_ENDPOINT}/collections/${collectionId}/aggregations`)
      .then((response) => response.json())
      .then((data) => {
        const geoObject = {}
        geoObject.grid_code_frequency = !!data?.aggregations.find(
          (el) => el.name === 'grid_code_frequency'
        )
        geoObject.grid_code_landsat_frequency = !!data?.aggregations.find(
          (el) => el.name === 'grid_code_landsat_frequency'
        )
        geoObject.grid_geohex_frequency = !!data?.aggregations.find(
          (el) => el.name === 'grid_geohex_frequency'
        )
        return geoObject
      })
      .catch((err) => {
        console.log('Fetch Error: ', err.message)
      })
  }

  async function mapCollection(collections) {
    for (const collection of collections) {
      const polarizationObj = await fetchQueryables(collections[collection].id)
      const gridHexObj = await fetchAggregations(collections[collection].id)
      collections[collection] = Object.assign({}, collections[collection], {
        queryables: [...polarizationObj, ...gridHexObj]
      })
    }
    return collections
  }

  useEffect(() => {
    /**
     * Only the first entry from the temporal and spatial properties are used
     * despite there possibly being more ranges available in the collection
     */
    if (collectionComplete && collectionId) {
      const temporalData = getCollection(collectionData, collectionId).extent
        ?.temporal?.interval
      if (temporalData && temporalData.length >= 1) {
        dispatch(setCollectionTemporalData(temporalData[0]))
      }
      const spatialData = getCollection(collectionData, collectionId).extent
        ?.spatial?.bbox
      if (spatialData && spatialData.length >= 1) {
        dispatch(setCollectionSpatialData(spatialData[0]))
      }
      // set support for sar:polarization property if available for collection
      const supportsSarPolarizations = getCollection(
        collectionComplete,
        collectionId
      ).queryables['sar:polarizations']
      dispatch(setSarPolarizations(supportsSarPolarizations))
    }
  }, [collectionComplete, collectionId])

  useEffect(() => {
    // check if VITE_DEFAULT_COLLECTION is available
    if (collectionData) {
      const defaultCollectionFound = !!collectionData.find(
        (o) => o.id === DEFAULT_COLLECTION
      )
      if (!defaultCollectionFound) {
        dispatch(setSelectedCollection(null))
        console.log(
          'Configuration Error: VITE_DEFAULT_COLLECTION not found in API'
        )
      } else {
        setCollectionId(DEFAULT_COLLECTION)
      }
    }
  }, [collectionData])

  useEffect(() => {
    // update redux with updated collection
    dispatch(setSelectedCollection(collectionId))
  }, [collectionId])

  const getCollection = (collectionData, collectionId) => {
    return collectionData?.find((e) => e.id === collectionId)
  }

  const handleDropdownChange = (event) => {
    if (event) {
      setCollectionId(event.target.value)
    } else {
      setCollectionId('')
    }
  }

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
            onChange={handleDropdownChange}
          >
            <option value="">Select One</option>
            {collectionData &&
              collectionData.map(({ id, title }) => (
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
