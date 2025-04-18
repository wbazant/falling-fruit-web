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
import { Input } from '../form/FormikWrappers'
import Button from '../ui/Button'
import LoadingIndicator from '../ui/LoadingIndicator'
import { Page } from '../ui/PageTemplate'

const formToUser = ({ new_password, password_confirmation }) => ({
  password: new_password || null,
  password_confirmation: password_confirmation || null,
})

const ChangePasswordPage = () => {
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
      <h1>{t('users.change_password')}</h1>

      {user ? (
        <>
          <Formik
            initialValues={{
              new_password: '',
              new_password_confirm: '',
              password: '',
            }}
            validationSchema={Yup.object({
              new_password: Yup.string().min(6).required(),
              new_password_confirm: Yup.string()
                .oneOf([Yup.ref('new_password')])
                .required(),
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
                    name="new_password"
                    type="password"
                    label={t('users.new_password')}
                    autocomplete="new-password"
                  />
                  {errors.new_password && (
                    <ErrorMessage>
                      {errors.new_password.key === 'form.error.confirmation' &&
                        t('form.error.confirmation')}
                      {errors.new_password.key === 'form.error.too_short' &&
                        t('form.error.too_short', {
                          min: errors.new_password.options.min,
                        })}
                      {errors.new_password.key ===
                        'form.error.missing_password' &&
                        t('form.error.missing_password')}
                    </ErrorMessage>
                  )}

                  <Input
                    name="new_password_confirm"
                    type="password"
                    label={t('users.new_password_confirmation')}
                    autocomplete="new-password"
                  />
                  {errors.new_password_confirm && (
                    <ErrorMessage>
                      {t(
                        errors.new_password_confirm.key,
                        errors.new_password_confirm.options,
                      )}
                    </ErrorMessage>
                  )}

                  <Input
                    invalidWhenUntouched
                    name="password"
                    type="password"
                    label={t('users.current_password')}
                  />
                  {errors.password && (
                    <ErrorMessage>
                      {t(errors.password.key, errors.password.options)}
                    </ErrorMessage>
                  )}
                </FormInputWrapper>
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

export default ChangePasswordPage
