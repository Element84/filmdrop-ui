import { React, useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import NativeSelect from '@mui/material/NativeSelect'

import './CollectionDropdown.css'

// most of this component comes from the material core UI started code
// https://mui.com/material-ui/react-select/#native-select

// redux imports
import { useDispatch } from 'react-redux'
// you need to import each action you need to use
import {
  setSarPolarizations,
  setSelectedCollection
} from '../../redux/slices/mainSlice'

const Dropdown = ({ error }) => {
  const API_ENDPOINT = process.env.REACT_APP_STAC_API_URL
  const DEFAULT_COLLECTION = process.env.REACT_APP_DEFAULT_COLLECTION

  // if you are setting redux state, call dispatch
  const dispatch = useDispatch()
  const [value, setValue] = useState()
  const [collectionData, setCollectionData] = useState(null)

  useEffect(() => {
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
    // setup sar:polarizations query parameter, if available
    fetch(`${API_ENDPOINT}/collections/${value}/queryables`)
      .then((response) => response.json())
      .then((actualData) => {
        const supportsSarPolarizations =
          !!actualData?.properties['sar:polarizations']
        dispatch(setSarPolarizations(supportsSarPolarizations))
      })
      .catch((err) => {
        dispatch(setSarPolarizations(false))
        console.log('Fetch Error: ', err.message)
      })
    // update redux with updated collection
    dispatch(setSelectedCollection(value))
    // eslint-disable-next-line
  }, [value])

  useEffect(() => {
    // check if REACT_APP_DEFAULT_COLLECTION is available
    if (collectionData) {
      const defaultCollectionFound = !!collectionData.find(
        (o) => o.id === DEFAULT_COLLECTION
      )
      if (!defaultCollectionFound) {
        dispatch(setSelectedCollection(null))
        console.log(
          'Configuration Error: REACT_APP_DEFAULT_COLLECTION not found in API'
        )
      } else {
        setValue(DEFAULT_COLLECTION)
      }
    }
  }, [collectionData])

  const handleDropdownChange = (event) => {
    if (event) {
      setValue(event.target.value)
    } else {
      setValue('')
    }
  }

  return (
    <Box sx={{ width: 250 }}>
      <label>
        Collection{' '}
        {error && (
          <span className="error-true">
            <em>Required</em>
          </span>
        )}
      </label>
      <Grid container spacing={2} alignItems="center">
        <Grid item xs>
          <NativeSelect
            id="collectionDropdown"
            value={value}
            label="Collection"
            onChange={handleDropdownChange}
            sx={{
              width: 250
            }}
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
