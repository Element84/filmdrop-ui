import React from 'react'
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import SystemMessage from './SystemMessage'
import { Provider } from 'react-redux'
import { store } from '../../redux/store'
import {
  setapplicationAlertMessage,
  setapplicationAlertSeverity,
  setshowApplicationAlert
} from '../../redux/slices/mainSlice'

describe('SystemMessage', () => {
  const user = userEvent.setup()

  const setup = () =>
    render(
      <Provider store={store}>
        <SystemMessage />
      </Provider>
    )

  describe('when user clicks close button', () => {
    it('should set ShowApplicationAlert in state to false', async () => {
      store.dispatch(setshowApplicationAlert(true))
      setup()
      await user.click(
        screen.getByRole('button', {
          name: /close/i
        })
      )
      expect(store.getState().mainSlice.showApplicationAlert).toBeFalsy()
    })
  })

  describe('when alert renders', () => {
    it('should set severity to reflect redux state', async () => {
      store.dispatch(setshowApplicationAlert(true))
      store.dispatch(setapplicationAlertSeverity('success'))
      setup()
      expect(screen.getByRole('alert')).toHaveClass('MuiAlert-standardSuccess')
    })
    it('should set message to reflect redux state', async () => {
      store.dispatch(setshowApplicationAlert(true))
      store.dispatch(setapplicationAlertMessage('user updated'))
      setup()
      expect(screen.getByText(/user updated/i)).toBeInTheDocument()
    })
  })
})
