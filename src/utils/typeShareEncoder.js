/**
 * Utility for encoding and decoding type IDs in share URLs
 * Optimizes URL length by using 'all' when all types are selected
 * or 'default' for default selection
 */
class TypeShareEncoder {
  constructor(typesAccess) {
    this.typesAccess = typesAccess
    this.allTypeIds = typesAccess.selectableTypes().map((type) => type.id)
    this.familiesByHeadId = this.buildFamiliesByHeadId()
  }

  /**
   * Builds a map of head type IDs to their complete family (descendants)
   * Only includes ultimate heads (types without parents)
   * @returns {Object} Map of head ID to array of descendant IDs
   */
  buildFamiliesByHeadId() {
    const familiesByHeadId = {}
    const rootTypes = this.typesAccess
      .selectableTypes()
      .filter((type) => type.parentId === 0)

    for (const rootType of rootTypes) {
      const familyIds = this.getCompleteFamily(rootType.id)
      familiesByHeadId[rootType.id] = familyIds
    }
    console.log({ rootTypes, abies: familiesByHeadId[2017] })

    return familiesByHeadId
  }

  /**
   * Gets all descendants of a type (complete family)
   * @param {number} typeId - The head type ID
   * @returns {number[]} Array of all descendant IDs including the head ID
   */
  getCompleteFamily(typeId) {
    const result = [typeId]
    const childrenIds = this.typesAccess.childrenById[typeId] || []

    for (const childId of childrenIds) {
      result.push(...this.getCompleteFamily(childId))
    }

    return result
  }

  /**
   * Logs all families that are completely included in the selection
   * @param {number[]} selectedTypeIds - Array of selected type IDs
   */
  logCompleteFamiliesInSelection(selectedTypeIds) {
    const completeFamilies = []
    console.log(selectedTypeIds)
    for (const selectedTypeId of selectedTypeIds) {
      console.log(this.typesAccess.getType(Number(selectedTypeId)))
    }

    for (const [headId, familyIds] of Object.entries(this.familiesByHeadId)) {
      if (familyIds.every((id) => selectedTypeIds.includes(Number(id)))) {
        completeFamilies.push({
          headId: Number(headId),
          headName: this.typesAccess.getCommonName(Number(headId)),
          familySize: familyIds.length,
        })
      }
    }

    console.log('Complete families in selection:', completeFamilies)
    return completeFamilies
  }

  /**
   * Encodes type IDs for URL sharing
   * @param {number[]} typeIds - Array of type IDs
   * @returns {string} Encoded string ('all', 'default', 'default.id1.id2...', 'default.id1.id2...-id3.id4...', 'all-id1.id2...', or dot-separated IDs)
   */
  encode(typeIds) {
    if (!typeIds || typeIds.length === 0) {
      return ''
    }

    // Check if all types are selected
    if (this.isAllTypesSelected(typeIds)) {
      return 'all'
    }

    // Check if it's "all except a few" (up to 20 unselected types)
    const unselectedTypeIds = this.getUnselectedTypeIds(typeIds)
    if (unselectedTypeIds.length > 0 && unselectedTypeIds.length <= 20) {
      return `all-${unselectedTypeIds.join('.')}`
    }

    // Check if it's default plus additional types, possibly minus some default types
    const defaultTypeIds = this.getDefaultTypeIds()
    const additionalTypeIds = typeIds.filter(
      (id) => !defaultTypeIds.includes(id),
    )
    const removedDefaultTypeIds = defaultTypeIds.filter(
      (id) => !typeIds.includes(id),
    )

    if (this.isDefaultPlusMinusFormat(typeIds)) {
      let result = 'default'

      if (additionalTypeIds.length > 0) {
        result += `.${additionalTypeIds.join('.')}`
      }

      if (removedDefaultTypeIds.length > 0) {
        result += `-${removedDefaultTypeIds.join('.')}`
      }

      return result
    }

    // Check if default selection
    if (this.isDefaultSelection(typeIds)) {
      return 'default'
    }

    return typeIds.join('.')
  }

