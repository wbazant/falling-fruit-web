import { useEffect, useRef } from 'react'
import { useDispatch } from 'react-redux'

import { fetchLists } from '../../redux/saveSlice'

/**
 * ConnectSave
 * why: the app needs the user's saved lists available in Redux
 *
 * action: fetch all saved lists from the backend exactly once per app load,
 * regardless of how many times this component mounts/unmounts
 */
const hasFetched = { current: false }

const ConnectSave = () => {
  const dispatch = useDispatch()
  const didFetch = useRef(hasFetched)

  useEffect(() => {
    if (didFetch.current.current) {return}
    didFetch.current.current = true
    dispatch(fetchLists())
  }, [dispatch])

  return null
}

export default ConnectSave
