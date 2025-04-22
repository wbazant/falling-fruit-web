import { SearchAlt2 } from '@styled-icons/boxicons-regular'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import ClearSearchButton from '../search/ClearSearch'
import Input from '../ui/Input'

const SearchContainer = styled.div`
  margin-top: 10px;
  margin-bottom: 10px;
  width: 100%;
  max-width: 300px;
`

const ActivitySearchInput = ({ value, onChange, onClear }) => {
  const { t } = useTranslation()

  return (
    <SearchContainer>
      <Input
        type="text"
        placeholder={t('common.search')}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-label={t('common.search')}
        icon={
          value === '' ? (
            <SearchAlt2 />
          ) : (
            <ClearSearchButton onClick={onClear} />
          )
        }
      />
    </SearchContainer>
  )
}

export default ActivitySearchInput
