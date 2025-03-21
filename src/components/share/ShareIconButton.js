import { Link as LinkIcon } from '@styled-icons/boxicons-regular'
import styled from 'styled-components/macro'

import IconButton from '../ui/IconButton'

const StyledIconButton = styled(IconButton)`
  background-color: white;
  border-radius: 4px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
`

const ShareIconButton = (props) => (
    <StyledIconButton
      size={45}
      icon={<LinkIcon />}
      label="Share map link"
      {...props}
    />
  )

export default ShareIconButton
