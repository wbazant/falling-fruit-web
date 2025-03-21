import { Copy as CopyIcon } from '@styled-icons/boxicons-regular'
import { useTranslation } from 'react-i18next'
import { useDispatch, useSelector } from 'react-redux'
import { toast } from 'react-toastify'
import styled from 'styled-components/macro'

import { closeShare } from '../../redux/shareSlice'
import Button from '../ui/Button'
import Input from '../ui/Input'

const ShareContainer = styled.div`
  display: flex;
  flex-direction: column;
`

const ShareTitle = styled.h3`
  font-size: 0.875rem;
  font-weight: bold;
  color: ${({ theme }) => theme.secondaryText};
  padding-top: 1em;
  margin-bottom: 0.5em;
  @media ${({ theme }) => theme.device.mobile} {
    margin-top: 0em;
  }
`

const ShareUrlContainer = styled.div`
  display: flex;
  align-items: center;
`

const ShareInput = styled(Input)`
  flex: 1;
  padding: 0.6rem;
  border: 1px solid ${({ theme }) => theme.border};
  margin-right: 0.5rem;
  vertical-align: middle;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`

const CopyButton = styled(Button)`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.5rem;
  align-self: center;

  svg {
    width: 1.2rem;
    height: 1.2rem;
  }
`

const Share = () => {
  const { t } = useTranslation()
  const dispatch = useDispatch()
  const mapType = useSelector((state) => state.settings.mapType)

  // Create URL with mapType parameter
  const url = new URL(window.location.href)
  url.searchParams.set('mapType', mapType)
  const currentUrl = url.toString()

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(currentUrl)
      toast.success(t('share.url_copied'))
      dispatch(closeShare())
    } catch (err) {
      toast.error(t('share.url_copy_failed'))
    }
  }

  return (
    <ShareContainer>
      <ShareTitle>{t('share.title')}</ShareTitle>
      <ShareUrlContainer>
        <ShareInput
          type="text"
          value={currentUrl}
          readOnly
          onClick={(e) => e.target.select()}
        />
        <CopyButton onClick={handleCopy}>
          <CopyIcon />
        </CopyButton>
      </ShareUrlContainer>
    </ShareContainer>
  )
}

export default Share
