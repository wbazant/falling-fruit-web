import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import { fetchLocationData, initNewLocation } from '../../redux/locationSlice'

const ConnectLocation = ({ locationId }) => {
  const dispatch = useDispatch()
  const mapCenter = useSelector((state) => state.map.view.center)

  useEffect(() => {
    if (locationId === 'new') {
      dispatch(initNewLocation(mapCenter))
    } else {
      dispatch(fetchLocationData(locationId))
    }
  }, [dispatch, locationId, mapCenter])
  return null
}

export default ConnectLocation
