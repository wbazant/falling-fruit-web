import 'react-dropdown-tree-select/dist/styles.css'

import { useTranslation } from 'react-i18next'
import styled from 'styled-components/macro'

import { ShouldZoomIn } from '../list/ListLoading'
import { LoadingOverlay } from '../ui/LoadingIndicator'
import NonrenderTreeSelect from './NonrenderTreeSelect'

const ShouldZoomInOverlay = styled(ShouldZoomIn)`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;

  img {
    height: 70px;
  }
`

const TreeSelectContainer = styled.div`
  // For loading indicator
  position: relative;

  .toggle.expanded {
    display: none;
  }

  .dropdown-trigger.arrow.top,
  .dropdown-trigger.arrow.bottom {
    ${({ $popover }) => !$popover && `display: none`};
    border-radius: 23px;
    box-sizing: border-box;
    width: 100%;
    border: 1px solid ${({ theme }) => theme.secondaryBackground};

    ::after {
      display: none;
    }
  }

  .tag-item {
    .tag {
      background-color: ${({ theme }) => theme.transparentOrange};
      border-color: ${({ theme }) => theme.transparentOrange};
      color: ${({ theme }) => theme.orange};
      border-radius: 20px;
      padding: 0px 10px 0px 10px;
      font-size: 0.75rem;

      .tag-remove {
        display: none;
      }
    }

    .placeholder {
      color: ${({ theme }) => theme.text};
      font-weight: normal;
    }
  }

  .dropdown {
    height: 100%;
    width: 100%;

    ${({ $disabled }) => $disabled && 'opacity: 0.4;'}
  }

  .dropdown-content {
    display: flex;
    flex-direction: column;
    height: 100%;
    width: 100%;
    padding: 0 !important;
    box-shadow: none !important;
    border-top: none !important;
  }

  .search {
    align-self: center;
    width: 100% !important;
    box-sizing: border-box;
    padding: 9px 12px;
    margin-bottom: 10px;
    border: 1px solid ${({ theme }) => theme.secondaryBackground} !important;
    border-radius: 20px;
    font-family: ${({ theme }) => theme.fonts};
  }

  // TODO: this breaks the infinite scroll of react-dropdown-tree-select
  .infinite-scroll-component {
    height: 100% !important;
    max-height: calc(30vh - 60px);
    @media ${({ theme }) => theme.device.mobile} {
      max-height: calc(60vh - 60px);
    }
    border: 1px solid ${({ theme }) => theme.secondaryBackground};
    border-radius: 7px;
  }

  .react-dropdown-tree-select {
    height: 30vh;
    @media ${({ theme }) => theme.device.mobile} {
      height: 60vh;
    }
  }

  label {
    display: flex;
    align-items: center;
    font-size: 0.875rem;

    span {
      margin-left: 0.25rem;
    }
  }

  .checkbox-item {
    -webkit-appearance: none;
    -moz-appearance: none;
    appearance: none;
    outline: 0;
  }

  .checkbox-item:before {
    cursor: pointer;
    border: 3px solid ${({ theme }) => theme.orange};
    border-radius: 4px;
    content: '';
    background: ${({ theme }) => theme.transparentOrange};
    display: flex;
    width: 12px;
    height: 12px;
  }

  .checkbox-item:checked:before {
    background: url('/checkmark/checkmark.svg');
    background-color: ${({ theme }) => theme.orange};
    background-size: contain;
    background-repeat: no-repeat;
    background-position: center;
  }

  .checkbox-item:indeterminate:before {
    background: url('/checkmark/mixed_checkmark.svg');
    background-size: contain;
    background-repeat: no-repeat;
    background-position: center;
  }

  ul {
    height: 100%;
  }

  ul > div {
    height: 100%;
  }
`

const TreeSelect = ({
  data,
  loading,
  shouldZoomIn,
  onChange,
  popover,
  ...props
}) => {
  const { t } = useTranslation()
  return (
    <TreeSelectContainer $popover={popover} $disabled={loading || shouldZoomIn}>
      <NonrenderTreeSelect
        data={data}
        onChange={onChange}
        texts={{
          placeholder: t('Select a type...'),
          inlineSearchPlaceholder: t('Search for a type...'),
        }}
        showDropdown={popover ? 'default' : 'always'}
        showPartiallySelected
        keepTreeOnSearch
        keepChildrenOnSearch
        inlineSearchInput
        {...props}
      />
      {loading && <LoadingOverlay />}
      {shouldZoomIn && (
        <ShouldZoomInOverlay text="Zoom in to see type filters" />
      )}
    </TreeSelectContainer>
  )
}

export default TreeSelect