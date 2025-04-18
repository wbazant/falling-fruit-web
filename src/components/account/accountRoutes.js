import { Route } from 'react-router-dom'

import AccountPage from './AccountPage'

const pages = [
  {
    path: '/users/edit',
    component: AccountPage,
  },
]

export const accountPages = pages

const accountRoutes = pages.map((props) => (
  <Route key={props.path} {...props} />
))
export default accountRoutes
