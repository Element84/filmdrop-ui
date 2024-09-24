import { store } from '../redux/store'
import { setauthTokenExists } from '../redux/slices/mainSlice'

export function logoutUser() {
  localStorage.removeItem('APP_AUTH_TOKEN')
  store.dispatch(setauthTokenExists(false))
}
