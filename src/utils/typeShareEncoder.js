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
   * @returns {string} Encoded string ('all', 'default', 'all-id1,id2,...', or comma-separated IDs)
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
      return `all-${unselectedTypeIds.join(',')}`
    }

    // Check if default selection
    if (this.isDefaultSelection(typeIds)) {
      return 'default'
    }

    return typeIds.join(',')
  }

  /**
   * Decodes type string from URL to array of type IDs
   * @param {string} encodedTypes - Encoded string ('all', 'default', 'all-id1,id2,...', or comma-separated IDs)
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

    // Handle "all-id1,id2,..." format (all except specified IDs)
    if (encodedTypes.startsWith('all-')) {
      const excludedIds = encodedTypes
        .substring(4)
        .split(',')
        .map((id) => parseInt(id, 10))
      return this.allTypeIds.filter((id) => !excludedIds.includes(id))
    }

    return encodedTypes.split(',').map((id) => parseInt(id, 10))
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
}

export default TypeShareEncoder
