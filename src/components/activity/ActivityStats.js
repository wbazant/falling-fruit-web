import React from 'react'
import { useTranslation } from 'react-i18next'

/**
 * Component to display statistics about user activity changes
 * Shows counts of added, edited, and visited locations
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
    </div>
  )
}

export default ActivityStats
