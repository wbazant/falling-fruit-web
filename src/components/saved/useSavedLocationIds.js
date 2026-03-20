import { useMemo } from 'react'
import { useSelector } from 'react-redux'

const useSavedLocationIds = () => {
  const allLists = useSelector((state) => state.save.lists)
  const savedLocationIds = useMemo(() => {
    const ids = new Set()
    allLists.forEach((list) => {
      list.locationIds.forEach((id) => ids.add(id))
    })
    return ids
  }, [allLists])
  return savedLocationIds
}

export default useSavedLocationIds
