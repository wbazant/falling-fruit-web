import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { useLocation } from 'react-router-dom'

import { updateSettings } from '../../redux/settingsSlice'
import { updateSelection } from '../../redux/updateSelection'
import { useAppHistory } from '../../utils/useAppHistory'

/**
 * Component that handles shared URL parameters
 * Recognizes mapType parameter and updates Redux state
 */
const ConnectShare = () => {
  const location = useLocation()
  const history = useAppHistory()
  const dispatch = useDispatch()

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search)
    const mapType = searchParams.get('mapType')
    const showLabels = searchParams.get('showLabels')
    const overlay = searchParams.get('overlay')
    const muni = searchParams.get('muni')
    const showBusinesses = searchParams.get('showBusinesses')
    const types = searchParams.get('types')

    const settingsUpdates = {}
    const filterUpdates = {}

    if (mapType) {
      settingsUpdates.mapType = mapType
    }

    if (showLabels === 'true') {
      settingsUpdates.showLabels = true
    }

    if (showBusinesses === 'true') {
      settingsUpdates.showBusinesses = true
    }

    if (overlay) {
      settingsUpdates.overlay = overlay
    }

    if (muni === 'false') {
      filterUpdates.muni = false
    }

    if (types) {
      filterUpdates.types = types.split(',')
    }

    if (Object.keys(settingsUpdates).length > 0) {
      dispatch(updateSettings(settingsUpdates))
    }

    if (Object.keys(filterUpdates).length > 0) {
      dispatch(updateSelection(filterUpdates))
    }

    if (mapType) {
      history.removeParam('mapType')
    }
    if (showLabels) {
      history.removeParam('showLabels')
    }
    if (overlay) {
      history.removeParam('overlay')
    }
    if (muni) {
      history.removeParam('muni')
    }
    if (showBusinesses) {
      history.removeParam('showBusinesses')
    }
    if (types) {
      history.removeParam('types')
    }
  }, [location.search, dispatch, history])

  return null
}

export default ConnectShare
