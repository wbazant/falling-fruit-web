import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useDispatch, useSelector } from 'react-redux'
import { Link,useParams } from 'react-router-dom'
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
import { InfoPage } from '../ui/PageTemplate'
import ActivitySearchInput from './ActivitySearchInput'
import ChangesPeriod from './ChangesPeriod'
import SkeletonLoader from './SkeletonLoader'

const AuthorLink = styled(Link)`
  color: ${({ theme }) => theme.blue} !important;
`

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

  // Get the user name from the first change's author field
  const userName = changes.length > 0 ? changes[0].author : ''

  return (
    <>
      {userName && (
        <h2>
          User: <AuthorLink to={`/profiles/${userId}`}>{userName}</AuthorLink>
        </h2>
      )}
      <div className="activity-stats">
        <h3>{t('glossary.locations.other')}</h3>
        <ActivitySearchInput
          value={searchTerm}
          onChange={setSearchTerm}
          onClear={() => setSearchTerm('')}
          typesAccess={typesAccess}
          typeCountsById={typeCountsById}
          cityCounts={cityCounts}
        />
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
