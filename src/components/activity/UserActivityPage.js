import { useEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useDispatch, useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'
import styled from 'styled-components'

import {
  getUserActivity,
  setLastBrowsedSection,
} from '../../redux/activitySlice'
import buildSelectTree from '../../utils/buildSelectTree'
import { calculateTypeCountsFromChanges } from '../../utils/activityTypeCounts'
import { transformActivityData } from '../../utils/transformActivityData'
import { InfoPage } from '../ui/PageTemplate'
import TreeSelect from '../filter/TreeSelect'
import ChangesPeriod from './ChangesPeriod'
import SkeletonLoader from './SkeletonLoader'

const TypesList = styled.div`
  margin-top: 10px;
  font-size: 0.9em;
`

const TreeSelectContainer = styled.div`
  margin-top: 20px;
`

const TreeSelectTitle = styled.h4`
  margin-bottom: 10px;
`

const TypeItem = styled.span`
  display: inline-block;
  margin-right: 8px;
  margin-bottom: 5px;
  padding: 2px 8px;
  background-color: ${({ theme }) => theme.lightBackground || '#f0f0f0'};
  border-radius: 12px;

  &:last-child {
    margin-right: 0;
  }
`

const CommonTypesTitle = styled.div`
  font-size: 0.9em;
  margin-top: 15px;
  color: ${({ theme }) => theme.secondaryText || '#666'};
`

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
            const transformedActivities = transformActivityData(
              changes,
              typesAccess,
              t,
              i18n.language,
            ).flatMap((period) => period.activities)
            
            // Calculate totals across all activities
            const stats = transformedActivities.reduce(
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
            transformedActivities.forEach((activity) => {
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
              
            // Get type counts using activityTypeCounts utility
            const typeCounts = calculateTypeCountsFromChanges(changes);
            const countsById = typeCounts.reduce((acc, { id, count }) => {
              acc[id] = count;
              return acc;
            }, {});
            
            // Get all type IDs that appear in the data
            const types = useMemo(
              () => Object.keys(countsById).map((id) => parseInt(id)),
              [countsById],
            )

            // Build the select tree with the calculated data
            const { tree: selectTree } = useMemo(
              () =>
                buildSelectTree(
                  typesAccess,
                  countsById,
                  false, // showOnlyOnMap
                  '', // searchValue
                  types, // selectedTypes
                ),
              [typesAccess, countsById, types],
            )

            return (
              <div className="activity-stats">
                <h3>{t('glossary.locations.other')}</h3>
                <div className="stats-container">
                  <div className="stat-item">
                    <span className="stat-value">{stats.added}</span>
                    <span className="stat-label">{t('pages.changes.type.added')}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-value">{stats.edited}</span>
                    <span className="stat-label">{t('pages.changes.type.edited')}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-value">{stats.visited}</span>
                    <span className="stat-label">{t('pages.changes.type.visited')}</span>
                  </div>
                </div>

                {mostCommonTypes.length > 0 && (
                  <>
                    <CommonTypesTitle>
                      {t('pages.changes.most_common_types')}
                    </CommonTypesTitle>
                    <TypesList>
                      {mostCommonTypes.map((type, index) => (
                        <TypeItem key={index}>
                          {type.name} [{type.count}]
                        </TypeItem>
                      ))}
                    </TypesList>
                  </>
                )}

                {Object.keys(countsById).length > 0 && !typesAccess.isEmpty && (
                  <TreeSelectContainer>
                    <TreeSelectTitle>
                      {t('pages.changes.type_distribution')}
                    </TreeSelectTitle>
                    <TreeSelect
                      types={types}
                      onChange={() => void 0}
                      selectTree={selectTree}
                    />
                  </TreeSelectContainer>
                )}
              </div>
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
