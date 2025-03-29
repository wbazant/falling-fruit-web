/**
 * Utility for encoding and decoding type IDs in share URLs
 * Optimizes URL length by using 'all' when all types are selected
 */
export class TypeShareEncoder {
  constructor(allTypes) {
    this.allTypes = allTypes
    this.allTypeIds = allTypes.map((type) => type.id)
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
      return false
    }

    // Check if every type ID from allTypeIds is in typeIds
    return this.allTypeIds.every((id) => typeIds.includes(id))
  }
}

export default TypeShareEncoder
