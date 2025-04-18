import { Form, Formik } from 'formik'
import { useTranslation } from 'react-i18next'
import { useDispatch, useSelector } from 'react-redux'
import { Link, Redirect } from 'react-router-dom'
import * as Yup from 'yup'

import { editProfile, logout } from '../../redux/authSlice'
import { pathWithCurrentView } from '../../utils/appUrl'
import { useAppHistory } from '../../utils/useAppHistory'
import { FormButtonWrapper, FormInputWrapper } from '../auth/AuthWrappers'
import { Checkbox, Input, Textarea } from '../form/FormikWrappers'
import Button from '../ui/Button'
import LabeledRow from '../ui/LabeledRow'
import LoadingIndicator from '../ui/LoadingIndicator'
import { Page } from '../ui/PageTemplate'

const formToUser = ({ email, name, bio, announcements_email, range }) => ({
  email,
  name: name || null,
  bio: bio || null,
  announcements_email: announcements_email,
  range: range,
})

const userToForm = (user) => ({
  ...user,
  name: user.name ?? '',
  bio: user.bio ?? '',
  announcements_email: user.announcements_email,
})

const AccountPage = () => {
  const dispatch = useDispatch()
  const { user, isLoading } = useSelector((state) => state.auth)
  const isLoggedIn = !!user
  const history = useAppHistory()
  const { t } = useTranslation()

  if (!isLoggedIn && !isLoading) {
    return <Redirect to={pathWithCurrentView('/users/sign_in')} />
  }

  const handleSubmit = (values) => {
    dispatch(editProfile(formToUser(values)))
  }

  return (
    <Page>
      <h1>{t('users.edit_account')}</h1>

      {user ? (
        <>
          <Formik
            enableReinitialize
            initialValues={userToForm(user)}
            validationSchema={Yup.object({
              name: Yup.string(),
              email: Yup.string().email().required(),
              bio: Yup.string(),
            })}
            onSubmit={handleSubmit}
          >
            {({ dirty, isValid, isSubmitting }) => (
              <Form>
                <FormInputWrapper>
                  <Input type="text" name="name" label={t('glossary.name')} />

                  <Input
                    type="text"
                    name="email"
                    label={t('glossary.email')}
                    disabled
                  />
                  <Textarea name="bio" label={t('users.bio')} />
                </FormInputWrapper>
                <LabeledRow
                  label={
                    <label htmlFor="announcements_email">
                      {t('users.options.announcements_email')}
                    </label>
                  }
                  left={<Checkbox name="announcements_email" />}
                  style={{ margin: '16px 0 8px 0' }}
                />
                <div style={{ margin: '16px 0' }}>
                  <Link to="/users/change-password">
                    {t('users.change_password')}
                  </Link>
                </div>
                <div style={{ margin: '16px 0' }}>
                  <Link to="/users/change-email">
                    {t('users.change_email')}
                  </Link>
                </div>

                <FormButtonWrapper>
                  <Button secondary type="reset">
                    {t('form.button.reset')}
                  </Button>
                  <Button
                    type="submit"
                    disabled={!dirty || !isValid || isSubmitting}
                  >
                    {t('users.save_changes')}
                  </Button>
                </FormButtonWrapper>
              </Form>
            )}
          </Formik>
          <br />
          <Button
            onClick={() => {
              dispatch(logout())
              history.push('/map')
            }}
          >
            {t('glossary.logout')}
          </Button>
        </>
      ) : (
        <LoadingIndicator vertical cover />
      )}
    </Page>
  )
}

export default AccountPage
