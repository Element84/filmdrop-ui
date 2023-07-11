import React from 'react'
import Alert from '@mui/material/Alert'
import './SystemMessage.css'

import { useSelector } from 'react-redux'
import { store } from '../../redux/store'
import { setshowApplicationAlert } from '../../redux/slices/mainSlice'

const SystemMessage = () => {
  const _applicationAlertMessage = useSelector(
    (state) => state.mainSlice.applicationAlertMessage
  )
  const _applicationAlertSeverity = useSelector(
    (state) => state.mainSlice.applicationAlertSeverity
  )

  return (
    <div className="SystemMessage">
      <Alert
        onClose={() => {
          store.dispatch(setshowApplicationAlert(false))
        }}
        severity={_applicationAlertSeverity}
      >
        {_applicationAlertMessage}
      </Alert>
    </div>
  )
}

export default SystemMessage
