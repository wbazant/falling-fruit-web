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

  const { t } = useTranslation()

  const { typesAccess } = useSelector((state) => state.type)

  const changesReady = !typesAccess.isEmpty

  useEffect(() => {
    if (lastBrowsedSection.id && lastBrowsedSection.userId === userId) {
      const periodElement = document.getElementById(`${lastBrowsedSection.id}`)
      if (periodElement) {
        periodElement.scrollIntoView()
        dispatch(setLastBrowsedSection({ id: null, userId: null }))
      }
    } else if (lastBrowsedSection.id) {
      // Reset if we're on the wrong page
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
      {changes !== undefined &&
        transformActivityData(changes, typesAccess).map((period) => (
          <ChangesPeriod key={period.daysAgo} period={period} />
        ))}
      {changes === undefined && <SkeletonLoader count={5} />}
    </InfoPage>
  )
}

export default UserActivityPage
