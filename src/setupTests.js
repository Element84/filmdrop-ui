import { expect, afterEach, beforeEach } from 'vitest'
import { cleanup } from '@testing-library/react'
import matchers from '@testing-library/jest-dom/matchers'
import { mainSliceReset } from './redux/slices/mainSlice'
import { store } from './redux/store'

expect.extend(matchers)

beforeEach(() => {
  store.dispatch(mainSliceReset())
})

afterEach(() => {
  cleanup()
})
