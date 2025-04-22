/**
 * Calculates type counts from location changes
 *
 * @param {Array} locationChanges - Array of LocationChange objects
 * @returns {Array} Array of objects with id and count properties
 */
export function calculateTypeCountsFromChanges(locationChanges) {
  // Group changes by location_id
  const locationGroups = {}

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
  const typeCounts = {}

  // For each location, add its types to the count
  Object.values(locationGroups).forEach((typeIdSet) => {
    typeIdSet.forEach((typeId) => {
      if (!typeCounts[typeId]) {
        typeCounts[typeId] = 0
      }
      typeCounts[typeId]++
    })
  })

  // Convert to array of {id, count} objects
  return Object.entries(typeCounts).map(([id, count]) => ({
    id: Number(id),
    count,
  }))
}

/**
 * Calculates city counts from location changes
 *
 * @param {Array} locationChanges - Array of LocationChange objects
 * @returns {Array} Array of objects with city, state, country and count properties
 */
export function calculateCityCountsFromChanges(locationChanges) {
  // Group changes by location_id to avoid counting the same location multiple times
  const locationGroups = {}

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
  const locationCounts = {}

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
