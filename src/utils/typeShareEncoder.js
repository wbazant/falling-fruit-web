/**
 * Utility for encoding and decoding type IDs in share URLs
 * Optimizes URL length by using 'all' when all types are selected
 */
class TypeShareEncoder {
  constructor(typesAccess) {
    this.typesAccess = typesAccess
    this.allTypeIds = typesAccess.selectableTypes().map((type) => type.id)
  }

  /**
   * Encodes type IDs for URL sharing
   * @param {number[]} typeIds - Array of type IDs
   * @returns {string} Encoded string ('all' or comma-separated IDs)
   */
  encode(typeIds) {
    if (!typeIds || typeIds.length === 0) {
      return ''
    }

    // Check if all types are selected
    if (this.isAllTypesSelected(typeIds)) {
      return 'all'
    }

    return typeIds.join(',')
  }

  /**
   * Decodes type string from URL to array of type IDs
   * @param {string} encodedTypes - Encoded string ('all' or comma-separated IDs)
   * @returns {number[]} Array of type IDs
   */
  decode(encodedTypes) {
    if (!encodedTypes) {
      return []
    }

    if (encodedTypes === 'all') {
      return [...this.allTypeIds]
    }

    return encodedTypes.split(',').map((id) => parseInt(id, 10))
  }

  /**
   * Checks if the provided type IDs represent all available types
   * @param {number[]} typeIds - Array of type IDs to check
   * @returns {boolean} True if all types are selected
   */
  isAllTypesSelected(typeIds) {
    if (!typeIds || typeIds.length !== this.allTypeIds.length) {
      console.log('Not all types selected: length mismatch', {
        providedLength: typeIds ? typeIds.length : 0,
        allTypesLength: this.allTypeIds.length,
      })
      return false
    }

    // Find any missing type IDs for debugging
    const missingTypeIds = this.allTypeIds.filter((id) => !typeIds.includes(id))
    if (missingTypeIds.length > 0) {
      console.log('Not all types selected: missing type IDs', {
        missingTypeIds,
        providedTypeIds: typeIds,
        allTypeIds: this.allTypeIds,
      })
      return false
    }

    return true
  }
}

export default TypeShareEncoder
