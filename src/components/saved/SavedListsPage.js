import {
  Check,
  ChevronDown,
  ChevronRight,
  X,
} from '@styled-icons/boxicons-regular'
import { Pencil, Trash } from '@styled-icons/boxicons-solid'
import { darken } from 'polished'
import { useEffect, useRef, useState } from 'react'
import Skeleton from 'react-loading-skeleton'
import { useDispatch, useSelector } from 'react-redux'
import styled from 'styled-components/macro'

import {
  addList,
  fetchLists,
  fetchLocationsForList,
  removeList,
  removeLocationFromList,
  renameList,
} from '../../redux/saveSlice'
import { BackButton } from '../ui/ActionButtons'
import { theme } from '../ui/GlobalStyle'
import Input from '../ui/Input'
import { Page } from '../ui/PageTemplate'

const LocationRowSkeleton = () => (
  <div
    style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0.5rem 1.25rem',
      borderBottom: '1px solid #eee',
    }}
  >
    <div
      style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1 }}
    >
      {/* Type name */}
      <Skeleton width={120} height={16} />
      {/* Address */}
      <Skeleton width={180} height={14} />
    </div>
    {/* Remove button placeholder */}
    <Skeleton circle width={20} height={20} />
  </div>
)
/* ─── Styled components ─────────────────────────────────────────── */

const ListCard = styled.div`
  border: 1px solid #ddd;
  overflow: hidden;
  background-color: #fff;
`

const TitleRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0.75rem 1.25rem;
  border-bottom: 1px solid ${theme.secondaryBackground};
`

const ListName = styled.h2`
  margin: 0;
  font-size: 1.1rem;
  flex: 1;
`

const ExpandRow = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 0.6rem 1.25rem;
  cursor: ${({ $clickable }) => ($clickable ? 'pointer' : 'default')};
  user-select: none;

  &:hover {
    background: ${({ $clickable }) =>
      $clickable ? theme.secondaryBackground : 'transparent'};
  }
`

const LocationCount = styled.span`
  font-size: 0.9rem;
  color: ${theme.secondaryText};
`

const IconButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  color: ${({ color }) => color || theme.secondaryText};
  flex-shrink: 0;

  &:hover {
    background: ${theme.secondaryBackground};
  }

  svg {
    width: 18px;
    height: 18px;
  }
`

const EditRow = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 0.75rem 1.25rem;
  border-bottom: 1px solid #ddd;
`

const EditInput = styled(Input)`
  flex: 1;
  height: 34px;
  font-size: 1rem;
  font-weight: bold;
`

const LocationList = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;
  border-top: 1px solid ${theme.secondaryBackground};
`

const LocationItem = styled.li`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.5rem 1.25rem;
  border-bottom: 1px solid ${theme.secondaryBackground};
  position: relative;

  &:last-child {
    border-bottom: none;
  }
`

const LocationButton = styled.button`
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  text-align: left;
  flex: 1;
  color: ${({ theme }) => theme.blue};
  font-size: 1rem;

  &:hover {
    text-decoration: underline;
  }
`

const Address = styled.span`
  color: ${theme.secondaryText};
  font-size: 0.85rem;
  margin-left: 0.5rem;
`

const RemoveButton = styled.button`
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  display: flex;
  align-items: center;
  color: ${theme.secondaryText};
  opacity: ${({ disabled }) => (disabled ? 0.4 : 1)};
  pointer-events: ${({ disabled }) => (disabled ? 'none' : 'auto')};
  transition: color 0.15s ease;
  flex-shrink: 0;
  margin-left: 0.5rem;

  &:hover {
    color: ${darken(0.4, theme.secondaryText)};
  }
`

const LocationMenu = styled.div`
  position: absolute;
  right: 3rem;
  top: 50%;
  transform: translateY(-50%);
  background: #fff;
  border: 1px solid #ddd;
  border-radius: 6px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 100;
  min-width: 160px;
  overflow: hidden;
`

const MenuOption = styled.button`
  display: block;
  width: 100%;
  padding: 0.6rem 1rem;
  background: none;
  border: none;
  text-align: left;
  cursor: pointer;
  font-size: 0.95rem;

  &:hover {
    background: ${theme.secondaryBackground};
  }
`

const ScientificName = styled.span`
  font-style: italic;
`

const CommonName = styled.span`
  font-weight: bold;
`

const AddListCardWrapper = styled(ListCard)`
  cursor: pointer;
