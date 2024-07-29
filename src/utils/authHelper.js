export function logoutUser() {
  localStorage.removeItem('STAC_Auth_Token')
  window.location.reload()
}
