import { useSelector } from 'react-redux'

/**
 * Custom hook to generate a shareable URL with the current map type, labels setting, and overlay
 * @returns {string} The shareable URL
 */
const useShareUrl = () => {
  const { mapType, showLabels, overlay } = useSelector(
    (state) => state.settings,
  )

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
  return url.toString()
}

export default useShareUrl
