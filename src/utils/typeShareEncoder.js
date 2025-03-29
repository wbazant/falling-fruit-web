/**
 * Utility for encoding and decoding type IDs in share URLs
 * Optimizes URL length by using 'all' when all types are selected
 * or 'default' for default selection
 */
class TypeShareEncoder {
  constructor(typesAccess) {
    this.typesAccess = typesAccess
    this.allTypeIds = typesAccess.selectableTypes().map((type) => type.id)
  }

  /**
   * Encodes type IDs for URL sharing
   * @param {number[]} typeIds - Array of type IDs
   * @returns {string} Encoded string ('all', 'default', 'default_id1,id2,...', 'default_id1,id2,...-id3,id4,...', 'all-id1,id2,...', or comma-separated IDs)
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
      if (removedDefaultTypeIds.length > 0) {
        return `default_${additionalTypeIds.join('.')}-${removedDefaultTypeIds.join('.')}`
      } else if (additionalTypeIds.length > 0) {
        return `default_${additionalTypeIds.join('.')}`
      }
    }

    // Check if default selection
    if (this.isDefaultSelection(typeIds)) {
      return 'default'
    }

    return typeIds.join('.')
  }

  /**
   * Decodes type string from URL to array of type IDs
   * @param {string} encodedTypes - Encoded string ('all', 'default', 'default_id1,id2,...', 'default_id1,id2,...-id3,id4,...', 'all-id1,id2,...', or comma-separated IDs)
   * @returns {number[]} Array of type IDs
   */
  decode(encodedTypes) {
    if (!encodedTypes) {
      return []
    }

    if (encodedTypes === 'all') {
      return [...this.allTypeIds]
    }

    if (encodedTypes === 'default') {
      return this.getDefaultTypeIds()
    }

    // Handle "default_id1,id2,..." and "default_id1,id2,...-id3,id4,..." formats
    if (encodedTypes.startsWith('default_')) {
      const defaultTypeIds = this.getDefaultTypeIds()
      let additionalIds = []
      let removedIds = []

      // Check if there's a minus part
      if (encodedTypes.includes('-')) {
        const [addPart, removePart] = encodedTypes.substring(8).split('-')
        additionalIds = addPart.split('.').map((id) => parseInt(id, 10))
        removedIds = removePart.split('.').map((id) => parseInt(id, 10))
      } else {
        additionalIds = encodedTypes
          .substring(8)
          .split('.')
          .map((id) => parseInt(id, 10))
      }

      // Start with default types, add additional types, remove specified types
      return [
        ...defaultTypeIds.filter((id) => !removedIds.includes(id)),
        ...additionalIds,
      ]
    }

    // Handle "all-id1,id2,..." format (all except specified IDs)
    if (encodedTypes.startsWith('all-')) {
      const excludedIds = encodedTypes
        .substring(4)
        .split('.')
        .map((id) => parseInt(id, 10))
      return this.allTypeIds.filter((id) => !excludedIds.includes(id))
    }

    return encodedTypes.split('.').map((id) => parseInt(id, 10))
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
   * @param {number[]} typeIds - Array of type IDs to check
   * @returns {boolean} True if default selection plus additional types
   */
  isDefaultPlusAdditional(typeIds) {
    const defaultTypeIds = this.getDefaultTypeIds()

    // Check if all default types are included
    return defaultTypeIds.every((id) => typeIds.includes(id))
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
