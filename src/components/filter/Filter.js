import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useDispatch, useSelector } from 'react-redux'
import styled from 'styled-components/macro'

import { setShowOnlyOnMap, setTypeSearch } from '../../redux/filterSlice'
import { muniChanged, selectionChanged } from '../../redux/viewChange'
import buildSelectTree from '../../utils/buildSelectTree'
import { tokenizeQuery } from '../../utils/tokenize'
import { Select } from '../ui/Select'
import { TypeName } from '../ui/TypeName'
import FilterButtons from './FilterButtons'
import LabeledCheckbox from './LabeledCheckbox'
import RCTreeSelectSkeleton from './RCTreeSelectSkeleton'
import TreeSelect from './TreeSelect'

const EdibleTypeText = styled.p`
  font-size: 0.875rem;
  font-weight: bold;
  color: ${({ theme }) => theme.secondaryText};
  margin-block-start: 1.25em;
  margin-block-end: 0.5em;
  @media ${({ theme }) => theme.device.mobile} {
    margin-block-start: 0em;
  }
`

const TreeFiltersContainer = styled.div`
  margin-block: 0.5em;
  /* Provide vertical space when buttons wrap over multiple lines */
  line-height: 1.5rem;
`

const MuniCheckbox = styled.div`
  margin-block: 1em;
`

// Filter function for select options using tokenized search
const filterOption = (candidate, input) => {
  if (!input) {
    return true
  }

  const tokenizedInput = tokenizeQuery(input)
  const searchReference = candidate.data.searchReference

  return searchReference && searchReference.includes(tokenizedInput)
}

const Filter = () => {
  const dispatch = useDispatch()
  const { countsById, types, typeSearch, muni, showOnlyOnMap } = useSelector(
    (state) => state.filter,
  )

  const { typesAccess } = useSelector((state) => state.type)
  const typeOptions = useMemo(
    () => typesAccess.asMenuEntries(countsById),
    [typesAccess, countsById],
  )
  const { tree: selectTree, visibleTypeIds } = useMemo(
    () =>
      buildSelectTree(
        typesAccess,
        countsById,
        showOnlyOnMap,
        typeSearch || [],
        types,
      ),
    [typesAccess, countsById, showOnlyOnMap, typeSearch, types],
  )

  const { t } = useTranslation()
  return (
    <>
      <div>
        <EdibleTypeText>{t('glossary.type.other')}</EdibleTypeText>
        <Select
          options={typeOptions}
          value={typeSearch || []}
          onChange={(options) => dispatch(setTypeSearch(options || []))}
          placeholder={t('glossary.type.one')}
          isClearable
          isMulti
          isVirtualized
          formatOptionLabel={(option, { context }) => (
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                width: '100%',
              }}
            >
              <TypeName
                commonName={option.commonName}
                scientificName={option.scientificName}
                count={context === 'menu' ? option.count : undefined}
              />
            </div>
          )}
          filterOption={filterOption}
        />
        <TreeFiltersContainer>
          <LabeledCheckbox
            field="showOnlyOnMap"
            value={showOnlyOnMap}
            label={t('filter.only_on_map')}
            onChange={(checked) => dispatch(setShowOnlyOnMap(checked))}
            style={{ display: 'inline-block', marginInlineEnd: '5px' }}
          />
          <FilterButtons
            onSelectAllClick={() => {
              const newSelection = [...new Set([...types, ...visibleTypeIds])]
              dispatch(selectionChanged(newSelection))
            }}
            onDeselectAllClick={() => {
              const remainingSelection = types.filter(
                (typeId) => !visibleTypeIds.some((t) => t === typeId),
              )
              dispatch(selectionChanged(remainingSelection))
            }}
            isSelectAllDisabled={visibleTypeIds.every((typeId) =>
              types.includes(typeId),
            )}
            isDeselectAllDisabled={visibleTypeIds.every(
              (typeId) => !types.includes(typeId),
            )}
          />
        </TreeFiltersContainer>
        {typesAccess.isEmpty ? (
          <RCTreeSelectSkeleton />
        ) : (
          <TreeSelect
            types={types}
            onChange={(selectedTypes) =>
              dispatch(selectionChanged(selectedTypes))
            }
            selectTree={selectTree}
          />
        )}
      </div>

      <MuniCheckbox>
        <LabeledCheckbox
          field="muni"
          value={muni}
          label={t('glossary.tree_inventory.one', { count: 2 })}
          onChange={(checked) => dispatch(muniChanged(checked))}
        />
      </MuniCheckbox>
    </>
  )
}

export default Filter
