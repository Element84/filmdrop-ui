import { vi, describe, it, expect, beforeEach } from 'vitest'
import debounce from './debounce'

describe('debounce', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  it('should call function after wait period', () => {
    const fn = vi.fn()
    const debounced = debounce(fn, 300)

    debounced('a')
    expect(fn).not.toHaveBeenCalled()

    vi.advanceTimersByTime(300)
    expect(fn).toHaveBeenCalledWith('a')
  })

  it('should reset timer on subsequent calls', () => {
    const fn = vi.fn()
    const debounced = debounce(fn, 300)

    debounced('a')
    vi.advanceTimersByTime(200)
    debounced('b')
    vi.advanceTimersByTime(200)

    expect(fn).not.toHaveBeenCalled()

    vi.advanceTimersByTime(100)
    expect(fn).toHaveBeenCalledWith('b')
    expect(fn).toHaveBeenCalledTimes(1)
  })

  describe('cancel', () => {
    it('should prevent pending call from executing', () => {
      const fn = vi.fn()
      const debounced = debounce(fn, 300)

      debounced('a')
      debounced.cancel()
      vi.advanceTimersByTime(300)

      expect(fn).not.toHaveBeenCalled()
    })
  })

  describe('flush', () => {
    it('should immediately execute pending call', () => {
      const fn = vi.fn()
      const debounced = debounce(fn, 300)

      debounced('a')
      debounced.flush()

      expect(fn).toHaveBeenCalledWith('a')
      expect(fn).toHaveBeenCalledTimes(1)
    })

    it('should not double-execute after flush', () => {
      const fn = vi.fn()
      const debounced = debounce(fn, 300)

      debounced('a')
      debounced.flush()
      vi.advanceTimersByTime(300)

      expect(fn).toHaveBeenCalledTimes(1)
    })

    it('should be a no-op when nothing is pending', () => {
      const fn = vi.fn()
      const debounced = debounce(fn, 300)

      debounced.flush()

      expect(fn).not.toHaveBeenCalled()
    })

    it('should flush the most recent arguments', () => {
      const fn = vi.fn()
      const debounced = debounce(fn, 300)

      debounced('a')
      debounced('b')
      debounced.flush()

      expect(fn).toHaveBeenCalledWith('b')
      expect(fn).toHaveBeenCalledTimes(1)
    })
  })
})
