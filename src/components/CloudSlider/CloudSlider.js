import { React, useState, useEffect } from 'react'
import { styled, createTheme, ThemeProvider } from '@mui/material/styles'
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import Slider from '@mui/material/Slider'
import MuiInput from '@mui/material/Input'

import './CloudSlider.css'

// most of this component comes from the material core UI started code
// https://mui.com/material-ui/react-slider/#slider-with-input-field

// redux imports
import { useDispatch } from 'react-redux'
// you need to import each action you need to use
import { setCloudCover } from '../../redux/slices/mainSlice'

const Input = styled(MuiInput)`
  width: 42px;
  color: #dedede;
`

const CloudSlider = () => {
  // if you are setting redux state, call dispatch
  const dispatch = useDispatch()
  const [value, setValue] = useState(30)

  useEffect(() => {
    dispatch(setCloudCover(value))
    // eslint-disable-next-line
  }, [value])

  const handleSliderChange = (event, newValue) => {
    setValue(newValue)
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
    <ThemeProvider theme={theme}>
      <Box sx={{ width: 250 }}>
        <label>Max Cloud Cover %</label>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs>
            <Slider
              value={typeof value === 'number' ? value : 0}
              onChange={handleSliderChange}
              aria-labelledby="input-slider"
              color="primary"
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
                ':before': { borderBottomColor: '#dedede' },
                // underline when selected
                ':after': { borderBottomColor: '#dedede' }
              }}
              inputProps={{
                step: 1,
                min: 0,
                max: 100,
                type: 'number',
                'aria-labelledby': 'input-slider'
              }}
            />
          </Grid>
        </Grid>
      </Box>
    </ThemeProvider>
  )
}

export default CloudSlider
