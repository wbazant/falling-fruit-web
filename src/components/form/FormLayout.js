import styled from 'styled-components/macro'

import { NAVIGATION_BAR_HEIGHT_PX } from '../../constants/mobileLayout'
import { useIsEmbed, useIsMobile } from '../../utils/useBreakpoint'

export const ProgressButtons = styled.div`
  margin-block-start: 16px;
  margin-block-end: 16px;
  text-align: center;

  button {
    width: 110px;

    &:not(:last-child) {
      margin-inline-end: 12px;
    }
  }
`

const StyledFormDiv = styled.div`
  box-sizing: border-box;
  width: 100%;
  height: 100%;
  padding: 0 10px;
  overflow: auto;

  ${({ $isMobile, $isEmbed }) =>
    ($isMobile || $isEmbed) &&
    `
    padding-inline: 1em;

    textarea {
      height: 100px;

      @media (max-device-height: 600px) {
        height: 50px;
      }
    }
  `}

  ${({ $isMobile, $isEmbed }) =>
    $isMobile &&
    !$isEmbed &&
    `
    margin-block-start: ${NAVIGATION_BAR_HEIGHT_PX}px;
  `}
`

export const StyledForm = ({ children, ...props }) => {
  const isEmbed = useIsEmbed()
  const isMobile = useIsMobile()

  return (
    <StyledFormDiv $isMobile={isMobile} $isEmbed={isEmbed} {...props}>
      {children}
    </StyledFormDiv>
  )
}
