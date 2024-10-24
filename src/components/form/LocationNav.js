import { Check, X } from '@styled-icons/boxicons-regular'
import { Route, Switch } from 'react-router-dom'
import styled from 'styled-components/macro'

import { useAppHistory } from '../../utils/useAppHistory'
import { theme } from '../ui/GlobalStyle'
import IconButton from '../ui/IconButton'
import TopBarNav from '../ui/TopBarNav'

const Instructions = styled.span`
  margin-left: 15px;
`

const LocationNav = () => {
  const history = useAppHistory()

  return (
    <Switch>
      <Route path="/reviews/:id/edit">
        {() => (
          <TopBarNav
            onBack={(event) => {
              event.stopPropagation()
              return history.goBack()
            }}
            title="Editing Review"
          />
        )}
      </Route>
      <Route path="/locations/:id/review">
        {() => (
          <TopBarNav
            onBack={(event) => {
              event.stopPropagation()
              return history.goBack()
            }}
            title="Adding review"
          />
        )}
      </Route>
      <Route path="/locations/:id/edit">
        {() => (
          <TopBarNav
            onBack={(event) => {
              event.stopPropagation()
              return history.goBack()
            }}
            title="Editing location"
          />
        )}
      </Route>
      <Route path="/locations/new/details">
        <TopBarNav
          onBack={() => history.push('/locations/new')}
          title="New location"
        />
      </Route>
      <Route>
        <TopBarNav
          left={
            <Instructions>Choose a location for your new entry.</Instructions>
          }
          rightIcons={
            <>
              <IconButton
                label="Cancel choose location"
                icon={<X />}
                raised
                size={54}
                onClick={() => {
                  history.push('/map')
                }}
              />
              <IconButton
                label="Confirm choose location"
                icon={<Check />}
                raised
                size={54}
                color={theme.green}
                onClick={() => {
                  history.push('/locations/new/details')
                }}
              />
            </>
          }
        />
      </Route>
    </Switch>
  )
}

export default LocationNav
