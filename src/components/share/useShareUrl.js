import { useSelector } from 'react-redux'

/**
 * Custom hook to generate a shareable URL with the current map type, labels setting, and overlay
 * @returns {string} The shareable URL
 */
const useShareUrl = () => {
  const { mapType, showLabels, overlay, showBusinesses } = useSelector(
    (state) => state.settings,
  )
  const { muni } = useSelector((state) => state.filter)

  const url = new URL(window.location.href)
  if (mapType !== 'roadmap') {
    url.searchParams.set('mapType', mapType)
  }
  if (showLabels) {
    url.searchParams.set('showLabels', 'true')
  }
  if (overlay) {
    url.searchParams.set('overlay', overlay)
  }
  if (!muni) {
    url.searchParams.set('muni', 'false')
  }
  if (showBusinesses) {
    url.searchParams.set('showBusinesses', 'true')
  }
  return url.toString()
}

export default useShareUrl
