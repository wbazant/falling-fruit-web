import { Form, Formik } from 'formik'
import { useTranslation } from 'react-i18next'
import { useDispatch, useSelector } from 'react-redux'
import { Redirect } from 'react-router-dom'
import * as Yup from 'yup'

import { editProfile } from '../../redux/authSlice'
import { pathWithCurrentView } from '../../utils/appUrl'
import { useAppHistory } from '../../utils/useAppHistory'
import {
  ErrorMessage,
  FormButtonWrapper,
  FormInputWrapper,
} from '../auth/AuthWrappers'
import { Checkbox, Input } from '../form/FormikWrappers'
import Button from '../ui/Button'
import LabeledRow from '../ui/LabeledRow'
import LoadingIndicator from '../ui/LoadingIndicator'
import { Page } from '../ui/PageTemplate'

const formToUser = ({ email, password, announcements_email }) => ({
  email,
  password,
  announcements_email,
})

const ChangeEmailPage = () => {
  const dispatch = useDispatch()
  const { user, isLoading } = useSelector((state) => state.auth)
  const isLoggedIn = !!user
  const { t } = useTranslation()
  const history = useAppHistory()

  if (!isLoggedIn && !isLoading) {
    return <Redirect to={pathWithCurrentView('/users/sign_in')} />
  }

  const handleSubmit = (values) => {
    dispatch(editProfile(formToUser(values)))
  }

  return (
    <Page>
      <h1>{t('users.change_email_settings')}</h1>

      {user ? (
        <>
          <Formik
            initialValues={{
              current_email: user.email,
              email: '',
              password: '',
              announcements_email: user.announcements_email,
            }}
            validationSchema={Yup.object({
              email: Yup.string().email().required(),
              password: Yup.string().required({
                key: 'form.error.missing_password',
              }),
            })}
            onSubmit={handleSubmit}
          >
            {({ errors, dirty, isValid, isSubmitting }) => (
              <Form>
                <FormInputWrapper>
                  <Input
                    name="current_email"
                    type="email"
                    label={t('users.current_email')}
                    disabled
                  />

                  <Input
                    name="email"
                    type="email"
                    label={t('users.new_email')}
                    autocomplete="email"
                  />
                  {errors.email && (
                    <ErrorMessage>
                      {t(errors.email.key, errors.email.options)}
                    </ErrorMessage>
                  )}

                  <Input
                    name="password"
                    type="password"
                    label={t('glossary.password')}
                    autocomplete="current-password"
                  />
                  {errors.password && (
                    <ErrorMessage>
                      {t(errors.password.key, errors.password.options)}
                    </ErrorMessage>
                  )}
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
                <FormButtonWrapper>
                  <Button
                    secondary
                    type="button"
                    onClick={() => history.push('/users/edit')}
                  >
                    {t('form.button.cancel')}
                  </Button>
                  <Button
                    type="submit"
                    disabled={!dirty || !isValid || isSubmitting}
                  >
                    {t('form.button.submit')}
                  </Button>
                </FormButtonWrapper>
              </Form>
            )}
          </Formik>
        </>
      ) : (
        <LoadingIndicator vertical cover />
      )}
    </Page>
  )
}

export default ChangeEmailPage
