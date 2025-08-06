import { React, useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { setViewMode } from '../../redux/slices/mainSlice'
import './ViewSelector.css'
import { Stack } from '@mui/material'
import Grid from '@mui/material/Grid'
import Button from '@mui/material/Button'
import ButtonGroup from '@mui/material/ButtonGroup'

const ViewSelector = () => {
  const _viewMode = useSelector((state) => state.mainSlice.viewMode)

  const dispatch = useDispatch()
  const [selectedBtn, setSelectedBtn] = useState(_viewMode)

  useEffect(() => {
    dispatch(setViewMode(selectedBtn))
  }, [selectedBtn])

  return (
    <Stack sx={{ width: 165 }} className="viewSelector">
      <label htmlFor="ViewModeToggle">View Mode</label>
      <Grid container spacing={2} alignItems="center">
        <Grid size="grow">
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
    </Stack>
  )
}

export default ViewSelector
