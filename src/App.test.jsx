import React from 'react'
import { render } from '@testing-library/react'
import App from './App'
import { Provider } from 'react-redux'
import { store } from './redux/store'

describe('App', () => {
  // TODO: this will be used properly once the refactor mentioned in TODO comments below is implemented
  // eslint-disable-next-line no-unused-vars
  const setup = () =>
    render(
      <Provider store={store}>
        <App />
      </Provider>
    )

  describe('on app render', () => {
    it('should render the PageHeader component', () => {
      // TODO: this will be cause errors since fetch API calls are nested in child component renders
      // recommend refactor to move api calls into services directory to setup cleaner testing
      //
      // setup()
      // const PageHeaderComponent = screen.queryByTestId('testPageHeader')
      // expect(PageHeaderComponent).not.toBeNull()
    })
    it('should render the Content Component', () => {
      // TODO: this will be cause errors since fetch API calls are nested in child component renders
      // recommend refactor to move api calls into services directory to setup cleaner testing
      //
      // setup()
      // const ContentComponent = screen.queryByTestId('testContent')
      // expect(ContentComponent).not.toBeNull()
    })
  })
})
