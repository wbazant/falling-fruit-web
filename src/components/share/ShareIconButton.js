import { Link as LinkIcon } from '@styled-icons/boxicons-regular'
import { useState } from 'react'

import IconButton from '../ui/IconButton'
import Share from './Share'

const ShareIconButton = (props) => {
  const [isShareOpen, setIsShareOpen] = useState(false)

  const handleOpenShare = () => {
    setIsShareOpen(true)
  }

  const handleCloseShare = () => {
    setIsShareOpen(false)
  }

  return (
    <>
      <IconButton
        size={45}
        icon={<LinkIcon />}
        label="share-button"
        onClick={handleOpenShare}
        {...props}
      />
      <Share isOpen={isShareOpen} onClose={handleCloseShare} />
    </>
  )
}

export default ShareIconButton
