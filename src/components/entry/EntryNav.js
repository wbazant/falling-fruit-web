import { Map, Pencil } from '@styled-icons/boxicons-solid'
import { useHistory, useLocation, useParams } from 'react-router-dom'

import IconButton from '../ui/IconButton'
import TopBarNav from '../ui/TopBarNav'

const EntryNav = () => {
  const history = useHistory()
  const { state } = useLocation()
  const { id } = useParams()

  const onBackButtonClick = () => {
    // TODO: extract into routing utils
    // Default to going back to the list. This occurs when the user opens /entry/{typeId} directly
    history.push(state?.fromPage ?? '/list')
  }

  const onEditButtonClick = () => {
    // TODO: edit entry callback
    console.log('Edit entry details clicked')
  }

  const onMapButtonClick = () => {
    history.push(`/map/entry/${id}`)
  }

  return (
    <TopBarNav
      onBack={onBackButtonClick}
      rightIcons={
        <>
          <IconButton
            size={50}
            icon={<Pencil />}
            onClick={onEditButtonClick}
            label="edit-entry-details"
          />
          <IconButton
            size={50}
            icon={<Map />}
            onClick={onMapButtonClick}
            label="map-entry-details"
          />
        </>
      }
    />
  )
}

export default EntryNav