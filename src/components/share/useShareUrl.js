import { useSelector } from 'react-redux'

/**
 * Custom hook to generate a shareable URL with the current map type
 * @returns {string} The shareable URL
 */
const useShareUrl = () => {
  const { mapType } = useSelector((state) => state.settings)

  const url = new URL(window.location.href)
  // Only set mapType if it's not the default value (roadmap)
  if (mapType !== 'roadmap') {
    url.searchParams.set('mapType', mapType)
  }
  return url.toString()
}

export default useShareUrl
