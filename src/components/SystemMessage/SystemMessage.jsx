import React from 'react'
import Alert from '@mui/material/Alert'
import './SystemMessage.css'

import { useSelector, useDispatch } from 'react-redux'
import { setShowApplicationAlert } from '../../redux/slices/mainSlice'
import { logoutUser } from '../../utils/authHelper'

const SystemMessage = () => {
  const dispatch = useDispatch()
  const _applicationAlertMessage = useSelector(
    (state) => state.mainSlice.applicationAlertMessage
  )
  const _applicationAlertSeverity = useSelector(
    (state) => state.mainSlice.applicationAlertSeverity
  )
  const _isAuthErrorAlert = useSelector(
    (state) => state.mainSlice.isAuthErrorAlert
  )

  return (
    <div className="SystemMessage" data-testid="testSystemMessage">
      <Alert
        onClose={() => {
          dispatch(setShowApplicationAlert(false))
          if (_applicationAlertSeverity === 'error' && _isAuthErrorAlert) {
            logoutUser()
          }
        }}
        severity={_applicationAlertSeverity}
        sx={{
          '& .MuiAlert-message': {
            fontSize: 14
          }
        }}
      >
        {_applicationAlertMessage}
      </Alert>
    </div>
  )
}

export default SystemMessage
