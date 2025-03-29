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
   * @returns {string} Encoded string ('all', 'default', or comma-separated IDs)
   */
  encode(typeIds) {
    if (!typeIds || typeIds.length === 0) {
      return ''
    }

    // Check if all types are selected
    if (this.isAllTypesSelected(typeIds)) {
      return 'all'
    }

    // Check if default selection
    if (this.isDefaultSelection(typeIds)) {
      return 'default'
    }

    return typeIds.join(',')
  }

  /**
   * Decodes type string from URL to array of type IDs
   * @param {string} encodedTypes - Encoded string ('all', 'default', or comma-separated IDs)
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
    // This would typically come from a configuration or be determined by business logic
    // For now, returning an empty array as placeholder
    return []
  }
}

export default TypeShareEncoder
