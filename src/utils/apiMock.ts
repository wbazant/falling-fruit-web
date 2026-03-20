/**
 * Mock API module that uses localStorage to simulate a backend.
 * All functions are async to match the interface of a real API.
 */

const STORAGE_KEY = 'save_lists'

export interface SavedList {
  listId: number
  name: string
  locationIds: (string | number)[]
  createdAt: string
  updatedAt: string
}

// Small simulated network delay in ms
const SIMULATED_DELAY = 100

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function loadLists(): SavedList[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      return JSON.parse(raw) as SavedList[]
    }
  } catch {
    // If parsing fails, fall through to defaults
  }
  return []
}

function saveLists(lists: SavedList[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(lists))
}

function generateListId(): number {
  return Math.floor(Math.random() * 2_147_483_647)
}

/**
 * Fetch all lists.
 */
export async function getLists(): Promise<SavedList[]> {
  await delay(SIMULATED_DELAY)
  return loadLists()
}

/**
 * Add a new named list.
 * No-op if a list with that name already exists.
 * Returns the updated lists.
 */
export async function addList(name: string): Promise<SavedList[]> {
  await delay(SIMULATED_DELAY)
  const lists = loadLists()
  const exists = lists.some((list) => list.name === name)
  if (!exists) {
    const now = new Date().toISOString()
    lists.push({
      listId: generateListId(),
      name,
      locationIds: [],
      createdAt: now,
      updatedAt: now,
    })
    saveLists(lists)
  }
  return lists
}

/**
 * Remove a list by id.
 * Returns the updated lists.
 */
export async function removeList(listId: number): Promise<SavedList[]> {
  await delay(SIMULATED_DELAY)
  const lists = loadLists().filter((list) => list.listId !== listId)
  saveLists(lists)
  return lists
}

/**
 * Rename an existing list.
 * No-op if listId doesn't exist or newName is already taken.
 * Returns the updated lists.
 */
export async function renameList(
  listId: number,
  newName: string,
): Promise<SavedList[]> {
  await delay(SIMULATED_DELAY)
  const lists = loadLists()
  const target = lists.find((list) => list.listId === listId)
  const nameConflict = lists.some((list) => list.name === newName)
  if (target && !nameConflict) {
    target.name = newName
    target.updatedAt = new Date().toISOString()
    saveLists(lists)
  }
  return lists
}

/**
 * Toggle a location in/out of a list identified by listId.
 * Adds the locationId if absent; removes it if present.
 * Returns the updated lists.
 */
export async function toggleLocationInList(
  listId: number,
  locationId: string | number,
): Promise<SavedList[]> {
  await delay(SIMULATED_DELAY)
  const lists = loadLists()
  const list = lists.find((l) => l.listId === listId)
  if (list) {
    const index = list.locationIds.indexOf(locationId)
    if (index === -1) {
      list.locationIds.push(locationId)
    } else {
      list.locationIds.splice(index, 1)
    }
    list.updatedAt = new Date().toISOString()
    saveLists(lists)
  }
  return lists
}

/**
 * Add a location to a list identified by listId.
 * No-op if already present.
 * Returns the updated lists.
 */
export async function addLocationToList(
  listId: number,
  locationId: string | number,
): Promise<SavedList[]> {
  await delay(SIMULATED_DELAY)
  const lists = loadLists()
  const list = lists.find((l) => l.listId === listId)
  if (list && !list.locationIds.includes(locationId)) {
    list.locationIds.push(locationId)
    list.updatedAt = new Date().toISOString()
    saveLists(lists)
  }
  return lists
}

/**
 * Remove a location from a list identified by listId.
 * Returns the updated lists.
 */
export async function removeLocationFromList(
  listId: number,
  locationId: string | number,
): Promise<SavedList[]> {
  await delay(SIMULATED_DELAY)
  const lists = loadLists()
  const list = lists.find((l) => l.listId === listId)
  if (list) {
    list.locationIds = list.locationIds.filter((id) => id !== locationId)
    list.updatedAt = new Date().toISOString()
    saveLists(lists)
  }
  return lists
}

/**
 * Remove a location from every list.
 * Returns the updated lists.
 */
export async function removeLocationFromAllLists(
  locationId: string | number,
): Promise<SavedList[]> {
  await delay(SIMULATED_DELAY)
  const lists = loadLists()
  const now = new Date().toISOString()
  lists.forEach((list) => {
    list.locationIds = list.locationIds.filter((id) => id !== locationId)
    list.updatedAt = now
  })
  saveLists(lists)
  return lists
}
