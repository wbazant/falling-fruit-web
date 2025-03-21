import styled from 'styled-components/macro'

const CloseButton = styled.button`
  background: none;
  border: none;
  color: ${({ theme }) => theme.text};
  cursor: pointer;
  padding: 0;
  position: absolute;
  right: 4px;
  top: 4px;
`

export default CloseButton
