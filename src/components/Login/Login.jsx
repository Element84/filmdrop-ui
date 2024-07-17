import { React, useState, useEffect } from 'react'
import './Login.css'
import { AuthService } from '../../services/post-auth-service'

const Login = () => {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')

  const handleUsernameChange = (e) => {
    setUsername(e.target.value)
  }

  const handlePasswordChange = (e) => {
    setPassword(e.target.value)
  }

  const submitLogin = (e) => {
    e.preventDefault()
    AuthService(username, password)
  }

  useEffect(() => {
    document.title = 'Login'
  }, [])

  return (
    <div className="Login">
      <div className="loginFormContainer">
        <h1>Login</h1>
        <form className="submitForm" onSubmit={submitLogin}>
          <label htmlFor="loginForm">Username:</label>
          <input type="text" value={username} onChange={handleUsernameChange} />
          <label htmlFor="loginForm">Password:</label>
          <input
            type="password"
            value={password}
            onChange={handlePasswordChange}
          />
          <button type="submit" className="actionButton">
            Login
          </button>
        </form>
      </div>
    </div>
  )
}

export default Login
