import { React, useState, useEffect } from 'react'
import './CloudSlider.css'
import { Stack } from '@mui/material'
import Grid from '@mui/material/Grid'
import Slider from '@mui/material/Slider'
import MuiInput from '@mui/material/Input'
import { useDispatch, useSelector } from 'react-redux'
import { setCloudCover, setShowCloudSlider } from '../../redux/slices/mainSlice'

const CloudSlider = () => {
  const _selectedCollectionData = useSelector(
    (state) => state.mainSlice.selectedCollectionData
  )
  const _cloudCover = useSelector((state) => state.mainSlice.cloudCover)

  const dispatch = useDispatch()
  const [value, setValue] = useState(_cloudCover)
  const [disabled, setDisabled] = useState(false)

  useEffect(() => {
    if (_selectedCollectionData) {
      const supportsCloudCover =
        _selectedCollectionData.queryables?.['eo:cloud_cover']
      if (supportsCloudCover) {
        setDisabled(!supportsCloudCover)
        dispatch(setShowCloudSlider(true))
      } else {
        setDisabled(true)
        dispatch(setShowCloudSlider(false))
      }
    }
  }, [_selectedCollectionData])

  useEffect(() => {
    dispatch(setCloudCover(value))
  }, [value])

  const handleSliderChange = (event, newValue) => {
    setValue(newValue)
  }

  const handleInputChange = (event) => {
    setValue(event.target.value === '' ? 0 : Number(event.target.value))
  }

  const handleBlur = () => {
    if (value < 0) {
      setValue(0)
    } else if (value > 100) {
      setValue(100)
    }
  }

  return (
    <Stack className={`cloudSlider ${disabled && 'disabled'}`}>
      <label htmlFor="cloudSlider">Max Cloud Cover %</label>
      <Grid
        className="cloudSliderInputs"
        container
        spacing={2}
        alignItems="center"
      >
        <Grid size="grow">
          <Slider
            value={typeof value === 'number' ? value : 0}
            onChange={handleSliderChange}
            aria-labelledby="input-slider"
            color="primary"
            disabled={disabled}
          />
        </Grid>
        <Grid size="auto">
          <MuiInput
            value={value}
            size="small"
            onChange={handleInputChange}
            onBlur={handleBlur}
            className="sliderInput"
            inputProps={{
              step: 1,
              min: 0,
              max: 100,
              type: 'number',
              'aria-labelledby': 'input-slider'
            }}
            disabled={disabled}
          />
        </Grid>
      </Grid>
    </Stack>
  )
}

export default CloudSlider
