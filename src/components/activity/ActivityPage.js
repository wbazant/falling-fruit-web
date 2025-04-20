import { useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { useDispatch, useSelector } from 'react-redux'

import {
  fetchMoreLocationChanges,
  setAnchorElementId,
} from '../../redux/activitySlice'
import { transformActivityData } from '../../utils/transformActivityData'
import { InfoPage } from '../ui/PageTemplate'
import ChangesPeriod from './ChangesPeriod'
import SkeletonLoader from './SkeletonLoader'

const ActivityPage = () => {
  const dispatch = useDispatch()
  const loadMoreRef = useRef()
  const { t } = useTranslation()

  const { locationChanges, isLoading } = useSelector(
    (state) => state.activity.users.all,
  )

  const { typesAccess } = useSelector((state) => state.type)
  const { anchorElementId } = useSelector((state) => state.activity)

  const changesReady = !typesAccess.isEmpty

  useEffect(() => {
    if (anchorElementId) {
      const periodElement = document.getElementById(`${anchorElementId}`)
      if (periodElement) {
        periodElement.scrollIntoView()
        dispatch(setAnchorElementId(null))
      }
    }
  }, [anchorElementId, dispatch])

  useEffect(() => {
    if (changesReady) {
      dispatch(fetchMoreLocationChanges())
    }
  }, [dispatch, changesReady])

  useEffect(() => {
    if (changesReady) {
      // Store the necessary state values in refs to avoid using hooks in callbacks
      const observer = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting) {
            dispatch(fetchMoreLocationChanges())
          }
        },
        { threshold: 1.0 },
      )

      const currentRef = loadMoreRef.current

      if (currentRef) {
        observer.observe(currentRef)
      }

      return () => {
        if (currentRef) {
          observer.unobserve(currentRef)
        }
      }
    }
  }, [dispatch, changesReady])

  const groupedData = transformActivityData(locationChanges, typesAccess)

  return (
    <InfoPage>
      <h1>{t('pages.changes.recent_changes')}</h1>
      {locationChanges.length > 0 &&
        groupedData.map((period) => (
          <ChangesPeriod key={period.daysAgo} period={period} />
        ))}
      <div ref={loadMoreRef}></div>
      {isLoading && (
        <SkeletonLoader count={locationChanges.length === 0 ? 5 : 1} />
      )}
    </InfoPage>
  )
}

export default ActivityPage
