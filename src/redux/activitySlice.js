import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import i18next from 'i18next'
import { toast } from 'react-toastify'

import { getLocationsChanges } from '../utils/api'

const fetchLocationChanges = createAsyncThunk(
  'activity/fetchLocationChanges',
  getLocationsChanges,
)

export const fetchMoreLocationChanges =
  (userId) => async (dispatch, getState) => {
    const state = getState()
    const userState = state.activity.users[userId] || {}
    const latest = userState.fetchedUntilDate || new Date().toISOString()

    // Check if we're already loading data for this user
    if (userState.isLoading) {
      return Promise.resolve()
    }

    const params = { latest, offset: 0 }

    // Only calculate earliest date for 'all' users (7 days earlier than latest)
    if (userId === 'all') {
      const earliest = new Date(
        new Date(latest).getTime() - 7 * 24 * 60 * 60 * 1000,
      ).toISOString()
      params.earliest = earliest
    }
    if (userId !== 'all') {
      params.user_id = userId

      // For specific users, we need to get their data for the state
      try {
        // Import the getUserById function dynamically to avoid circular dependencies
        const { getUserById } = await import('../utils/api')
        const userData = await getUserById(userId)

        // Store user data in the state for later use
        if (!state.activity.users[userId]) {
          dispatch(
            activitySlice.actions.initializeUserState({ userId, userData }),
          )
        } else if (!state.activity.users[userId].userData) {
          dispatch(activitySlice.actions.setUserData({ userId, userData }))
        }
      } catch (error) {
        console.error('Error fetching user data:', error)
      }
    }

    return dispatch(fetchLocationChanges(params))
  }

const activitySlice = createSlice({
  name: 'activity',
  initialState: {
    users: {},
    anchorElementId: null,
  },
  reducers: {
    setAnchorElementId: (state, action) => {
      state.anchorElementId = action.payload
    },
    initializeUserState: (state, action) => {
      const { userId, userData } = action.payload
      state.users[userId] = {
        isLoading: false,
        locationChanges: [],
        fetchedUntilDate: null,
        userData,
      }
    },
    setUserData: (state, action) => {
      const { userId, userData } = action.payload
      if (state.users[userId]) {
        state.users[userId].userData = userData
      }
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

export const {
  setAnchorElementId,
  setUserId,
  initializeUserState,
  setUserData,
} = activitySlice.actions

export default activitySlice.reducer
