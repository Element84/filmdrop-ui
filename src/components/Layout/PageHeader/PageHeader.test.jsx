import React from 'react'
import { render, screen } from '@testing-library/react'
import PageHeader from './PageHeader'
import { Provider } from 'react-redux'
import { store } from '../../../redux/store'

describe('PageHeader', () => {
  const setup = () =>
    render(
      <Provider store={store}>
        <PageHeader />
      </Provider>
    )
  describe('on app render', () => {
    it('should load the filmdrop logo into the document', () => {
      setup()
      expect(
        screen.getByRole('img', {
          name: /filmdrop by element 84/i
        })
      ).toBeInTheDocument()
    })
  })
})
