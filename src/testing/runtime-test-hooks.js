import { __resetActiveStoreForTests } from '../redux/store-test-hooks'
import { __resetActiveRouterForTests } from '../router-test-hooks'
import { resetRuntimeStateForTests } from '../runtime-state'

export function __resetActiveRuntimeForTests() {
  resetRuntimeStateForTests()
}

export function resetRuntimeForTests() {
  __resetActiveRuntimeForTests()
  __resetActiveStoreForTests()
  __resetActiveRouterForTests()
}

export { __resetActiveStoreForTests, __resetActiveRouterForTests }
