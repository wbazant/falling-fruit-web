import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'

import {
  addList as apiAddList,
  addLocationToList as apiAddLocationToList,
  editList as apiEditList,
  getListsWithLocations as apiGetLists,
  removeList as apiRemoveList,
  removeLocationFromList as apiRemoveLocationFromList,
} from '../utils/api'

const initialState = {
  lists: [],
  isLoading: false,
  loadingLists: {},
}

// Fetch all lists (with embedded locations) from the backend
export const fetchLists = createAsyncThunk('save/fetchLists', async () => {
  const lists = await apiGetLists()
  return lists
})

// Add a new named list
// Payload: { name: string }
export const addList = createAsyncThunk('save/addList', async ({ name }) => {
  await apiAddList({ name })
  const lists = await apiGetLists()
  return lists
})

// Remove a list by id
// Payload: { listId: number }
export const removeList = createAsyncThunk(
  'save/removeList',
  async ({ listId }) => {
    await apiRemoveList(listId)
    const lists = await apiGetLists()
    return lists
  },
)

// Rename an existing list
// Payload: { listId: number, newName: string }
export const renameList = createAsyncThunk(
  'save/renameList',
  async ({ listId, newName }) => {
    await apiEditList(listId, { name: newName })
    const lists = await apiGetLists()
    return lists
  },
)

// Toggle a location in/out of a list by checking current state and calling
// the appropriate real API method (add or remove).
// Payload: { listId: number, locationId: string | number }
export const toggleLocationInList = createAsyncThunk(
  'save/toggleLocationInList',
  async ({ listId, locationId }, { getState }) => {
    const { lists } = getState().save
    const list = lists.find((l) => l.id === listId)
    const isAlreadySaved =
      list?.locations?.some((loc) => loc.id === Number(locationId)) ?? false

    if (isAlreadySaved) {
      await apiRemoveLocationFromList(Number(locationId), listId)
    } else {
      await apiAddLocationToList(Number(locationId), listId)
    }

    const updatedLists = await apiGetLists()
    return updatedLists
  },
)

const saveSlice = createSlice({
  name: 'save',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    // fetchLists
    builder.addCase(fetchLists.pending, (state) => {
      state.isLoading = true
    })
    builder.addCase(fetchLists.fulfilled, (state, action) => {
      state.isLoading = false
      state.lists = action.payload
    })
    builder.addCase(fetchLists.rejected, (state) => {
      state.isLoading = false
    })

    // addList
    builder.addCase(addList.pending, (state) => {
      state.isLoading = true
    })
    builder.addCase(addList.fulfilled, (state, action) => {
      state.isLoading = false
      state.lists = action.payload
    })
    builder.addCase(addList.rejected, (state) => {
      state.isLoading = false
    })

    // removeList
    builder.addCase(removeList.pending, (state, action) => {
      const { listId } = action.meta.arg
      state.loadingLists[listId] = true
    })
    builder.addCase(removeList.fulfilled, (state, action) => {
      const { listId } = action.meta.arg
      delete state.loadingLists[listId]
      state.lists = action.payload
    })
    builder.addCase(removeList.rejected, (state, action) => {
      const { listId } = action.meta.arg
      delete state.loadingLists[listId]
    })

    // renameList
    builder.addCase(renameList.pending, (state, action) => {
      const { listId } = action.meta.arg
      state.loadingLists[listId] = true
    })
    builder.addCase(renameList.fulfilled, (state, action) => {
      const { listId } = action.meta.arg
      delete state.loadingLists[listId]
      state.lists = action.payload
    })
    builder.addCase(renameList.rejected, (state, action) => {
      const { listId } = action.meta.arg
      delete state.loadingLists[listId]
    })

    // toggleLocationInList
    builder.addCase(toggleLocationInList.pending, (state, action) => {
      const { listId } = action.meta.arg
      state.loadingLists[listId] = true
    })
    builder.addCase(toggleLocationInList.fulfilled, (state, action) => {
      const { listId } = action.meta.arg
      delete state.loadingLists[listId]
      state.lists = action.payload
    })
    builder.addCase(toggleLocationInList.rejected, (state, action) => {
      const { listId } = action.meta.arg
      delete state.loadingLists[listId]
    })
  },
})

export const saveReducer = saveSlice.reducer

export default saveSlice.reducer
