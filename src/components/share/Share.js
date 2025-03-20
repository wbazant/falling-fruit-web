import { Copy as CopyIcon } from '@styled-icons/boxicons-regular'
import { useTranslation } from 'react-i18next'
import { toast } from 'react-toastify'
import styled from 'styled-components/macro'

import Button from '../ui/Button'

const ShareContainer = styled.div`
  display: flex;
  flex-direction: column;
`

const ShareTitle = styled.h3`
  font-size: 0.875rem;
  font-weight: bold;
  color: ${({ theme }) => theme.secondaryText};
  margin-top: 1.25em;
  margin-bottom: 0.5em;
  @media ${({ theme }) => theme.device.mobile} {
    margin-top: 0em;
  }
`

const ShareUrlContainer = styled.div`
  display: flex;
  margin-bottom: 1rem;
  align-items: center;
`

const ShareTextArea = styled.textarea`
  flex: 1;
  padding: 0.5rem;
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: 4px;
  resize: none;
  height: 38px; /* Fixed height to match button */
  margin-right: 0.5rem;
  vertical-align: middle;
`

const CopyButton = styled(Button)`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.5rem;
  height: 38px; /* Fixed height to match textarea */
  align-self: center;

  svg {
    width: 1.2rem;
    height: 1.2rem;
  }
`

const Share = () => {
  const { t } = useTranslation()
  const currentUrl = window.location.href

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(currentUrl)
      toast.success(t('share.copied', 'Copied to clipboard!'))
    } catch (err) {
      console.error('Failed to copy URL: ', err)
      toast.error(t('share.copyFailed', 'Failed to copy URL'))
    }
  }

  return (
    <ShareContainer>
      <ShareTitle>{t('share.title', 'Share this view')}</ShareTitle>
      <ShareUrlContainer>
        <ShareTextArea
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
