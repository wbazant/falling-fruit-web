import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useDispatch, useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'

import { getUserActivity } from '../../redux/activitySlice'
import { transformActivityData } from '../../utils/transformActivityData'
import { InfoPage } from '../ui/PageTemplate'
import ChangesPeriod from './ChangesPeriod'
import SkeletonLoader from './SkeletonLoader'

const UserActivityPage = () => {
  const dispatch = useDispatch()
  let { userId } = useParams()
  userId = parseInt(userId)

  const { locationChanges = [], isLoading = true } = useSelector(
    (state) => state.activity.users[userId] || {},
  )

  const { t } = useTranslation()

  const { typesAccess } = useSelector((state) => state.type)

  const changesReady = !typesAccess.isEmpty

  useEffect(() => {
    if (changesReady) {
      dispatch(getUserActivity(userId))
    }
  }, [dispatch, changesReady, userId])

  const groupedData = transformActivityData(locationChanges, typesAccess)

  return (
    <InfoPage>
      <h1>{t('pages.changes.recent_changes')}</h1>
      {locationChanges.length > 0 &&
        groupedData.map((period) => (
          <ChangesPeriod key={period.daysAgo} period={period} />
        ))}
      {isLoading && (
        <SkeletonLoader count={locationChanges.length === 0 ? 5 : 1} />
      )}
    </InfoPage>
  )
}

export default UserActivityPage
