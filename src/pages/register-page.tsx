import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link as RouterLink, useNavigate } from 'react-router-dom'
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import Link from '@mui/material/Link'
import Alert from '@mui/material/Alert'
import CircularProgress from '@mui/material/CircularProgress'
import Grid from '@mui/material/Grid'
import { register as registerUser, AuthApiError } from '../services/auth-service'

const schema = z
  .object({
    firstName: z.string().min(1, 'First name is required').max(100, 'Max 100 characters'),
    lastName: z.string().min(1, 'Last name is required').max(100, 'Max 100 characters'),
    email: z.string().min(1, 'Email is required').email('Invalid email address'),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/[0-9]/, 'Password must contain at least one digit')
      .regex(/[^a-zA-Z0-9]/, 'Password must contain at least one special character'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

type FormValues = z.infer<typeof schema>

export default function RegisterPage() {
  const navigate = useNavigate()
  const [globalError, setGlobalError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) })

  const onSubmit = async (values: FormValues) => {
    setGlobalError(null)
    setSuccessMessage(null)
    try {
      await registerUser(
        values.email,
        values.password,
        values.confirmPassword,
        values.firstName,
        values.lastName
      )
      setSuccessMessage('Account created! Redirecting to login...')
      setTimeout(() => navigate('/login'), 1500)
    } catch (err) {
      if (err instanceof AuthApiError) {
        if (err.validationErrors.length > 0) {
          const fieldMap: Record<string, keyof FormValues> = {
            email: 'email',
            password: 'password',
            confirmpassword: 'confirmPassword',
            firstname: 'firstName',
            lastname: 'lastName',
          }
          err.validationErrors.forEach(({ propertyName, errorMessage }) => {
            const field = fieldMap[propertyName.toLowerCase()]
            if (field) {
              setError(field, { message: errorMessage })
            } else {
              setGlobalError(errorMessage)
            }
          })
        } else {
          setGlobalError(err.message)
        }
      } else {
        setGlobalError('An unexpected error occurred. Please try again.')
      }
    }
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'background.default',
        p: 2,
        py: 4,
      }}
    >
      <Card sx={{ width: '100%', maxWidth: 480 }} elevation={2}>
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h5" fontWeight={700} mb={0.5}>
            Create an account
          </Typography>
          <Typography variant="body2" color="text.secondary" mb={3}>
            Fill in the details below to get started
          </Typography>

          {globalError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {globalError}
            </Alert>
          )}

          {successMessage && (
            <Alert severity="success" sx={{ mb: 2 }}>
              {successMessage}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <TextField
                  {...register('firstName')}
                  label="First Name"
                  fullWidth
                  error={!!errors.firstName}
                  helperText={errors.firstName?.message}
                  autoFocus
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  {...register('lastName')}
                  label="Last Name"
                  fullWidth
                  error={!!errors.lastName}
                  helperText={errors.lastName?.message}
                />
              </Grid>
            </Grid>

            <TextField
              {...register('email')}
              label="Email"
              type="email"
              fullWidth
              margin="normal"
              error={!!errors.email}
              helperText={errors.email?.message}
              autoComplete="email"
            />

            <TextField
              {...register('password')}
              label="Password"
              type="password"
              fullWidth
              margin="normal"
              error={!!errors.password}
              helperText={errors.password?.message}
              autoComplete="new-password"
            />

            <TextField
              {...register('confirmPassword')}
              label="Confirm Password"
              type="password"
              fullWidth
              margin="normal"
              error={!!errors.confirmPassword}
              helperText={errors.confirmPassword?.message}
              autoComplete="new-password"
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={isSubmitting}
              sx={{ mt: 3, mb: 2 }}
            >
              {isSubmitting ? <CircularProgress size={24} color="inherit" /> : 'Create Account'}
            </Button>

            <Typography variant="body2" textAlign="center">
              Already have an account?{' '}
              <Link component={RouterLink} to="/login" fontWeight={600}>
                Sign in
              </Link>
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Box>
  )
}
