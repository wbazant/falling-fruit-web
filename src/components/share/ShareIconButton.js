import { Share as ShareIcon } from '@styled-icons/boxicons-solid'

import IconButton from '../ui/IconButton'

const ShareIconButton = (props) => {
  console.log(props)
  return (
    <IconButton
      size={45}
      icon={<ShareIcon />}
      label="share-button"
      {...props}
    />
  )
}

export default ShareIconButton
