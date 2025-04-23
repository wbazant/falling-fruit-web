import { User } from '@styled-icons/boxicons-regular'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useDispatch, useSelector } from 'react-redux'
import { Link, useParams } from 'react-router-dom'

import {
  getUserActivity,
  setLastBrowsedSection,
} from '../../redux/activitySlice'
import {
  calculateCityCountsFromChanges,
  calculateTypeCountsFromChanges,
} from '../../utils/activityTypeCounts'
import { transformActivityData } from '../../utils/transformActivityData'
import { theme } from '../ui/GlobalStyle'
import IconBesideText from '../ui/IconBesideText'
import { InfoPage } from '../ui/PageTemplate'
import ActivitySearchInput from './ActivitySearchInput'
import ChangesPeriod from './ChangesPeriod'
import SkeletonLoader from './SkeletonLoader'

const UserActivityDisplay = ({ changes, userId, typesAccess }) => {
  const user = useSelector((state) => state.auth.user)
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

  const userName = changes.length > 0 ? changes[0].author : ''

  return (
    <>
      {userId === user?.id ? (
        'my activity'
      ) : (
        <IconBesideText>
          <User size={20} />
          <p>
            <Link to={`/profiles/${userId}`} style={{ color: theme.blue }}>
              {userName}
            </Link>
          </p>
        </IconBesideText>
      )}
      <ActivitySearchInput
        value={searchTerm}
        onChange={setSearchTerm}
        onClear={() => setSearchTerm('')}
        typesAccess={typesAccess}
        typeCountsById={typeCountsById}
        cityCounts={cityCounts}
      />
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
      <h2>{t('pages.changes.user_activity')}</h2>
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
