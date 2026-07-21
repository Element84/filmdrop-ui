import { __resetActiveStoreForTests } from '../redux/store-test-hooks'
import { __resetActiveRouterForTests } from '../router-test-hooks'
import { resetRuntimeStateForTests } from '../runtime-state'
import { __resetActiveUrlControllerForTests } from '../url-controller'

export function __resetActiveRuntimeForTests() {
  resetRuntimeStateForTests()
}

export function resetRuntimeForTests() {
  __resetActiveRuntimeForTests()
  __resetActiveStoreForTests()
  __resetActiveRouterForTests()
  __resetActiveUrlControllerForTests()
}

export {
  __resetActiveStoreForTests,
  __resetActiveRouterForTests,
  __resetActiveUrlControllerForTests
}
