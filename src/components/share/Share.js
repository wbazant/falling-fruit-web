import { Copy as CopyIcon } from '@styled-icons/boxicons-regular'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components/macro'

import Button from '../ui/Button'
import Modal from '../ui/Modal'

const ShareContainer = styled.div`
  display: flex;
  flex-direction: column;
  padding: 1rem;
`

const ShareTitle = styled.h3`
  margin-top: 0;
  margin-bottom: 1rem;
  color: ${({ theme }) => theme.primaryText};
`

const ShareUrlContainer = styled.div`
  display: flex;
  margin-bottom: 1rem;
`

const ShareTextArea = styled.textarea`
  flex: 1;
  padding: 0.5rem;
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: 4px;
  resize: none;
  height: 2.5rem;
  margin-right: 0.5rem;
`

const CopyButton = styled(Button)`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.5rem;

  svg {
    width: 1.2rem;
    height: 1.2rem;
  }
`

const Share = ({ isOpen, onClose }) => {
  const { t } = useTranslation()
  const [copySuccess, setCopySuccess] = useState(false)
  const currentUrl = window.location.href

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(currentUrl)
      setCopySuccess(true)
      setTimeout(() => setCopySuccess(false), 2000)
    } catch (err) {
      console.error('Failed to copy URL: ', err)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
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
        {copySuccess && <p>{t('share.copied', 'Copied to clipboard!')}</p>}
      </ShareContainer>
    </Modal>
  )
}

export default Share
