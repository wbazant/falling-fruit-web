import { components } from './apiSchema'
import { TypesAccess } from './localizedTypes'

export interface ActivityRow {
  date: string
  action: 'added' | 'edited' | 'visited'
  locationId: number
  typeIds: number[]
  types: Array<{ commonName?: string; scientificName?: string }>
  coordinates: {
    latitude: number
    longitude: number
  }
  location: {
    city: string | null
    state: string | null
    country: string | null
    coordinatesGrid: string
  }
}

/**
 * Transforms activity data for a single user into a flat list of activity rows
 * with deduplication logic applied (if a location was added and then reviewed,
 * only the 'added' action is included)
 *
 * @param changes List of location changes for a single user
 * @param typesAccess Access to type information for enrichment
 * @returns Array of activity rows sorted by date (newest first)
 */
export function transformActivityDataForOneUserIntoRowFormat(
  changes: components['schemas']['LocationChange'][],
  typesAccess: TypesAccess,
): ActivityRow[] {
  // Group changes by date and location
  const changesByDateAndLocation = new Map<
    string,
    Map<number, components['schemas']['LocationChange'][]>
  >()

  // First, organize all changes by date and location ID
  changes.forEach((change) => {
    const date = change.created_at.split('T')[0]

    if (!changesByDateAndLocation.has(date)) {
      changesByDateAndLocation.set(date, new Map())
    }

    const locationsForDate = changesByDateAndLocation.get(date)!

    if (!locationsForDate.has(change.location_id)) {
      locationsForDate.set(change.location_id, [])
    }

    locationsForDate.get(change.location_id)!.push(change)
  })

  const result: ActivityRow[] = []

  // Process each date
  for (const [date, locationsMap] of changesByDateAndLocation) {
    // Process each location for this date
    for (const [locationId, locationChanges] of locationsMap) {
      // Check if this location was added on this date
      const wasAdded = locationChanges.some((c) => c.description === 'added')

      // Check if this location was edited on this date
      const wasEdited = locationChanges.some((c) => c.description === 'edited')

      // Get the most recent change for this location on this date
      const mostRecentChange = locationChanges.reduce((latest, current) => new Date(current.created_at) > new Date(latest.created_at)
          ? current
          : latest, locationChanges[0])

      // Enrich with type information
      const types = mostRecentChange.type_ids.map((typeId) => {
        const type = typesAccess.getType(typeId)
        return {
          commonName: type?.commonName,
          scientificName: type?.scientificName,
        }
      })

      // Create the location information
      const locationInfo = {
        city: mostRecentChange.city,
        state: mostRecentChange.state,
        country: mostRecentChange.country,
        coordinatesGrid: `${mostRecentChange.lat.toFixed(4)},${mostRecentChange.lng.toFixed(4)}`,
      }

      // Apply deduplication logic:
      // If location was added, only include the 'added' action
      // If location was edited but not added, include the 'edited' action
      // If location was only visited (not added or edited), include the 'visited' action

      if (wasAdded) {
        // Find the 'added' change
        const addedChange = locationChanges.find(
          (c) => c.description === 'added',
        )!

        result.push({
          date,
          action: 'added',
          locationId,
          typeIds: addedChange.type_ids,
          types,
          coordinates: {
            latitude: addedChange.lat,
            longitude: addedChange.lng,
          },
          location: locationInfo,
        })
      } else if (wasEdited) {
        // Find the most recent 'edited' change
        const editedChanges = locationChanges.filter(
          (c) => c.description === 'edited',
        )
        const mostRecentEdit = editedChanges.reduce((latest, current) => new Date(current.created_at) > new Date(latest.created_at)
            ? current
            : latest, editedChanges[0])

        result.push({
          date,
          action: 'edited',
          locationId,
          typeIds: mostRecentEdit.type_ids,
          types,
          coordinates: {
            latitude: mostRecentEdit.lat,
            longitude: mostRecentEdit.lng,
          },
          location: locationInfo,
        })
      } else {
        // This must be a 'visited' change
        const visitedChange = locationChanges.find(
          (c) => c.description === 'visited',
        )!

        result.push({
          date,
          action: 'visited',
          locationId,
          typeIds: visitedChange.type_ids,
          types,
          coordinates: {
            latitude: visitedChange.lat,
            longitude: visitedChange.lng,
          },
          location: locationInfo,
        })
      }
    }
  }

  // Sort by date (newest first)
  return result.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  )
}
