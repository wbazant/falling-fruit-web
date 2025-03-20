import { Link as LinkIcon } from '@styled-icons/boxicons-regular'

import IconButton from '../ui/IconButton'

const ShareIconButton = (props) => {
  console.log(props)
  return (
    <IconButton size={45} icon={<LinkIcon />} label="link-button" {...props} />
  )
}

export default ShareIconButton
