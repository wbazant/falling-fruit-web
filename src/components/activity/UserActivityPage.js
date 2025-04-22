import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useDispatch, useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'
import styled from 'styled-components'

import {
  getUserActivity,
  setLastBrowsedSection,
} from '../../redux/activitySlice'
import { calculateTypeCountsFromChanges } from '../../utils/activityTypeCounts'
import { transformActivityData } from '../../utils/transformActivityData'
import FilterButtons from '../filter/FilterButtons'
import Button from '../ui/Button'
import { InfoPage } from '../ui/PageTemplate'
import ChangesPeriod from './ChangesPeriod'
import SkeletonLoader from './SkeletonLoader'

const TypeFilterContainer = styled.div`
  margin-top: 20px;
`

const TypeFilterTitle = styled.h4`
  margin-bottom: 10px;
`

const TypeFiltersContainer = styled.div`
  margin-top: 0.5em;
  margin-bottom: 0.5em;
  /* Provide vertical space when buttons wrap over multiple lines */
  line-height: 1.5rem;
`

const TypeTagsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 10px;
`

const TypeTag = styled.button`
  display: inline-flex;
  align-items: center;
  padding: 6px 12px;
  border-radius: 16px;
  font-size: 0.9rem;
  cursor: pointer;
  border: 1px solid ${({ theme }) => theme.secondaryBackground};
  background-color: ${({ $selected, theme }) =>
    $selected ? theme.transparentBlue : theme.background};
  color: ${({ theme }) => theme.secondaryText};

  &:hover {
    background-color: ${({ $selected, theme }) =>
      $selected ? theme.transparentBlue : theme.secondaryBackground};
  }

  .count {
    margin-left: 6px;
    font-size: 0.8rem;
    background: ${({ theme }) => theme.secondaryBackground};
    border-radius: 10px;
    padding: 2px 6px;
  }
`

const ShowMoreButton = styled(Button)`
  height: 22px;
  padding: 2px 4px;
  color: ${({ theme }) => theme.tertiaryText};
  border: 2px solid ${({ theme }) => theme.tertiaryText};
  margin-left: 5px;

  &:not(:disabled):hover {
    background-color: ${({ theme }) => theme.tertiaryText};
    border-color: ${({ theme }) => theme.tertiaryText};
  }
`

const TypeFilterTags = ({
  typesAccess,
  countsById,
  types,
  allTypes,
  onChange,
}) => {
  const { t } = useTranslation()
  const [visibleCount, setVisibleCount] = useState(5)

  // Sort types by count (largest first)
  const sortedTypes = Object.entries(countsById)
    .map(([id, count]) => ({
      id: Number(id),
      count,
      name: typesAccess.getType(id).commonName,
    }))
    .sort((a, b) => b.count - a.count)

  const toggleType = (typeId) => {
    if (types.includes(typeId)) {
      onChange(types.filter((id) => id !== typeId))
    } else {
      onChange([...types, typeId])
    }
  }

  const showMoreTags = () => {
    setVisibleCount((prev) => prev + 5)
  }

  const visibleTypes = sortedTypes.slice(0, visibleCount)
  const hasMoreToShow = visibleTypes.length < sortedTypes.length

  return (
    <TypeFilterContainer>
      <TypeFilterTitle>{t('pages.changes.type_distribution')}</TypeFilterTitle>
      <TypeFiltersContainer>
        <FilterButtons
          onSelectAllClick={() => {
            onChange(allTypes)
          }}
          onDeselectAllClick={() => {
            onChange([])
          }}
          isSelectAllDisabled={allTypes.every((typeId) =>
            types.includes(typeId),
          )}
          isDeselectAllDisabled={allTypes.every(
            (typeId) => !types.includes(typeId),
          )}
        />
      </TypeFiltersContainer>
      <TypeTagsContainer>
        {visibleTypes.map(({ id, count, name }) => (
          <TypeTag
            key={id}
            $selected={types.includes(id)}
            onClick={() => toggleType(id)}
          >
            {name}
            <span className="count">{count}</span>
          </TypeTag>
        ))}
        {hasMoreToShow && (
          <ShowMoreButton secondary onClick={showMoreTags}>
            {t('common.show_more')}
          </ShowMoreButton>
        )}
      </TypeTagsContainer>
    </TypeFilterContainer>
  )
}

const UserActivityDisplay = ({ changes, userId, typesAccess }) => {
  const { t, i18n } = useTranslation()

  // Move calculations and hooks before any conditional returns
  const typeCounts = changes ? calculateTypeCountsFromChanges(changes) : []
  const countsById = typeCounts.reduce((acc, { id, count }) => {
    acc[id] = count
    return acc
  }, {})
  const types = Object.keys(countsById).map(Number)
  const [selectedTypes, setSelectedTypes] = useState(types)

  // Count unique locations
  const uniqueLocations = changes
    ? new Set(changes.map((change) => change.location_id)).size
    : 0

  const filteredChanges = changes.filter((change) =>
    change.type_ids.some((typeId) => selectedTypes.includes(typeId)),
  )
  const uniqueFilteredLocations = filteredChanges
    ? new Set(changes.map((change) => change.location_id)).size
    : 0

  console.log('Activity stats:', {
    totalChanges: changes.length,
    filteredChanges: filteredChanges.length,
    uniqueLocations: uniqueLocations,
    uniqueFilteredLocations,
  })

  return (
    <>
      <div className="activity-stats">
        <h3>{t('glossary.locations.other')}</h3>
        {Object.keys(countsById).length > 0 && !typesAccess.isEmpty && (
          <TypeFilterTags
            typesAccess={typesAccess}
            countsById={countsById}
            types={selectedTypes}
            allTypes={types}
            onChange={setSelectedTypes}
          />
        )}
      </div>
      {transformActivityData(
        filteredChanges,
        typesAccess,
        t,
        i18n.language,
      ).map((period) => (
        <ChangesPeriod
          key={period.formattedDate}
          period={period}
          userId={userId}
        />
      ))}
    </>
  )
}

const UserActivityPage = () => {
  const dispatch = useDispatch()
  let { userId } = useParams()
  userId = parseInt(userId)

  const { changesByUser, lastBrowsedSection } = useSelector(
    (state) => state.activity,
  )
  const changes = changesByUser[userId]

  const { t } = useTranslation()

  const { typesAccess } = useSelector((state) => state.type)

  const changesReady = !typesAccess.isEmpty

  useEffect(() => {
    if (lastBrowsedSection.id) {
      const periodElement = document.getElementById(`${lastBrowsedSection.id}`)
      if (periodElement && lastBrowsedSection.userId === userId) {
        periodElement.scrollIntoView()
      }
      dispatch(setLastBrowsedSection({ id: null, userId: null }))
    }
  }, [lastBrowsedSection, dispatch, userId])

  useEffect(() => {
    if (changesReady) {
      dispatch(getUserActivity(userId))
    }
  }, [dispatch, changesReady, userId])

  return (
    <InfoPage>
      <h1>{t('pages.changes.recent_changes')}</h1>
      {changes !== undefined && (
        <UserActivityDisplay
          changes={changes}
          userId={userId}
          typesAccess={typesAccess}
        />
      )}
      {changes === undefined && <SkeletonLoader count={5} />}
    </InfoPage>
  )
}

export default UserActivityPage
