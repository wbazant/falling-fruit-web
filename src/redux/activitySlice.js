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

    // Default day range for 'all' users
    let dayRange = 7

    // For specific users, use their joining date to determine how far back to go
    if (userId !== 'all') {
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

        if (userData && userData.created_at) {
          // Calculate days since user joined
          const joinDate = new Date(userData.created_at)
          const now = new Date()
          const daysSinceJoined = Math.ceil(
            (now - joinDate) / (24 * 60 * 60 * 1000),
          )

          // Use a reasonable chunk size based on how long they've been a member
          // Newer users: fetch in smaller chunks, older users: larger chunks
          if (daysSinceJoined <= 30) {
            dayRange = 7 // One week chunks for very new users
          } else if (daysSinceJoined <= 180) {
            dayRange = 30 // One month chunks for users joined within 6 months
          } else {
            dayRange = 90 // Three month chunks for long-time users
          }
        } else {
          dayRange = 90 // Default for specific user if we can't get their join date
        }
      } catch (error) {
        console.error('Error fetching user data:', error)
        dayRange = 90 // Fallback to default if there's an error
      }
    }

    const earliest = new Date(
      new Date(latest).getTime() - dayRange * 24 * 60 * 60 * 1000,
    ).toISOString()

    // Determine minimum date - either user's join date or Jan 1, 2014 for 'all' users
    let minDate = new Date('2014-01-01T00:00:00.000Z')

    if (
      userId !== 'all' &&
      state.activity.users[userId]?.userData?.created_at
    ) {
      // Use the user's join date as the minimum date
      const userJoinDate = new Date(
        state.activity.users[userId].userData.created_at,
      )
      minDate = userJoinDate > minDate ? userJoinDate : minDate
    }

    if (new Date(earliest) < minDate) {
      return Promise.resolve()
    }

    // Check if we're already loading data for this user
    if (userState.isLoading) {
      return Promise.resolve()
    }

    const params = { earliest, latest, offset: 0 }
    if (userId !== 'all') {
      params.user_id = userId
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
