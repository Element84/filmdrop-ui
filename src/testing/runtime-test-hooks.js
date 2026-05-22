import { __resetActiveStoreForTests } from '../redux/store-test-hooks'
import { __resetActiveRouterForTests } from '../router-test-hooks'

export function resetRuntimeForTests() {
  __resetActiveStoreForTests()
  __resetActiveRouterForTests()
}

export { __resetActiveStoreForTests, __resetActiveRouterForTests }
