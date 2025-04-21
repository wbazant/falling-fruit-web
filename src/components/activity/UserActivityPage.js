import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useDispatch, useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'

import {
  getUserActivity,
  setLastBrowsedSection,
} from '../../redux/activitySlice'
import { transformActivityData } from '../../utils/transformActivityData'
import { InfoPage } from '../ui/PageTemplate'
import ActivityStats from './ActivityStats'
import ChangesPeriod from './ChangesPeriod'
import SkeletonLoader from './SkeletonLoader'

const UserActivityPage = () => {
  const dispatch = useDispatch()
  let { userId } = useParams()
  userId = parseInt(userId)

  const { changesByUser, lastBrowsedSection } = useSelector(
    (state) => state.activity,
  )
  const changes = changesByUser[userId]

  const { t, i18n } = useTranslation()

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
        <>
          {(() => {
            const calculateActivityStats = (activities) => {
              // Calculate totals across all activities
              const stats = activities.reduce(
                (totals, activity) => {
                  totals.added += activity.added.length
                  totals.edited += activity.edited.length
                  totals.visited += activity.visited.length
                  return totals
                },
                { added: 0, edited: 0, visited: 0 },
              )

              // Extract all types from added locations
              const typeFrequency = {}
              activities.forEach((activity) => {
                activity.added.forEach((location) => {
                  location.types.forEach((type) => {
                    const typeName = type.commonName || type.scientificName
                    if (typeName) {
                      typeFrequency[typeName] =
                        (typeFrequency[typeName] || 0) + 1
                    }
                  })
                })
              })

              // Sort types by frequency and get top 3
              const mostCommonTypes = Object.entries(typeFrequency)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 3)
                .map((entry) => ({ name: entry[0], count: entry[1] }))

              return { stats, mostCommonTypes }
            }

            const transformedActivities = transformActivityData(
              changes,
              typesAccess,
              t,
              i18n.language,
            ).flatMap((period) => period.activities)

            const { stats, mostCommonTypes } = calculateActivityStats(
              transformedActivities,
            )

            return (
              <ActivityStats
                stats={stats}
                mostCommonTypes={mostCommonTypes}
                transformedActivities={transformedActivities}
              />
            )
          })()}
          {transformActivityData(changes, typesAccess, t, i18n.language).map(
            (period) => (
              <ChangesPeriod
                key={period.formattedDate}
                period={period}
                userId={userId}
              />
            ),
          )}
        </>
      )}
      {changes === undefined && <SkeletonLoader count={5} />}
    </InfoPage>
  )
}

export default UserActivityPage
