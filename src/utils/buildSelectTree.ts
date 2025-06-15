import { LocalizedType, TypesAccess } from './localizedTypes'

interface RenderTreeNode {
  id: number
  parent: RenderTreeNode | null
  value?: number
  commonName: string
  scientificName: string
  count: number
  searchLabel: string
  children: RenderTreeNode[]
  isSelected: boolean
  isIndeterminate: boolean
  isDisabled: boolean
}

class SelectTreeBuilder {
  private typesAccess: TypesAccess
  private countsById: { [key: number]: number }
  private showOnlyOnMap: boolean
  private typeSearch: number[]
  private selectedTypes: number[]
  private visibleTypeIds: Set<number>

  constructor(
    typesAccess: TypesAccess,
    countsById: { [key: number]: number },
    showOnlyOnMap: boolean,
    typeSearch: number[],
    selectedTypes: number[],
  ) {
    this.typesAccess = typesAccess
    this.countsById = countsById
    this.showOnlyOnMap = showOnlyOnMap
    this.typeSearch = typeSearch
    this.selectedTypes = selectedTypes
    this.visibleTypeIds = new Set()
  }

  buildRenderTree(): RenderTreeNode[] {
    const rootNodes = this.typesAccess.localizedTypes.filter(
      (type) => type.parentId === 0,
    )
    return rootNodes
      .map((node) => this.buildNode(node, null, false))
      .filter((node): node is RenderTreeNode => node !== null)
  }

  private buildNode(
    type: LocalizedType,
    parent: RenderTreeNode | null = null,
    parentMatchesTypeSearch: boolean = false,
  ): RenderTreeNode | null {
    const count = this.getAggregatedCount(type.id)
    if (this.showOnlyOnMap && count === 0) {
      return null
    }
    const searchLabel = `${type.commonName} ${type.scientificName}`.trim()
    const matchesTypeSearch =
      this.typeSearch.length === 0 || this.typeSearch.includes(type.id)

    const node: RenderTreeNode = {
      id: type.id,
      parent,
      commonName: type.commonName,
      scientificName: type.scientificName,
      count,
      searchLabel,
      children: [],
      isSelected: this.selectedTypes.includes(type.id),
      isIndeterminate: false,
      isDisabled:
        this.typeSearch.length > 0 &&
        !matchesTypeSearch &&
        !parentMatchesTypeSearch,
    }

    const children = (this.typesAccess.childrenById[type.id] || [])
      .map((childId) =>
        this.buildNode(
          this.typesAccess.getType(childId),
          node,
          matchesTypeSearch,
        ),
      )
      .filter((child): child is RenderTreeNode => child !== null)

    if (
      !matchesTypeSearch &&
      !parentMatchesTypeSearch &&
      children.length === 0
    ) {
      return null
    }

    if (!node.isDisabled) {
      this.visibleTypeIds.add(type.id)
    }

    node.children = children
    if (
      type.cultivar &&
      parent?.scientificName &&
      type.scientificName
        .toLowerCase()
        .startsWith(parent.scientificName.toLowerCase())
    ) {
      node.commonName = ''
      node.scientificName = `'${type.cultivar}'`
    } else {
      node.commonName = type.commonName
      node.scientificName = type.scientificName
    }

    const ownCount = this.getCount(type.id)
    if (
      children.length &&
      (ownCount > 0 ||
        (!this.showOnlyOnMap && this.typesAccess.isSelectable(type.id))) &&
      matchesTypeSearch
    ) {
      const childNode: RenderTreeNode = {
        ...node,
        id: -type.id, // Use negative ID to ensure uniqueness
        parent: node,
        count: ownCount,
        value: type.id,
        children: [],
        isSelected: this.selectedTypes.includes(type.id),
        isIndeterminate: false,
        isDisabled: !matchesTypeSearch,
      }
      node.children.unshift(childNode)
    } else if (children.length === 0) {
      node.value = type.id
    }

    // Calculate isSelected and isIndeterminate
    if (node.children.length > 0) {
      const allChildrenSelected = node.children.every(
        (child) => child.isSelected,
      )
      const someChildrenSelected = node.children.some(
        (child) => child.isSelected || child.isIndeterminate,
      )
      node.isSelected = allChildrenSelected
      node.isIndeterminate = !allChildrenSelected && someChildrenSelected
    }
    return node
  }

  private getCount(id: number): number {
    return this.countsById[id] || 0
  }

  private getAggregatedCount(id: number): number {
    let count = this.getCount(id)
    const children = this.typesAccess.childrenById[id] || []
    for (const childId of children) {
      count += this.getAggregatedCount(childId)
    }
    return count
  }

  getVisibleTypes(): number[] {
    return Array.from(this.visibleTypeIds)
  }
}

interface SelectTreeResult {
  tree: RenderTreeNode[]
  visibleTypeIds: number[]
}

function buildSelectTree(
  typesAccess: TypesAccess,
  countsById: { [key: number]: number },
  showOnlyOnMap: boolean,
  typeSearch: number[],
  selectedTypes: number[],
): SelectTreeResult {
  const builder = new SelectTreeBuilder(
    typesAccess,
    countsById,
    showOnlyOnMap,
    typeSearch,
    selectedTypes,
  )
  const tree = builder.buildRenderTree()
  const visibleTypeIds = builder.getVisibleTypes()
  return { tree, visibleTypeIds }
}

export default buildSelectTree
