import { store } from '../redux/store'
import { setauthTokenExists } from '../redux/slices/mainSlice'
import { showApplicationAlert } from '../utils/alertHelper'

export async function AuthService(username, password) {
  const AuthServiceURL = store.getState().mainSlice.appConfig.AUTH_URL

  const myHeaders = new Headers()
  myHeaders.append('Content-Type', 'application/x-www-form-urlencoded')

  const urlencoded = new URLSearchParams()
  urlencoded.append('grant_type', 'password')
  urlencoded.append('username', username)
  urlencoded.append('password', password)

  const reqParams = {
    method: 'POST',
    headers: myHeaders,
    body: urlencoded
  }

  await fetch(`${AuthServiceURL}`, reqParams)
    .then((response) => {
      if (response.ok) {
        return response.json()
      }
      throw new Error()
    })
    .then((json) => {
      if (!json.access_token) {
        throw new Error('No Auth Token Found')
      }
      localStorage.setItem('APP_AUTH_TOKEN', json.access_token)
      store.dispatch(setauthTokenExists(true))
    })
    .catch((error) => {
      store.dispatch(setauthTokenExists(false))
      const message = 'Authentication Error'
      showApplicationAlert('warning', 'Login Failed', 5000)
      // log full error for diagnosing client side errors if needed
      console.error(message, error)
    })
}
