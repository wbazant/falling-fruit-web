import { Route } from 'react-router-dom'

import ActivityPage from './ActivityPage'
import UserActivityPage from './UserActivityPage'

const pages = [
  {
    path: '/changes/:userId',
    component: UserActivityPage,
  },
  {
    path: '/changes',
    component: ActivityPage,
  },
]

const activityRoutes = pages.map((props) => (
  <Route key={props.path} {...props} />
))
export default activityRoutes
