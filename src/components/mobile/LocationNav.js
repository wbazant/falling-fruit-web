import { Check, X } from '@styled-icons/boxicons-regular'
import { useDispatch } from 'react-redux'
import { Route, Switch } from 'react-router-dom'
import styled from 'styled-components/macro'

import { restoreLocationPosition } from '../../redux/locationSlice'
import { useAppHistory } from '../../utils/useAppHistory'
import { theme } from '../ui/GlobalStyle'
import IconButton from '../ui/IconButton'
import TopBarNav from '../ui/TopBarNav'

const Instructions = styled.span`
  margin-left: 15px;
`

const xAndCheckIcons = (xLabel, xCallback, checkLabel, checkCallback) => (
  <>
    <IconButton
      label={xLabel}
      icon={<X />}
      raised
      size={54}
      onClick={xCallback}
    />
    <IconButton
      label={checkLabel}
      icon={<Check />}
      raised
      size={54}
      color={theme.green}
      onClick={checkCallback}
    />
  </>
)
const LocationNav = () => {
  const history = useAppHistory()
  const dispatch = useDispatch()

  const handleGoBack = (event) => {
    event.stopPropagation()
    history.goBack()
  }

  return (
    <Switch>
      <Route path="/reviews/:reviewId/edit">
        {() => <TopBarNav onBack={handleGoBack} title="Editing Review" />}
      </Route>
      <Route path="/locations/:locationId/review">
        {() => <TopBarNav onBack={handleGoBack} title="Adding review" />}
      </Route>
      <Route path="/locations/:locationId/edit/details">
        {({ match }) => (
          <TopBarNav
            // we could have gotten here from the 'position' URL too
            // but going back means stopping to edit the location
            onBack={() => {
              event.stopPropagation()
              return history.push(`/locations/${match.params.locationId}`)
            }}
            title="Editing location"
          />
        )}
      </Route>
      <Route path="/locations/:locationId/edit/position">
        {({ match }) => (
          <TopBarNav
            left={
              <Instructions>Adjust location for the edited entry.</Instructions>
            }
            rightIcons={xAndCheckIcons(
              'Cancel adjust location',
              () => {
                dispatch(restoreLocationPosition())
                return history.push(
                  `/locations/${match.params.locationId}/edit/details`,
                )
              },
              'Confirm adjust location',
              () =>
                history.push(
                  `/locations/${match.params.locationId}/edit/details`,
                ),
            )}
          />
        )}
      </Route>
      <Route path="/locations/new/details">
        <TopBarNav
          onBack={() => history.push('/locations/new')}
          title="New location"
        />
      </Route>
      <Route path="/locations/new">
        <TopBarNav
          left={
            <Instructions>Choose a location for your new entry.</Instructions>
          }
          rightIcons={xAndCheckIcons(
            'Cancel choose location',
            () => history.push('/map'),
            'Confirm choose location',
            () => history.push('/locations/new/details'),
          )}
        />
      </Route>
    </Switch>
  )
}

export default LocationNav
