import React, { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'
import styled from 'styled-components'

import buildSelectTree from '../../utils/buildSelectTree'
import TreeSelect from '../filter/TreeSelect'

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

/**
 * Component to display statistics about user activity changes
 * Shows counts of added, edited, and visited locations
 * Also displays up to three most common types in added locations
 * Includes a TreeSelect component to visualize type distribution
 */
const ActivityStats = ({ stats, mostCommonTypes, transformedActivities }) => {
  const { t } = useTranslation()
  const { typesAccess } = useSelector((state) => state.type)

  // Calculate countsById from the activities data
  const countsById = useMemo(() => {
    const counts = {}

    transformedActivities.forEach((activity) => {
      activity.added.forEach((location) => {
        location.types.forEach((type) => {
          counts[type.id] = (counts[type.id] || 0) + 1
        })
      })
    })

    return counts
  }, [transformedActivities])
  console.log(countsById)

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
}

export default ActivityStats
