import { Route } from 'react-router-dom'

import ActivityPage from './ActivityPage'
import UserActivityPage from './UserActivityPage'

const pages = [
  {
    path: '/changes',
    component: ActivityPage,
  },
  {
    path: '/changes/:userId',
    component: UserActivityPage,
  },
]

const activityRoutes = pages.map((props) => (
  <Route key={props.path} {...props} />
))
export default activityRoutes
