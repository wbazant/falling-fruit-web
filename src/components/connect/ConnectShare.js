import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { useLocation } from 'react-router-dom'

import { updateSettings } from '../../redux/settingsSlice'
import { useAppHistory } from '../../utils/useAppHistory'

/**
 * Component that handles shared URL parameters
 * Recognizes mapType parameter and updates Redux state
 */
const ConnectShare = () => {
  const location = useLocation()
  const history = useAppHistory()
  const dispatch = useDispatch()
  const searchParams = new URLSearchParams(location.search)

  useEffect(() => {
    const mapType = searchParams.get('mapType')
    const showLabels = searchParams.get('showLabels')

    const updates = {}

    if (mapType) {
      updates.mapType = mapType
    }

    if (showLabels === 'true') {
      updates.showLabels = true
    }

    if (Object.keys(updates).length > 0) {
      // Update Redux state with parameters from URL
      dispatch(updateSettings(updates))

      // Remove the parameters from URL after processing
      if (mapType) {history.removeParam('mapType')}
      if (showLabels) {history.removeParam('showLabels')}
    }
  }, [searchParams, dispatch, history])

  return null
}

export default ConnectShare
