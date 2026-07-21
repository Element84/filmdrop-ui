import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen, fireEvent, waitFor } from '@testing-library/react'
import { renderFilmDrop } from '../../testing/renderFilmDrop'
import { createFilmDropStore } from '../../redux/store'
import { setAppConfig } from '../../redux/slices/mainSlice'
import Login from './Login'

import { AuthService } from '../../services/post-auth-service'
import { showApplicationAlert } from '../../utils/alertHelper'

vi.mock('../../services/post-auth-service', () => ({
  AuthService: vi.fn().mockResolvedValue(undefined)
}))

vi.mock('../../utils/alertHelper', () => ({
  showApplicationAlert: vi.fn()
}))

describe('Login', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  function mount() {
    const store = createFilmDropStore()
    store.dispatch(setAppConfig({}))
    return renderFilmDrop(<Login />, { store })
  }

  it('associates the Username label with its input', () => {
    mount()
    const input = screen.getByLabelText('Username:')
    expect(input.tagName).toBe('INPUT')
    expect(input.id).toBe('filmdrop-login-username')
    expect(input.getAttribute('autocomplete')).toBe('username')
    expect(input.getAttribute('type')).toBe('text')
  })

  it('associates the Password label with its input', () => {
    mount()
    const input = screen.getByLabelText('Password:')
    expect(input.tagName).toBe('INPUT')
    expect(input.id).toBe('filmdrop-login-password')
    expect(input.getAttribute('autocomplete')).toBe('current-password')
    expect(input.getAttribute('type')).toBe('password')
  })

  it('submits credentials via AuthService', () => {
    mount()
    fireEvent.change(screen.getByLabelText('Username:'), {
      target: { value: 'alice' }
    })
    fireEvent.change(screen.getByLabelText('Password:'), {
      target: { value: 'secret' }
    })
    fireEvent.click(screen.getByRole('button', { name: /login/i }))
    expect(AuthService).toHaveBeenCalledWith('alice', 'secret')
  })

  it('shows alert when AuthService returns normalized error', async () => {
    AuthService.mockResolvedValueOnce({
      error: true,
      summary: 'Authentication Error',
      details: 'Bad credentials'
    })

    mount()
    fireEvent.change(screen.getByLabelText('Username:'), {
      target: { value: 'alice' }
    })
    fireEvent.change(screen.getByLabelText('Password:'), {
      target: { value: 'wrong' }
    })
    fireEvent.click(screen.getByRole('button', { name: /login/i }))

    await waitFor(() => {
      expect(showApplicationAlert).toHaveBeenCalledWith(
        'warning',
        'Login Failed',
        5000
      )
    })
  })
})
