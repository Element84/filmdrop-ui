export function createStoreAccessors(store) {
  if (!store) {
    throw new Error('FilmDrop: createStoreAccessors requires a store instance')
  }

  return {
    dispatch: (action) => store.dispatch(action),
    getState: () => store.getState(),
    subscribe: (listener) => store.subscribe(listener)
  }
}
