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
