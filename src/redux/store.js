import { configureStore } from '@reduxjs/toolkit'
import mainSlice from './slices/mainSlice'

// This sets up the store,
// you shouldn't need to edit this unless you want to
// do more advanced redux stuff...

export const store = configureStore({
  reducer: {
    mainSlice
  },
  // since we are adding a map from leaflet js (which returns a complex object, which is not serializable) need to disable check
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false
    })
})
