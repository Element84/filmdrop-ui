import { createSlice } from '@reduxjs/toolkit'

// this is the initial state values for the redux store
// add to this for new state and set whatever default you want
const initialState = {
  map: {},
  dateTime: [],
  cloudCover: 0,
  searchResults: null,
  clickResults: [],
  searchLoading: false,
  currentPopupResult: null,
  showPublishModal: false,
  searchParameters: 'need to run search'
}

// next, for every key in the initialState
// add a reducer and a basic setter action
// this is the simple way to just set it
// look up redux doc for more advances ways to add/alter actions
export const mainSlice = createSlice({
  name: 'mainSlice',
  initialState,
  reducers: {
    setMap: (state, action) => {
      state.map = action.payload
    },
    setDateTime: (state, action) => {
      state.dateTime = action.payload
    },
    setCloudCover: (state, action) => {
      state.cloudCover = action.payload
    },
    setSearchResults: (state, action) => {
      state.searchResults = action.payload
    },
    setClickResults: (state, action) => {
      state.clickResults = action.payload
    },
    setSearchLoading: (state, action) => {
      state.searchLoading = action.payload
    },
    setCurrentPopupResult: (state, action) => {
      state.currentPopupResult = action.payload
    },
    setShowPublishModal: (state, action) => {
      state.showPublishModal = action.payload
    },
    setSearchParameters: (state, action) => {
      state.searchParameters = action.payload
    }
  }
})

// finally, add a new export for the
// reducer/action info that you added above
export const { setMap } = mainSlice.actions
export const { setDateTime } = mainSlice.actions
export const { setCloudCover } = mainSlice.actions
export const { setSearchResults } = mainSlice.actions
export const { setClickResults } = mainSlice.actions
export const { setSearchLoading } = mainSlice.actions
export const { setCurrentPopupResult } = mainSlice.actions
export const { setShowPublishModal } = mainSlice.actions
export const { setSearchParameters } = mainSlice.actions

export default mainSlice.reducer
