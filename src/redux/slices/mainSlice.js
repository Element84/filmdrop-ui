import { createSlice } from "@reduxjs/toolkit";

// this is the initial state values for the redux store
// add to this for new state and set whatever default you want
const initialState = {
  map: {},
  dateTime: [],
  cloudCover: 0,
  selectedCollection: null,
  searchResults: null,
  clickResults: [],
  searchLoading: false,
  currentPopupResult: null,
  showPublishModal: false,
  searchParameters: "need to run search",
};

// next, for every key in the initialState
// add a reducer and a basic setter action
// this is the simple way to just set it
// look up redux doc for more advances ways to add/alter actions
export const mainSlice = createSlice({
  name: "mainSlice",
  initialState,
  reducers: {
    setmap: (state, action) => {
      state.map = action.payload;
    },
    setdateTime: (state, action) => {
      state.dateTime = action.payload;
    },
    setcloudCover: (state, action) => {
      state.cloudCover = action.payload;
    },
    setselectedCollection: (state, action) => {
      state.selectedCollection = action.payload;
    },
    setsearchResults: (state, action) => {
      state.searchResults = action.payload;
    },
    setclickResults: (state, action) => {
      state.clickResults = action.payload;
    },
    setsearchLoading: (state, action) => {
      state.searchLoading = action.payload;
    },
    setcurrentPopupResult: (state, action) => {
      state.currentPopupResult = action.payload;
    },
    setshowPublishModal: (state, action) => {
      state.showPublishModal = action.payload;
    },
    setsearchParameters: (state, action) => {
      state.searchParameters = action.payload;
    },
  },
});

// finally, add a new export for the
// reducer/action info that you added above
export const { setmap } = mainSlice.actions;
export const { setdateTime } = mainSlice.actions;
export const { setcloudCover } = mainSlice.actions;
export const { setselectedCollection } = mainSlice.actions;
export const { setsearchResults } = mainSlice.actions;
export const { setclickResults } = mainSlice.actions;
export const { setsearchLoading } = mainSlice.actions;
export const { setcurrentPopupResult } = mainSlice.actions;
export const { setshowPublishModal } = mainSlice.actions;
export const { setsearchParameters } = mainSlice.actions;

export default mainSlice.reducer;
