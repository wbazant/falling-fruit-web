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

    // Handle special cases first
    if (encodedTypes === 'all') {
      return [...this.allTypeIds]
    } else if (encodedTypes === 'default') {
      return this.getDefaultTypeIds()
    }

    let result = []
    let state = 'initial'
    let currentToken = ''
    let i = 0

    // Initialize state based on prefix
    if (encodedTypes.startsWith('all-')) {
      state = 'remove'
      result = [...this.allTypeIds]
      i = 4 // Skip 'all-'
    } else if (encodedTypes.startsWith('default-')) {
      state = 'remove'
      result = [...this.getDefaultTypeIds()]
      i = 8 // Skip 'default-'
    } else if (encodedTypes.startsWith('default.')) {
      state = 'add'
      result = [...this.getDefaultTypeIds()]
      i = 8 // Skip 'default.'
    } else if (encodedTypes.startsWith('default')) {
      return this.getDefaultTypeIds()
    } else {
      state = 'add'
    }

    // Process one character at a time
    while (i < encodedTypes.length) {
      const char = encodedTypes[i]

      if (char === '.' || char === '-') {
        // Process the current token when we hit a delimiter
        if (currentToken) {
          const id = parseInt(currentToken, 10)

          if (state === 'add') {
            result.push(id)
          } else if (state === 'remove') {
            result = result.filter((typeId) => typeId !== id)
          }

          currentToken = ''
        }

        // Change state if we hit a minus sign
        if (char === '-') {
          state = 'remove'
        }
      } else {
        // Build the current token
        currentToken += char
      }

      i++
    }

    // Process the final token if there is one
    if (currentToken) {
      const id = parseInt(currentToken, 10)

      if (state === 'add') {
        result.push(id)
      } else if (state === 'remove') {
        result = result.filter((typeId) => typeId !== id)
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
