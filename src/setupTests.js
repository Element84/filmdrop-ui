import { expect, afterEach, beforeEach, vi } from 'vitest'
import { cleanup } from '@testing-library/react'
import * as matchers from '@testing-library/jest-dom/matchers'
import { mainSliceReset } from './redux/slices/mainSlice'
import { store } from './redux/store'
import 'resize-observer-polyfill'

window.HTMLCanvasElement.prototype.getContext = () => {}
global.ResizeObserver = require('resize-observer-polyfill')

expect.extend(matchers)

beforeEach(() => {
  store.dispatch(mainSliceReset())
  vi.mock('./services/get-collections-service.js')
  vi.mock('./services/get-config-service.js')
  vi.mock('./services/get-local-grid-data-json-service.js')
})

afterEach(() => {
  cleanup()
})
