import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import i18next from 'i18next'
import { toast } from 'react-toastify'

import { getLocationsChanges } from '../utils/api'

const fetchLocationChanges = createAsyncThunk(
  'activity/fetchLocationChanges',
  getLocationsChanges,
)

export const getUserActivity = (userId) => (dispatch) =>
  dispatch(fetchLocationChanges({ user_id: userId }))

export const fetchMoreLocationChanges = () => (dispatch, getState) => {
  const state = getState()
  const latest =
    state.activity.users.all.fetchedUntilDate || new Date().toISOString()
  const earliest = new Date(
    new Date(latest).getTime() - 7 * 24 * 60 * 60 * 1000,
  ).toISOString()

  return dispatch(fetchLocationChanges({ earliest, latest }))
}

const activitySlice = createSlice({
  name: 'activity',
  initialState: {
    users: {
      all: {
        isLoading: true,
        locationChanges: [],
      },
    },
    anchorElementId: null,
  },
  reducers: {
    setAnchorElementId: (state, action) => {
      state.anchorElementId = action.payload
    },
  },
  extraReducers: {
    [fetchLocationChanges.pending]: (state, action) => {
      const userId = action.meta.arg.user_id || 'all'
      if (!state.users[userId]) {
        state.users[userId] = {
          isLoading: true,
          locationChanges: [],
          fetchedUntilDate: null,
        }
      } else {
        state.users[userId].isLoading = true
      }
    },
    [fetchLocationChanges.fulfilled]: (state, action) => {
      const { earliest } = action.meta.arg
      const userId = action.meta.arg.user_id || 'all'
      const userState = state.users[userId]

      if (userState) {
        userState.locationChanges.push(...action.payload)
        userState.fetchedUntilDate = userState.fetchedUntilDate
          ? new Date(
              Math.min(
                new Date(userState.fetchedUntilDate),
                new Date(earliest),
              ),
            ).toISOString()
          : earliest

        userState.isLoading = false
      }
    },
    [fetchLocationChanges.rejected]: (state, action) => {
      const userId = action.meta.arg?.user_id || 'all'
      if (state.users[userId]) {
        state.users[userId].isLoading = false
      }
      toast.error(
        i18next.t('error_message.api.fetch_location_changes_failed', {
          message:
            action.error.message || i18next.t('error_message.unknown_error'),
        }),
      )
    },
  },
})

export const { setAnchorElementId } = activitySlice.actions

export default activitySlice.reducer
