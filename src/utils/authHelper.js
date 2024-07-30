export function logoutUser() {
  localStorage.removeItem('APP_AUTH_TOKEN')
  window.location.reload()
}
