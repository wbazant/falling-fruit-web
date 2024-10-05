import { createSlice } from '@reduxjs/toolkit'

export const viewportSlice = createSlice({
  name: 'viewport',
  initialState: {
    lastMapView: null,
  },
  reducers: {
    updateLastMapView: (state, action) => {
      console.log(action.payload)
      state.lastMapView = action.payload
    },
  },
})

export const { updateLastMapView } = viewportSlice.actions

export default viewportSlice.reducer
