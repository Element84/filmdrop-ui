import { React, useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { setViewMode } from '../../redux/slices/mainSlice'
import './ViewSelector.css'
import { createTheme, ThemeProvider } from '@mui/material/styles'
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import Button from '@mui/material/Button'
import ButtonGroup from '@mui/material/ButtonGroup'

const ViewSelector = () => {
  const _viewMode = useSelector((state) => state.mainSlice.viewMode)

  const dispatch = useDispatch()
  const [selectedBtn, setSelectedBtn] = useState(_viewMode)

  const theme = createTheme({
    palette: {
      primary: {
        main: '#DEDEDE'
      },
      secondary: {
        main: '#4f5768'
      }
    }
  })

  useEffect(() => {
    dispatch(setViewMode(selectedBtn))
  }, [selectedBtn])

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ width: 165 }} className="viewSelector">
        <label htmlFor="ViewModeToggle">View Mode</label>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs>
            <ButtonGroup
              variant="contained"
              aria-label="outlined primary button group"
            >
              <Button
                color={selectedBtn === 'scene' ? 'secondary' : 'primary'}
                onClick={() => setSelectedBtn('scene')}
              >
                Scene
              </Button>
              <Button
                color={selectedBtn === 'mosaic' ? 'secondary' : 'primary'}
                onClick={() => setSelectedBtn('mosaic')}
              >
                Mosaic
              </Button>
            </ButtonGroup>
          </Grid>
        </Grid>
      </Box>
    </ThemeProvider>
  )
}

export default ViewSelector