`

const AddListPromptRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 0.75rem 1.25rem;
  color: ${theme.headerText};
  font-weight: bold;
  font-size: 1rem;
  user-select: none;

  &:hover {
    background: ${theme.secondaryBackground};
  }

  svg {
    width: 18px;
    height: 18px;
    flex-shrink: 0;
  }
`

const AddListInputRow = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 0.75rem 1.25rem;
`

const AddListInput = styled(Input)`
  flex: 1;
  height: 34px;
  font-size: 1rem;
  font-weight: bold;
`

/* ─── Helpers ───────────────────────────────────────────────────── */

const LocationTypeDisplay = ({ location, typesAccess }) => {
  const typeIds = location.type_ids || []

  if (typeIds.length === 0) {
    return <span>{String(location.id)}</span>
  }

  const typeElements = typeIds.map((typeId, idx) => {
    const type = typesAccess.getType(typeId)
    if (!type) {
      return <span key={idx}>{typeId}</span>
    }
    if (type.commonName) {
      return <CommonName key={idx}>{type.commonName}</CommonName>
    }
    if (type.scientificName) {
      return <ScientificName key={idx}>{type.scientificName}</ScientificName>
    }
    return <span key={idx}>{typeId}</span>
  })

  return (
    <>
      {typeElements.reduce((prev, curr, idx) => {
        if (prev.length) {
          return [...prev, <span key={`sep-${idx}`}>, </span>, curr]
        }
        return [curr]
      }, [])}
    </>
  )
}

const getLocationPlainName = (location, typesAccess) => {
  const names = (location.type_ids || []).map((typeId) => {
    const type = typesAccess.getType(typeId)
    if (!type) {
      return typeId
    }
    return type.commonName || type.scientificName || typeId
  })
  return names.length > 0 ? names.join(', ') : String(location.id)
}

/* ─── LocationRow ───────────────────────────────────────────────── */

const LocationRow = ({ location, listId, isListBusy, typesAccess }) => {
  const dispatch = useDispatch()
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef(null)

  const displayName = getLocationPlainName(location, typesAccess)

  // Close menu when clicking outside
  useEffect(() => {
    if (!menuOpen) {
      return
    }
    const handleClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [menuOpen])

  const handleViewOnMap = () => {
    setMenuOpen(false)
    window.location.hash = `/locations/${location.id}`
  }

  const handleRemove = () => {
    setMenuOpen(false)
    if (window.confirm(`Remove "${displayName}" from the list?`)) {
      dispatch(removeLocationFromList({ listId, locationId: location.id }))
    }
  }

  return (
    <LocationItem>
      <LocationButton onClick={() => setMenuOpen((v) => !v)}>
        <LocationTypeDisplay location={location} typesAccess={typesAccess} />
        {location.address && <Address>{location.address}</Address>}
      </LocationButton>

      {menuOpen && (
        <LocationMenu ref={menuRef}>
          <MenuOption onClick={handleViewOnMap}>View on map</MenuOption>
          <MenuOption onClick={handleRemove} style={{ color: theme.red }}>
            Remove from list
          </MenuOption>
        </LocationMenu>
      )}

      <RemoveButton
        onClick={handleRemove}
        disabled={isListBusy}
        aria-label={`Remove ${displayName} from list`}
        title="Remove from list"
      >
        <X size={20} />
      </RemoveButton>
    </LocationItem>
  )
}

/* ─── ListCardComponent ─────────────────────────────────────────── */

const ListCardComponent = ({ list }) => {
  const dispatch = useDispatch()
  const [expanded, setExpanded] = useState(false)
  const [editing, setEditing] = useState(false)
  const [editName, setEditName] = useState(list.name)
  const inputRef = useRef(null)

  const { locationsByListId, loadingLocationsByListId, loadingLists } =
    useSelector((state) => state.save)
  const { typesAccess } = useSelector((state) => state.type)

  const isListBusy = !!loadingLists[list.listId]
  const isLoadingLocations = !!loadingLocationsByListId[list.listId]
  const currentListLocations = locationsByListId[list.listId] || []
  const hasLocations = list.locationIds.length > 0

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus()
    }
  }, [editing])

  const handleToggleExpand = () => {
    if (!hasLocations) {
      return
    }
    const next = !expanded
    setExpanded(next)
    if (next) {
      dispatch(
        fetchLocationsForList({
          listId: list.listId,
          locationIds: list.locationIds,
        }),
      )
    }
  }

  const handleEditClick = (e) => {
    e.stopPropagation()
    setEditName(list.name)
    setEditing(true)
  }

  const handleCancelEdit = (e) => {
    e?.stopPropagation()
    setEditing(false)
    setEditName(list.name)
  }

  const handleConfirmEdit = (e) => {
    e?.stopPropagation()
    const trimmed = editName.trim()
    if (trimmed && trimmed !== list.name) {
      dispatch(renameList({ listId: list.listId, newName: trimmed }))
    }
    setEditing(false)
  }

  const handleDeleteClick = (e) => {
    e.stopPropagation()
    if (window.confirm(`Delete "${list.name}"?`)) {
      dispatch(removeList({ listId: list.listId }))
    }
  }

  return (
    <ListCard>
      {/* Row 1: title + edit/delete icons (or edit input) */}
      {editing ? (
        <EditRow>
          <EditInput
            ref={inputRef}
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            onEnter={handleConfirmEdit}
          />
          <IconButton
            onClick={handleCancelEdit}
            color={theme.red}
            title="Cancel"
          >
            <X />
          </IconButton>
          <IconButton
            onClick={handleConfirmEdit}
            color={theme.green}
            title="Confirm"
          >
            <Check />
          </IconButton>
        </EditRow>
      ) : (
        <TitleRow>
          <ListName>{list.name}</ListName>
          <IconButton onClick={handleEditClick} title="Rename list">
            <Pencil />
          </IconButton>
          <IconButton onClick={handleDeleteClick} title="Delete list">
            <Trash />
          </IconButton>
        </TitleRow>
      )}

      {/* Row 2: chevron + "x locations" expand toggle */}
      <ExpandRow onClick={handleToggleExpand} $clickable={hasLocations}>
        {hasLocations &&
          (expanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />)}
        <LocationCount>
          {list.locationIds.length}{' '}
          {list.locationIds.length === 1 ? 'location' : 'locations'}
        </LocationCount>
      </ExpandRow>

      {/* Expanded location list */}
      {expanded && (
        <LocationList>
          {isLoadingLocations
            ? Array.from({ length: Math.min(list.locationIds.length, 3) }).map(
                (_, i) => <LocationRowSkeleton key={i} />,
              )
            : currentListLocations.map((location) => (
                <LocationRow
                  key={location.id}
                  location={location}
                  listId={list.listId}
                  isListBusy={isListBusy}
                  typesAccess={typesAccess}
                />
              ))}
        </LocationList>
      )}
    </ListCard>
  )
}

/* ─── AddListCard ───────────────────────────────────────────────── */

const AddListCard = () => {
  const dispatch = useDispatch()
  const [adding, setAdding] = useState(false)
  const [newListName, setNewListName] = useState('')
  const inputRef = useRef(null)

  useEffect(() => {
    if (adding && inputRef.current) {
      inputRef.current.focus()
    }
  }, [adding])

  const handleConfirm = () => {
    const trimmed = newListName.trim()
    if (trimmed) {
      dispatch(addList({ name: trimmed }))
    }
    setAdding(false)
    setNewListName('')
  }

  const handleCancel = () => {
    setAdding(false)
    setNewListName('')
  }

  return (
    <AddListCardWrapper>
      {adding ? (
        <AddListInputRow>
          <AddListInput
            ref={inputRef}
            value={newListName}
            onChange={(e) => setNewListName(e.target.value)}
            placeholder="List name"
            onEnter={handleConfirm}
          />
          <IconButton onClick={handleCancel} color={theme.red} title="Cancel">
            <X />
          </IconButton>
          <IconButton
            onClick={handleConfirm}
            color={theme.green}
            title="Confirm"
          >
            <Check />
          </IconButton>
        </AddListInputRow>
      ) : (
        <AddListPromptRow onClick={() => setAdding(true)}>
          Add new list
        </AddListPromptRow>
      )}
    </AddListCardWrapper>
  )
}

/* ─── SavedListsPage ────────────────────────────────────────────── */

const SavedListsPage = () => {
  const dispatch = useDispatch()
  const { lists, isLoading } = useSelector((state) => state.save)

  useEffect(() => {
    dispatch(fetchLists())
  }, [dispatch])

  if (isLoading) {
    return (
      <Page>
        <p>Loading…</p>
      </Page>
    )
  }

  return (
    <Page>
      <BackButton backPath="/account/edit" />
      <h1>Saved locations</h1>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {lists.map((list) => (
          <ListCardComponent key={list.listId} list={list} />
        ))}
        <AddListCard />
      </div>
    </Page>
  )
}

export default SavedListsPage
