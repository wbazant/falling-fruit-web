import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'

import {
  addList as apiAddList,
  addLocationToList as apiAddLocationToList,
  editList as apiEditList,
  getLists as apiGetLists,
  getLocationsByIds,
  removeList as apiRemoveList,
  removeLocationFromList as apiRemoveLocationFromList,
} from '../utils/api'
import { SavedList } from '../utils/apiMock'

export interface SaveState {
  lists: SavedList[]
  /** Global loading flag for operations not tied to a specific list */
  isLoading: boolean
  /** Per-list loading state: { [listId]: boolean } */
  loadingLists: Record<number, boolean>
  /** Locations fetched per list id: { [listId]: location[] } */
  locationsByListId: Record<number, any[]>
  /** Per-list loading flag for fetching locations: { [listId]: boolean } */
  loadingLocationsByListId: Record<number, boolean>
}

const initialState: SaveState = {
  lists: [],
  isLoading: false,
  loadingLists: {},
  locationsByListId: {},
  loadingLocationsByListId: {},
}

// Fetch all lists from the backend
export const fetchLists = createAsyncThunk<SavedList[]>(
  'save/fetchLists',
  async () => {
    const lists = await apiGetLists()
    return lists
  },
)

// Add a new named list
// Payload: { name: string }
export const addList = createAsyncThunk<SavedList[], { name: string }>(
  'save/addList',
  async ({ name }) => {
    await apiAddList({ name })
    const lists = await apiGetLists()
    return lists
  },
)

// Remove a list by id
// Payload: { listId: number }
export const removeList = createAsyncThunk<SavedList[], { listId: number }>(
  'save/removeList',
  async ({ listId }) => {
    await apiRemoveList(listId)
    const lists = await apiGetLists()
    return lists
  },
)

// Rename an existing list
// Payload: { listId: number, newName: string }
export const renameList = createAsyncThunk<
  SavedList[],
  { listId: number; newName: string }
>('save/renameList', async ({ listId, newName }) => {
  await apiEditList(listId, { name: newName })
  const lists = await apiGetLists()
  return lists
})

// Toggle a location in/out of a list by checking current state and calling
// the appropriate real API method (add or remove).
// Payload: { listId: number, locationId: string | number }
export const toggleLocationInList = createAsyncThunk<
  SavedList[],
  { listId: number; locationId: string | number },
  { state: { save: SaveState } }
>('save/toggleLocationInList', async ({ listId, locationId }, { getState }) => {
  const { lists } = getState().save
  const list = lists.find((l) => l.listId === listId)
  const isAlreadySaved =
    list?.locationIds?.includes(Number(locationId)) ?? false

  if (isAlreadySaved) {
    await apiRemoveLocationFromList(Number(locationId), listId)
  } else {
    await apiAddLocationToList(Number(locationId), listId)
  }

  const updatedLists = await apiGetLists()
  return updatedLists
})

// Fetch full location data for all locationIds in a given list.
// Payload: { listId: number, locationIds: (string | number)[] }
export const fetchLocationsForList = createAsyncThunk<
  any[],
  { listId: number; locationIds: number[] }
>('save/fetchLocationsForList', async ({ locationIds }) => {
  const locations = await getLocationsByIds(locationIds)
  return locations
})

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
      delete state.locationsByListId[listId]
      delete state.loadingLocationsByListId[listId]
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

    // fetchLocationsForList
    builder.addCase(fetchLocationsForList.pending, (state, action) => {
      const { listId } = action.meta.arg
      state.loadingLocationsByListId[listId] = true
      state.locationsByListId[listId] = []
    })
    builder.addCase(fetchLocationsForList.fulfilled, (state, action) => {
      const { listId } = action.meta.arg
      delete state.loadingLocationsByListId[listId]
      state.locationsByListId[listId] = action.payload
    })
    builder.addCase(fetchLocationsForList.rejected, (state, action) => {
      const { listId } = action.meta.arg
      delete state.loadingLocationsByListId[listId]
    })
  },
})

export const saveReducer = saveSlice.reducer

export default saveSlice.reducer
