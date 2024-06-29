import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { toast } from 'react-toastify'

import { getLocationById } from '../utils/api'
import { fetchReviewData } from './reviewSlice'

export const fetchLocationData = createAsyncThunk(
  'locations/fetchLocationData',
  async ({ locationId, isBeingEdited: _ }) => {
    const locationData = await getLocationById(locationId, 'reviews')
    return locationData
  },
)

const locationSlice = createSlice({
  name: 'location',
  initialState: {
    isLoading: false,
    location: null,
    position: null, // {lat: number, lng: number}
    locationId: null,
    isBeingEdited: false,
  },
  reducers: {
    clearLocation: (state) => {
      state.isLoading = false
      state.location = null
      state.locationId = null
      state.position = null
      state.isBeingEdited = false
    },
    initNewLocation: (state, action) => {
      state.isLoading = false
      state.location = null
      state.isBeingEdited = true
      if (state.locationId !== 'new') {
        state.locationId = 'new'
        state.position = action.payload
      }
    },
    updatePosition: (state, action) => {
      if (state.locationId === 'new') {
        state.position = action.payload
      }
    },
  },
  extraReducers: {
    [fetchLocationData.pending]: (state, action) => {
      state.location = null
      state.locationId = `pending-${action.meta.arg.locationId}`
      state.isLoading = true
      state.position = null
      state.isBeingEdited = action.meta.arg.isBeingEdited
    },
    [fetchLocationData.fulfilled]: (state, action) => {
      state.isLoading = false
      // Accept the latest initiated fetch
      if (state.locationId === `pending-${action.payload.id}`) {
        state.location = action.payload
        state.locationId = parseInt(action.payload.id)
        state.position = { lat: action.payload.lat, lng: action.payload.lng }
      }
    },
    [fetchLocationData.rejected]: (state, action) => {
      state.isLoading = false
      state.location = null
      state.locationId = null
      state.position = null
      state.isBeingEdited = false
      toast.error(`Error fetching location data: ${action.meta.arg}`)
    },
    [fetchReviewData.fulfilled]: (state, action) => {
      state.isLoading = false
      state.location = null
      state.locationId = parseInt(action.payload.location_id)
      state.position = null
      state.isBeingEdited = false
    },
  },
})

export const { initNewLocation, clearLocation, updatePosition } =
  locationSlice.actions

export default locationSlice.reducer
