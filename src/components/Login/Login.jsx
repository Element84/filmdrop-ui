import { React, useState, useEffect } from 'react'
import './Login.css'
import { AuthService } from '../../services/post-auth-service'
import { useSelector } from 'react-redux'
import { shouldApplyDocumentBranding } from '../../utils/themeHelper'

const Login = () => {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const _appConfig = useSelector((state) => state.mainSlice.appConfig)

  const handleUsernameChange = (e) => {
    setUsername(e.target.value)
  }

  const handlePasswordChange = (e) => {
    setPassword(e.target.value)
  }

  const submitLogin = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      await AuthService(username, password)
    } catch (error) {
      console.error('Login failed', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  useEffect(() => {
    if (!shouldApplyDocumentBranding()) {
      return undefined
    }
    const previousTitle = document.title
    document.title = 'Login'
    return () => {
      document.title = previousTitle
    }
  }, [])

  return (
    <div className="Login">
      <div className="loginFormLogo">
        {_appConfig.LOGO_URL ? (
          <img
            src={_appConfig.LOGO_URL}
            alt={_appConfig.LOGO_ALT}
            className="loginLogoImage"
          ></img>
        ) : (
          <img
            src={
              _appConfig.PUBLIC_URL
                ? _appConfig.PUBLIC_URL + '/logo.png'
                : './logo.png'
            }
            alt="FilmDrop default app logo"
            className="loginLogoImage"
          />
        )}
      </div>
      <div className="loginFormContainer">
        <h1>Login</h1>
        <form className="submitForm" onSubmit={submitLogin}>
          <label htmlFor="filmdrop-login-username">Username:</label>
          <input
            id="filmdrop-login-username"
            type="text"
            autoComplete="username"
            value={username}
            onChange={handleUsernameChange}
            required={true}
          />
          <label htmlFor="filmdrop-login-password">Password:</label>
          <input
            id="filmdrop-login-password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={handlePasswordChange}
            required={true}
          />
          <button
            type="submit"
            disabled={isSubmitting}
            className={
              isSubmitting
                ? 'actionButton actionButtonDisabled'
                : 'actionButton'
            }
          >
            Login
          </button>
        </form>
      </div>
    </div>
  )
}

export default Login
