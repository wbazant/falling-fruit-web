import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useDispatch, useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'
import styled from 'styled-components'

import {
  getUserActivity,
  setLastBrowsedSection,
} from '../../redux/activitySlice'
import {
  calculateCityCountsFromChanges,
  calculateTypeCountsFromChanges,
} from '../../utils/activityTypeCounts'
import { transformActivityData } from '../../utils/transformActivityData'
import Button from '../ui/Button'
import { InfoPage } from '../ui/PageTemplate'
import ActivitySearchInput from './ActivitySearchInput'
import ChangesPeriod from './ChangesPeriod'
import SkeletonLoader from './SkeletonLoader'

const FilterContainer = styled.div`
  margin-top: 20px;
`

const FilterTitle = styled.h4`
  margin-bottom: 10px;
`

const TagsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 10px;
`

const Tag = styled.button`
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

const CategoryLabel = styled.div`
  font-size: 0.85rem;
  color: ${({ theme }) => theme.tertiaryText};
  margin-top: 15px;
  margin-bottom: 5px;
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

const FilterTags = ({
  typesAccess,
  typeCountsById,
  cityCounts,
  searchTerm,
  onSearchChange,
}) => {
  const { t } = useTranslation()
  const [visibleTypeCount, setVisibleTypeCount] = useState(5)
  const [visibleCityCount, setVisibleCityCount] = useState(5)

  // Sort types by count (largest first)
  const sortedTypes = Object.entries(typeCountsById)
    .map(([id, count]) => ({
      id: Number(id),
      count,
      name: typesAccess.getType(id)?.commonName,
    }))
    .sort((a, b) => b.count - a.count)

  // Sort cities by count (largest first)
  const sortedCities = cityCounts.sort((a, b) => b.count - a.count)

  const showMoreTypes = () => {
    setVisibleTypeCount((prev) => prev + 5)
  }

  const showMoreCities = () => {
    setVisibleCityCount((prev) => prev + 5)
  }

  const visibleTypes = sortedTypes.slice(0, visibleTypeCount)
  const hasMoreTypesToShow = visibleTypes.length < sortedTypes.length

  const visibleCities = sortedCities.slice(0, visibleCityCount)
  const hasMoreCitiesToShow = visibleCities.length < sortedCities.length

  return (
    <FilterContainer>
      <FilterTitle>{t('pages.changes.type_distribution')}</FilterTitle>

      {visibleTypes.length > 0 && (
        <>
          <CategoryLabel>{t('glossary.types.other')}</CategoryLabel>
          <TagsContainer>
            {visibleTypes.map(({ id, count, name }) => (
              <Tag
                key={`type-${id}`}
                $selected={searchTerm.toLowerCase() === name.toLowerCase()}
                onClick={() => onSearchChange(name)}
              >
                {name}
                <span className="count">{count}</span>
              </Tag>
            ))}
            {hasMoreTypesToShow && (
              <ShowMoreButton secondary onClick={showMoreTypes}>
                {t('common.show_more')}
              </ShowMoreButton>
            )}
          </TagsContainer>
        </>
      )}

      {visibleCities.length > 0 && (
        <>
          <CategoryLabel>{t('glossary.cities.other')}</CategoryLabel>
          <TagsContainer>
            {visibleCities.map(({ name, count }) => (
              <Tag
                key={`city-${name}`}
                $selected={searchTerm.toLowerCase() === name.toLowerCase()}
                onClick={() => onSearchChange(name)}
              >
                {name}
                <span className="count">{count}</span>
              </Tag>
            ))}
            {hasMoreCitiesToShow && (
              <ShowMoreButton secondary onClick={showMoreCities}>
                {t('common.show_more')}
              </ShowMoreButton>
            )}
          </TagsContainer>
        </>
      )}

      <ActivitySearchInput
        value={searchTerm}
        onChange={onSearchChange}
        onClear={() => onSearchChange('')}
      />
    </FilterContainer>
  )
}

const UserActivityDisplay = ({ changes, userId, typesAccess }) => {
  const { t, i18n } = useTranslation()
  const [searchTerm, setSearchTerm] = useState('')

  // Move calculations and hooks before any conditional returns
  const typeCounts = changes ? calculateTypeCountsFromChanges(changes) : []
  const typeCountsById = typeCounts.reduce((acc, { id, count }) => {
    acc[id] = count
    return acc
  }, {})

  // Calculate city counts
  const cityCounts = changes ? calculateCityCountsFromChanges(changes) : []

  // Count unique locations
  const uniqueLocations = changes
    ? new Set(changes.map((change) => change.location_id)).size
    : 0

  // Filter changes based on search term
  const filteredChanges = changes.filter((change) => {
    // If no search term, show all changes
    if (!searchTerm) {
      return true
    }

    // Check if it matches location name or type name
    const searchLower = searchTerm.toLowerCase()

    // Check if location name matches
    const locationMatches =
      (change.city && change.city.toLowerCase().includes(searchLower)) ||
      (change.state && change.state.toLowerCase().includes(searchLower)) ||
      (change.country && change.country.toLowerCase().includes(searchLower))

    // Check if any type name matches
    const typeMatches = change.type_ids.some((typeId) => {
      const type = typesAccess.getType(typeId)
      return (
        type.commonName && type.commonName.toLowerCase().includes(searchLower)
      )
    })

    return locationMatches || typeMatches
  })
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
        {(Object.keys(typeCountsById).length > 0 || cityCounts.length > 0) &&
          !typesAccess.isEmpty && (
            <FilterTags
              typesAccess={typesAccess}
              typeCountsById={typeCountsById}
              cityCounts={cityCounts}
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
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
