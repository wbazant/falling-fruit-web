import React from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

const TypesList = styled.div`
  margin-top: 10px;
  font-size: 0.9em;
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

/**
 * Component to display statistics about user activity changes
 * Shows counts of added, edited, and visited locations
 * Also displays up to three most common types in added locations
 */
const ActivityStats = ({ activities }) => {
  const { t } = useTranslation()

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
          typeFrequency[typeName] = (typeFrequency[typeName] || 0) + 1
        }
      })
    })
  })

  // Sort types by frequency and get top 3
  const mostCommonTypes = Object.entries(typeFrequency)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map((entry) => entry[0])

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
            {mostCommonTypes.map((typeName, index) => (
              <TypeItem key={index}>{typeName}</TypeItem>
            ))}
          </TypesList>
        </>
      )}
    </div>
  )
}

export default ActivityStats
