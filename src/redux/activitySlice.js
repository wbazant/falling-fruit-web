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
  const userLocationChanges = state.activity.userLocationChanges[userId]

  if (userLocationChanges) {
    return Promise.resolve(userLocationChanges)
  } else {
    return dispatch(fetchLocationChangesUser({ user_id: userId }))
  }
}

export const fetchMoreLocationChanges = () => (dispatch, getState) => {
  const state = getState()
  const latest = state.activity.allFetchedUntilDate || new Date().toISOString()
  const earliest = new Date(
    new Date(latest).getTime() - 7 * 24 * 60 * 60 * 1000,
  ).toISOString()

  return dispatch(fetchLocationChangesAll({ earliest, latest }))
}

const activitySlice = createSlice({
  name: 'activity',
  initialState: {
    allLocationChanges: [],
    allIsLoading: true,
    allFetchedUntilDate: null,
    userLocationChanges: {},
    anchorElementId: null,
  },
  reducers: {
    setAnchorElementId: (state, action) => {
      state.anchorElementId = action.payload
    },
  },
  extraReducers: {
    [fetchLocationChangesUser.fulfilled]: (state, action) => {
      const userId = action.meta.arg.user_id
      state.userLocationChanges[userId] = action.payload
    },
    [fetchLocationChangesUser.rejected]: (state, action) => {
      toast.error(
        i18next.t('error_message.api.fetch_location_changes_failed', {
          message:
            action.error.message || i18next.t('error_message.unknown_error'),
        }),
      )
    },
    [fetchLocationChangesAll.pending]: (state) => {
      state.allIsLoading = true
    },
    [fetchLocationChangesAll.fulfilled]: (state, action) => {
      const { earliest } = action.meta.arg

      state.allLocationChanges.push(...action.payload)
      state.allFetchedUntilDate = state.allFetchedUntilDate
        ? new Date(
            Math.min(new Date(state.allFetchedUntilDate), new Date(earliest)),
          ).toISOString()
        : earliest

      state.allIsLoading = false
    },
    [fetchLocationChangesAll.rejected]: (state, action) => {
      state.allIsLoading = false

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
