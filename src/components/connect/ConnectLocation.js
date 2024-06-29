import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import { fetchLocationData, initNewLocation } from '../../redux/locationSlice'

const ConnectLocation = ({ locationId, isBeingEdited }) => {
  const dispatch = useDispatch()
  const mapCenter = useSelector((state) => state.map.view.center)

  useEffect(() => {
    if (locationId === 'new') {
      dispatch(initNewLocation(mapCenter))
    } else {
      dispatch(fetchLocationData({ locationId, isBeingEdited }))
    }
  }, [dispatch, locationId, mapCenter, isBeingEdited])

  return null
}

export default ConnectLocation
