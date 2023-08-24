import { expect, afterEach, beforeEach } from 'vitest'
import { cleanup } from '@testing-library/react'
import matchers from '@testing-library/jest-dom/matchers'
import { mainSliceReset } from './redux/slices/mainSlice'
import { store } from './redux/store'
import 'resize-observer-polyfill'

window.HTMLCanvasElement.prototype.getContext = () => {}
global.ResizeObserver = require('resize-observer-polyfill')

expect.extend(matchers)

beforeEach(() => {
  store.dispatch(mainSliceReset())
})

afterEach(() => {
  cleanup()
})
