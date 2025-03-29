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

    let remaining = encodedTypes
    let result = []
    let state = 'initial'

    // Process the string incrementally, changing state as we go
    while (remaining.length > 0) {
      if (state === 'initial') {
        if (remaining === 'all') {
          return [...this.allTypeIds]
        } else if (remaining === 'default') {
          return this.getDefaultTypeIds()
        } else if (remaining.startsWith('all-')) {
          // All types except excluded ones
          state = 'exclude'
          remaining = remaining.substring(4)
          result = [...this.allTypeIds]
        } else if (remaining.startsWith('default-')) {
          // Default types minus some
          state = 'remove'
          remaining = remaining.substring(8)
          result = [...this.getDefaultTypeIds()]
        } else if (remaining.startsWith('default.')) {
          // Default types plus additional
          state = 'add'
          remaining = remaining.substring(8)
          result = [...this.getDefaultTypeIds()]
        } else if (remaining.startsWith('default')) {
          // Just default with nothing after
          return this.getDefaultTypeIds()
        } else {
          // Simple list of IDs
          state = 'list'
        }
      } else if (state === 'exclude') {
        // Process excluded IDs
        const excludedIds = remaining.split('.').map((id) => parseInt(id, 10))
        result = result.filter((id) => !excludedIds.includes(id))
        remaining = ''
      } else if (state === 'add') {
        // Process additional IDs, watching for minus sign
        if (remaining.includes('-')) {
          const [addPart, removePart] = remaining.split('-')

          // Add additional IDs
          if (addPart) {
            const additionalIds = addPart
              .split('.')
              .map((id) => parseInt(id, 10))
            result = [...result, ...additionalIds]
          }

          // Switch to remove state
          state = 'remove'
          remaining = removePart
        } else {
          // Just additional IDs
          const additionalIds = remaining
            .split('.')
            .map((id) => parseInt(id, 10))
          result = [...result, ...additionalIds]
          remaining = ''
        }
      } else if (state === 'remove') {
        // Process IDs to remove
        const removedIds = remaining.split('.').map((id) => parseInt(id, 10))
        result = result.filter((id) => !removedIds.includes(id))
        remaining = ''
      } else if (state === 'list') {
        // Simple list of IDs
        result = remaining.split('.').map((id) => parseInt(id, 10))
        remaining = ''
      }
    }

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
