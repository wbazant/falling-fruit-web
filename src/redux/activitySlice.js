import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import i18next from 'i18next'
import { toast } from 'react-toastify'

import { getLocationsChanges } from '../utils/api'

const fetchLocationChangesUser = createAsyncThunk(
  'activity/fetchLocationChangesUser',
  getLocationsChanges,
)

const fetchLocationChangesAll = createAsyncThunk(
  'activity/fetchLocationChangesAll',
  getLocationsChanges,
)

export const getUserActivity = (userId) => (dispatch, getState) => {
  const state = getState()
  const userData = state.activity.users[userId]

  if (userData) {
    return Promise.resolve(userData.locationChanges)
  } else {
    return dispatch(fetchLocationChangesUser({ user_id: userId }))
  }
}

export const fetchMoreLocationChanges = () => (dispatch, getState) => {
  const state = getState()
  const latest =
    state.activity.users.all.fetchedUntilDate || new Date().toISOString()
  const earliest = new Date(
    new Date(latest).getTime() - 7 * 24 * 60 * 60 * 1000,
  ).toISOString()

  return dispatch(fetchLocationChangesAll({ earliest, latest }))
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
    [fetchLocationChangesUser.pending]: (state, action) => {
      const userId = action.meta.arg.user_id
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
    [fetchLocationChangesUser.fulfilled]: (state, action) => {
      const { earliest } = action.meta.arg
      const userId = action.meta.arg.user_id
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
    [fetchLocationChangesUser.rejected]: (state, action) => {
      const userId = action.meta.arg.user_id
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
    [fetchLocationChangesAll.pending]: (state) => {
      if (!state.users.all) {
        state.users.all = {
          isLoading: true,
          locationChanges: [],
          fetchedUntilDate: null,
        }
      } else {
        state.users.all.isLoading = true
      }
    },
    [fetchLocationChangesAll.fulfilled]: (state, action) => {
      const { earliest } = action.meta.arg
      const userState = state.users.all

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
    [fetchLocationChangesAll.rejected]: (state, action) => {
      if (state.users.all) {
        state.users.all.isLoading = false
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
