import { ListUl } from '@styled-icons/boxicons-regular'
import { Cog, MapAlt, UserCircle } from '@styled-icons/boxicons-solid'
import { useTranslation } from 'react-i18next'

import { authPages } from '../auth/authRoutes'

const DEFAULT_TAB = 1 // Map

const useTabs = () => {
  const { t } = useTranslation()
  return [
    {
      paths: ['/settings'],
      icon: <Cog />,
      label: t('settings'),
    },
    {
      paths: ['/map'],
      icon: <MapAlt />,
      label: t('glossary.map'),
    },
    {
      paths: ['/list'],
      icon: <ListUl />,
      label: t('glossary.list'),
    },
    {
      paths: authPages.map((route) => route.path),
      icon: <UserCircle />,
      label: t('glossary.account'),
    },
  ]
}

export { DEFAULT_TAB, useTabs }
