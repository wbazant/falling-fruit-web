import { Check, X } from '@styled-icons/boxicons-regular'
import {
  Bookmark,
  Bookmark as BookmarkSolid,
} from '@styled-icons/boxicons-solid'
import { useEffect, useRef, useState } from 'react'
import { useDispatch } from 'react-redux'
import styled from 'styled-components/macro'

import { addList, toggleLocationInList } from '../../../redux/saveSlice'
import Button from '../../ui/Button'
import { theme } from '../../ui/GlobalStyle'
import Input from '../../ui/Input'
import useSavedLists from './useSavedLists'

const Wrapper = styled.div`
  position: relative;
  display: inline-block;
`

const Dropdown = styled.div`
  position: absolute;
  bottom: calc(100% + 4px);
  right: 0;
  z-index: 100;
  background: ${theme.background};
  border: 1px solid ${theme.secondaryBackground};
  border-radius: 0.375em;
  box-shadow: 0 4px 12px ${theme.shadow};
  min-width: 200px;
  overflow: hidden;
  font-family: ${theme.fonts};
`

const ListItem = styled.button`
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 10px 14px;
  background: ${({ checked }) => (checked ? theme.transparentOrange : 'none')};
  border: none;
  border-bottom: 1px solid ${theme.secondaryBackground};
  cursor: pointer;
  font-size: 0.875rem;
  font-family: ${theme.fonts};
  font-weight: normal;
  color: ${theme.secondaryText};
  text-align: left;
  box-sizing: border-box;

  &:hover {
    background: ${({ checked }) => !checked && theme.transparentBlue};
  }
`

const Divider = styled.hr`
  margin: 0;
  border: none;
  border-top: 1px solid ${theme.secondaryBackground};
`

const AddNewItem = styled(ListItem)`
  justify-content: center;
  color: ${theme.headerText};
  font-weight: bold;
`

const AddNewRow = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 10px;
  box-sizing: border-box;
`

const AddNewInput = styled(Input)`
  flex: 1;
  height: 34px;
  font-size: 0.875rem;
`

const IconActionButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  color: ${({ color }) => color || theme.secondaryText};

  &:hover {
    background: ${theme.secondaryBackground};
  }

  svg {
    width: 20px;
    height: 20px;
  }
`

/**
 * Stacks both label rows on top of each other so the button always
 * reserves space for whichever is wider, regardless of translation.
 * Each row contains the icon + text together so the icon stays snug
 * next to the label text in both states.
 */
const ButtonLabelWrapper = styled.span`
  display: inline-grid;
  justify-items: center;
`

const ButtonLabel = styled.span`
  visibility: ${({ visible }) => (visible ? 'visible' : 'hidden')};
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  grid-area: 1 / 1;
`

const SaveToListButton = ({
  locationId,
  saveLabel = 'Save',
  savedLabel = 'Saved',
}) => {
  const dispatch = useDispatch()
  const [open, setOpen] = useState(false)
  const [addingNew, setAddingNew] = useState(false)
  const [newListName, setNewListName] = useState('')
  const wrapperRef = useRef(null)
  const newListInputRef = useRef(null)

  const { lists, isSavedToAny } = useSavedLists(locationId)

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setOpen(false)
        setAddingNew(false)
        setNewListName('')
      }
    }
    if (open) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [open])

  // Focus the input when the add-new row appears
  useEffect(() => {
    if (addingNew && newListInputRef.current) {
      newListInputRef.current.focus()
    }
  }, [addingNew])

  const handleToggle = (listId) => {
    dispatch(toggleLocationInList({ listId, locationId }))
  }

  const handleAddNewClick = () => {
    setAddingNew(true)
    setNewListName('')
  }

  const handleConfirmNewList = () => {
    const trimmed = newListName.trim()
    if (trimmed) {
      dispatch(addList({ name: trimmed }))
    }
    setAddingNew(false)
    setNewListName('')
  }

  const handleCancelNewList = () => {
    setAddingNew(false)
    setNewListName('')
  }

  return (
    <Wrapper ref={wrapperRef}>
      <Button secondary onClick={() => setOpen((o) => !o)}>
        <ButtonLabelWrapper>
          <ButtonLabel visible={!isSavedToAny}>
            <Bookmark size={18} />
            {saveLabel}
          </ButtonLabel>
          <ButtonLabel visible={isSavedToAny}>
            <BookmarkSolid size={18} />
            {savedLabel}
          </ButtonLabel>
        </ButtonLabelWrapper>
      </Button>
      {open && (
        <Dropdown>
          {lists.map(({ listId, name, checked }) => (
            <ListItem
              key={listId}
              checked={checked}
              onClick={() => handleToggle(listId)}
            >
              {name}
            </ListItem>
          ))}
          <Divider />
          {addingNew ? (
            <AddNewRow>
              <AddNewInput
                ref={newListInputRef}
                value={newListName}
                onChange={(e) => setNewListName(e.target.value)}
                placeholder="List name"
                onEnter={handleConfirmNewList}
              />
              <IconActionButton
                onClick={handleCancelNewList}
                color={theme.red}
                title="Cancel"
              >
                <X />
              </IconActionButton>
              <IconActionButton
                onClick={handleConfirmNewList}
                color={theme.green}
                title="Confirm"
              >
                <Check />
              </IconActionButton>
            </AddNewRow>
          ) : (
            <AddNewItem onClick={handleAddNewClick}>Add new list</AddNewItem>
          )}
        </Dropdown>
      )}
    </Wrapper>
  )
}

export default SaveToListButton
