import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen, fireEvent } from '@testing-library/react'
import { renderFilmDrop } from '../../testing/renderFilmDrop'
import { createFilmDropStore } from '../../redux/store'
import { setappConfig } from '../../redux/slices/mainSlice'
import Login from './Login'

import { AuthService } from '../../services/post-auth-service'

vi.mock('../../services/post-auth-service', () => ({
  AuthService: vi.fn().mockResolvedValue(undefined)
}))

describe('Login', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  function mount() {
    const store = createFilmDropStore()
    store.dispatch(setappConfig({}))
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
})
