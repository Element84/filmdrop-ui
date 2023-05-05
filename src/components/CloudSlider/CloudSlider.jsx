import { React, useState, useEffect } from 'react'
import { styled, createTheme, ThemeProvider } from '@mui/material/styles'
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import Slider from '@mui/material/Slider'
import MuiInput from '@mui/material/Input'

import './CloudSlider.css'
// eslint-disable-next-line import/no-absolute-path
import { VITE_STAC_API_URL } from '/public/config.js'

// most of this component comes from the material core UI started code
// https://mui.com/material-ui/react-slider/#slider-with-input-field

import { useDispatch, useSelector } from 'react-redux'
import { setCloudCover, setShowCloudSlider } from '../../redux/slices/mainSlice'

const Input = styled(MuiInput)`
  width: 42px;
  color: #dedede;
`

const CloudSlider = () => {
  const API_ENDPOINT = VITE_STAC_API_URL
  const _collectionSelected = useSelector(
    (state) => state.mainSlice.selectedCollection
  )

  const dispatch = useDispatch()
  const [value, setValue] = useState(30)
  const [disabled, setDisabled] = useState(false)

  useEffect(() => {
    if (_collectionSelected) {
      fetch(`${API_ENDPOINT}/collections/${_collectionSelected}/queryables`)
        .then((response) => response.json())
        .then((actualData) => {
          const supportsCloudCover = !!actualData?.properties['eo:cloud_cover']
          dispatch(setShowCloudSlider(supportsCloudCover))
          setDisabled(!supportsCloudCover)
        })
        .catch((err) => {
          dispatch(setShowCloudSlider(false))
          setDisabled(true)
          console.log('Fetch Error: ', err.message)
        })
    }
  }, [_collectionSelected])

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

  const theme = createTheme({
    palette: {
      primary: {
        main: '#dedede'
      },
      secondary: {
        main: '#edf2ff'
      }
    }
  })

  return (
    <ThemeProvider theme={theme}>
      <Box className={`cloudSlider ${disabled && 'disabled'}`}>
        <label>Max Cloud Cover %</label>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs>
            <Slider
              value={typeof value === 'number' ? value : 0}
              onChange={handleSliderChange}
              aria-labelledby="input-slider"
              color="primary"
              disabled={disabled}
            />
          </Grid>
          <Grid item>
            <Input
              value={value}
              size="small"
              onChange={handleInputChange}
              onBlur={handleBlur}
              className="sliderInput"
              sx={{
                ':before': { borderBottomColor: '#76829c' },
                // underline when selected
                ':after': { borderBottomColor: '#76829c' }
              }}
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
      </Box>
    </ThemeProvider>
  )
}

export default CloudSlider