  /**
   * Decodes type string from URL to array of type IDs
   * @param {string} encodedTypes - Encoded string ('all', 'default', 'default.id1.id2...', 'default.id1.id2...-id3.id4...', 'all-id1.id2...', or dot-separated IDs)
   * @returns {number[]} Array of type IDs
   */
  decode(encodedTypes) {
    if (!encodedTypes) {
      return []
    }

    let state = 'add'
    let currentToken = ''
    let result
    let i
    if (encodedTypes.startsWith('all')) {
      result = [...this.allTypeIds]
      i = 3
    } else if (encodedTypes.startsWith('default')) {
      result = [...this.getDefaultTypeIds()]
      i = 7
    } else {
      result = []
      i = 0
    }

    const processToken = () => {
      if (currentToken) {
        const id = parseInt(currentToken, 10)
        if (state === 'add') {
          result.push(id)
        } else if (state === 'remove') {
          result = result.filter((typeId) => typeId !== id)
        }
        currentToken = ''
      }
    }

    while (i < encodedTypes.length) {
      const char = encodedTypes[i]
      if (char === '.') {
        processToken()
      } else if (char === '-') {
        processToken()
        state = 'remove'
      } else {
        currentToken += char
      }
      i++
    }
    processToken()

    // Log complete families in the selection
    this.logCompleteFamiliesInSelection(result)

    return result
  }

  /**
   * Checks if the provided type IDs represent all available types
   * @param {number[]} typeIds - Array of type IDs to check
   * @returns {boolean} True if all types are selected
   */
  isAllTypesSelected(typeIds) {
    // Find any missing type IDs for debugging
    const missingTypeIds = this.allTypeIds.filter((id) => !typeIds.includes(id))
    if (missingTypeIds.length > 0) {
      return false
    }

    return true
  }

  /**
   * Checks if the provided type IDs represent the default selection
   * @param {number[]} typeIds - Array of type IDs to check
   * @returns {boolean} True if default selection
   */
  isDefaultSelection(typeIds) {
    const defaultTypeIds = this.getDefaultTypeIds()

    // Check if arrays have the same length
    if (typeIds.length !== defaultTypeIds.length) {
      return false
    }

    // Check if all default types are included
    return defaultTypeIds.every((id) => typeIds.includes(id))
  }

  /**
   * Returns the default type IDs
   * @returns {number[]} Array of default type IDs
   */
  getDefaultTypeIds() {
    // Duplicate logic from fetchAndLocalizeTypes.fulfilled in filterSlice.js
    return this.typesAccess
      .selectableTypesWithCategories('forager', 'freegan')
      .map((t) => t.id)
  }

  /**
   * Returns type IDs that are not selected
   * @param {number[]} selectedTypeIds - Array of selected type IDs
   * @returns {number[]} Array of unselected type IDs
   */
  getUnselectedTypeIds(selectedTypeIds) {
    return this.allTypeIds.filter((id) => !selectedTypeIds.includes(id))
  }

  /**
   * Checks if the provided type IDs represent default selection plus additional types
   * and/or minus some default types
   * @param {number[]} typeIds - Array of type IDs to check
   * @returns {boolean} True if default plus/minus format is appropriate
   */
  isDefaultPlusMinusFormat(typeIds) {
    const defaultTypeIds = this.getDefaultTypeIds()
    const additionalTypeIds = typeIds.filter(
      (id) => !defaultTypeIds.includes(id),
    )
    const removedDefaultTypeIds = defaultTypeIds.filter(
      (id) => !typeIds.includes(id),
    )

    // Use this format if there are additional types or some default types are removed
    // but not if too many changes (in which case direct listing might be more efficient)
    return (
      (additionalTypeIds.length > 0 || removedDefaultTypeIds.length > 0) &&
      additionalTypeIds.length + removedDefaultTypeIds.length <= 20
    )
  }
}

export default TypeShareEncoder
