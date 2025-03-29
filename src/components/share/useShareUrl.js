import { useSelector } from 'react-redux'

/**
 * Custom hook to generate a shareable URL with the current map type and labels setting
 * @returns {string} The shareable URL
 */
const useShareUrl = () => {
  const { mapType, showLabels } = useSelector((state) => state.settings)

  const url = new URL(window.location.href)
  if (mapType !== 'roadmap') {
    url.searchParams.set('mapType', mapType)
  }
  if (showLabels) {
    url.searchParams.set('showLabels', 'true')
  }
  return url.toString()
}

export default useShareUrl
