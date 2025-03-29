import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useLocation } from 'react-router-dom'

import { updateSettings } from '../../redux/settingsSlice'
import { updateSelection } from '../../redux/updateSelection'
import TypeShareEncoder from '../../utils/typeShareEncoder'
import { useAppHistory } from '../../utils/useAppHistory'

/**
 * Component that handles shared URL parameters
 * Recognizes mapType parameter and updates Redux state
 */
const ConnectShare = () => {
  const location = useLocation()
  const history = useAppHistory()
  const dispatch = useDispatch()
  const typesAccess = useSelector((state) => state.type.typesAccess)

  // Handle settings parameters
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search)
    const mapType = searchParams.get('mapType')
    const showLabels = searchParams.get('showLabels')
    const overlay = searchParams.get('overlay')
    const showBusinesses = searchParams.get('showBusinesses')

    const settingsUpdates = {}

    if (mapType) {
      settingsUpdates.mapType = mapType
      history.removeParam('mapType')
    }

    if (showLabels === 'true') {
      settingsUpdates.showLabels = true
      history.removeParam('showLabels')
    }

    if (showBusinesses === 'true') {
      settingsUpdates.showBusinesses = true
      history.removeParam('showBusinesses')
    }

    if (overlay) {
      settingsUpdates.overlay = overlay
      history.removeParam('overlay')
    }

    if (Object.keys(settingsUpdates).length > 0) {
      dispatch(updateSettings(settingsUpdates))
    }
  }, [location.search, dispatch, history])

  // Handle filter parameters - depends on typesAccess being loaded
  useEffect(() => {
    // Skip if typesAccess is empty (not yet loaded)
    if (typesAccess.isEmpty) {
      return
    }

    const searchParams = new URLSearchParams(location.search)
    const muni = searchParams.get('muni')
    const encodedTypes = searchParams.get('types')

    const filterUpdates = {}

    if (muni === 'false') {
      filterUpdates.muni = false
      history.removeParam('muni')
    }

    if (encodedTypes) {
      const typeEncoder = new TypeShareEncoder(typesAccess)
      filterUpdates.types = typeEncoder.decode(encodedTypes)
      history.removeParam('types')
    }

    if (Object.keys(filterUpdates).length > 0) {
      dispatch(updateSelection(filterUpdates))
    }
  }, [location.search, dispatch, history, typesAccess])

  return null
}

export default ConnectShare
