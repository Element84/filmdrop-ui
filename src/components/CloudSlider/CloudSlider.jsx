import { React, useState, useEffect } from 'react'
import './CloudSlider.css'
import { styled, createTheme, ThemeProvider } from '@mui/material/styles'
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import Slider from '@mui/material/Slider'
import MuiInput from '@mui/material/Input'
import { useDispatch, useSelector } from 'react-redux'
import { setCloudCover, setShowCloudSlider } from '../../redux/slices/mainSlice'

const Input = styled(MuiInput)`
  width: 42px;
  color: #dedede;
`

const CloudSlider = () => {
  const _selectedCollectionData = useSelector(
    (state) => state.mainSlice.selectedCollectionData
  )

  const dispatch = useDispatch()
  const [value, setValue] = useState(30)
  const [disabled, setDisabled] = useState(false)

  useEffect(() => {
    if (_selectedCollectionData) {
      const supportsCloudCover =
        _selectedCollectionData.queryables['eo:cloud_cover']
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
        <label htmlFor="cloudSlider">Max Cloud Cover %</label>
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
