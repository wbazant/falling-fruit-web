/**
 * Calculates type counts from location changes
 *
 * @param locationChanges - Array of LocationChange objects
 * @param typesAccess - TypesAccess object to get type names
 * @returns Object with type IDs as keys and count as values
 */
export function calculateTypeCountsFromChanges(
  locationChanges: any[],
  typesAccess: any,
): Record<number, number> {
  // Group changes by location_id
  const locationGroups: Record<string, Set<number>> = {}

  // Process each change to build location groups
  locationChanges.forEach((change) => {
    if (!locationGroups[change.location_id]) {
      locationGroups[change.location_id] = new Set()
    }

    for (const type_id of change.type_ids) {
      locationGroups[change.location_id].add(type_id)
    }
  })

  // Count occurrences of each type_id across all location sets
  const typeIdCounts: Record<number, number> = {}

  // For each location, add its types to the count
  Object.values(locationGroups).forEach((typeIdSet) => {
    typeIdSet.forEach((typeId) => {
      if (!typeIdCounts[typeId]) {
        typeIdCounts[typeId] = 0
      }
      typeIdCounts[typeId]++
    })
  })

  // Aggregate by common name (or scientific name if no common name)
  const typeNameCounts: Record<string, number> = {}
  const typeNameToIds: Record<string, number> = {}

  Object.entries(typeIdCounts).forEach(([id, count]) => {
    const numId = Number(id)
    const type = typesAccess.getType(numId)

    if (!type) {
      return
    }

    // Use common name if available, otherwise use scientific name
    const name = type.commonName || type.scientificName || `Type ${numId}`

    if (!typeNameCounts[name]) {
      typeNameCounts[name] = 0
      typeNameToIds[name] = numId // Store the first ID we find for this name
    }

    typeNameCounts[name] += count
  })

  // Convert back to ID-based counts, but with aggregated values
  const aggregatedTypeCounts: Record<number, number> = {}

  Object.entries(typeNameCounts).forEach(([name, count]) => {
    const id = typeNameToIds[name]
    aggregatedTypeCounts[id] = count
  })

  return aggregatedTypeCounts
}

interface CityCount {
  city: string
  state: string
  country: string
  count: number
}

/**
 * Calculates city counts from location changes
 *
 * @param locationChanges - Array of LocationChange objects
 * @returns Array of objects with city, state, country and count properties
 */
export function calculateCityCountsFromChanges(
  locationChanges: any[],
): CityCount[] {
  // Group changes by location_id to avoid counting the same location multiple times
  const locationGroups: Record<
    string,
    { city: string; state: string; country: string }
  > = {}

  // Process each change to build location groups
  locationChanges.forEach((change) => {
    // Skip locations without cities
    if (!change.city) {
      return
    }

    // Store the city, state, and country for this location
    locationGroups[change.location_id] = {
      city: change.city,
      state: change.state || '',
      country: change.country || '',
    }
  })

  // Count occurrences of each city+state+country combination
  const locationCounts: Record<string, CityCount> = {}

  // For each location, add its city to the count
  Object.values(locationGroups).forEach((location) => {
    const key = `${location.city}|${location.state}|${location.country}`
    if (!locationCounts[key]) {
      locationCounts[key] = {
        city: location.city,
        state: location.state,
        country: location.country,
        count: 0,
      }
    }
    locationCounts[key].count++
  })

  // Convert to array of location objects with counts
  return Object.values(locationCounts)
}
