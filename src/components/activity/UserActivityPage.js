import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useDispatch, useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'
import styled from 'styled-components'

import {
  getUserActivity,
  setLastBrowsedSection,
} from '../../redux/activitySlice'
import { calculateTypeCountsFromChanges } from '../../utils/activityTypeCounts'
import buildSelectTree from '../../utils/buildSelectTree'
import { transformActivityData } from '../../utils/transformActivityData'
import TreeSelect from '../filter/TreeSelect'
import { InfoPage } from '../ui/PageTemplate'
import ChangesPeriod from './ChangesPeriod'
import SkeletonLoader from './SkeletonLoader'

const TreeSelectContainer = styled.div`
  margin-top: 20px;
`

const TreeSelectTitle = styled.h4`
  margin-bottom: 10px;
`

const TypeDistributionTree = ({ typesAccess, countsById, types, onChange }) => {
  const { t } = useTranslation()
  console.log(countsById, types)

  const { tree: selectTree } = useMemo(
    () =>
      buildSelectTree(
        typesAccess,
        countsById,
        true, // showOnlyOnMap
        '', // searchValue
        types, // selectedTypes
      ),
    [typesAccess, countsById, types],
  )

  return (
    <TreeSelectContainer>
      <TreeSelectTitle>{t('pages.changes.type_distribution')}</TreeSelectTitle>
      <TreeSelect types={types} onChange={onChange} selectTree={selectTree} />
    </TreeSelectContainer>
  )
}

const UserActivityDisplay = ({ changes, userId, typesAccess }) => {
  const { t, i18n } = useTranslation()
  const [selectedTypes, setSelectedTypes] = useState([])

  // Move calculations and hooks before any conditional returns
  const typeCounts = changes ? calculateTypeCountsFromChanges(changes) : []
  const countsById = typeCounts.reduce((acc, { id, count }) => {
    acc[id] = count
    return acc
  }, {})
  const types = Object.keys(countsById).map(Number)

  // Initialize selected types when types are first loaded
  useEffect(() => {
    if (types.length > 0 && selectedTypes.length === 0) {
      setSelectedTypes([...types])
    }
  }, [types, selectedTypes.length])

  const filteredChanges = changes.filter((change) =>
    change.type_ids.some((typeId) => selectedTypes.includes(typeId)),
  )
  return (
    <>
      <div className="activity-stats">
        <h3>{t('glossary.locations.other')}</h3>
        {Object.keys(countsById).length > 0 && !typesAccess.isEmpty && (
          <TypeDistributionTree
            typesAccess={typesAccess}
            countsById={countsById}
            types={selectedTypes}
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
