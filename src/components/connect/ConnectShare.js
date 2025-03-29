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

    if (mapType) {
      // Update Redux state with the mapType from URL
      dispatch(updateSettings({ mapType }))

      // Remove the parameter from URL after processing
      history.removeParam('mapType')
    }
  }, [searchParams, dispatch, history])

  return null
}

export default ConnectShare
