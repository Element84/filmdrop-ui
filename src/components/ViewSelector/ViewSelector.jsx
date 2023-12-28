import { React, useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { setViewMode } from '../../redux/slices/mainSlice'
import './ViewSelector.css'
import { createTheme, ThemeProvider } from '@mui/material/styles'
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import Button from '@mui/material/Button'
import ButtonGroup from '@mui/material/ButtonGroup'
import { newSearch } from '../../utils/searchHelper'

const ViewSelector = () => {
  const _viewMode = useSelector((state) => state.mainSlice.viewMode)
  const _showAppLoading = useSelector((state) => state.mainSlice.showAppLoading)
  const _selectedCollectionData = useSelector(
    (state) => state.mainSlice.selectedCollectionData
  )

  const dispatch = useDispatch()
  const [selectedBtn, setSelectedBtn] = useState(_viewMode)

  const theme = createTheme({
    palette: {
      primary: {
        main: '#353D4F'
      },
      secondary: {
        main: '#DEDEDE'
      }
    }
  })

  useEffect(() => {
    dispatch(setViewMode(selectedBtn))
    if (!_showAppLoading && _selectedCollectionData) {
      newSearch()
    }
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
