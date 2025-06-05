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

  ${({ $isMobileOrEmbed }) =>
    $isMobileOrEmbed &&
    `
    padding-inline: 1em;

    textarea {
      height: 100px;

      @media (max-device-height: 600px) {
        height: 50px;
      }
    }
  `}

  ${({ $isMobileNotEmbed }) =>
    $isMobileNotEmbed &&
    `
    margin-block-start: ${NAVIGATION_BAR_HEIGHT_PX}px;
  `}
`

export const StyledForm = ({ children, ...props }) => {
  const isEmbed = useIsEmbed()
  const isMobile = useIsMobile()

  const isMobileOrEmbed = isMobile || isEmbed
  const isMobileNotEmbed = isMobile && !isEmbed

  return (
    <StyledFormDiv
      $isMobileOrEmbed={isMobileOrEmbed}
      $isMobileNotEmbed={isMobileNotEmbed}
      {...props}
    >
      {children}
    </StyledFormDiv>
  )
}
