import { zodResolver } from '@hookform/resolvers/zod'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowLeft, Eye, EyeOff, Loader2 } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useSearchParams } from 'react-router-dom'
import { toast } from 'sonner'
import { z } from 'zod'

import { useAuth } from '@/hooks/useAuth'
import { PASSWORD_HINT, passwordSchema } from '@/lib/password'
import { cn } from '@/lib/utils'

type AuthView = 'login' | 'signup' | 'forgot'

const ease = [0.22, 1, 0.36, 1] as const

const loginSchema = z.object({
  email: z.string().email('Enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
})

const signupSchema = z
  .object({
    workspaceName: z
      .string()
      .min(2, 'Workspace name must be at least 2 characters')
      .max(255, 'Workspace name must be at most 255 characters')
      .refine((value) => value.trim().length > 0, {
        message: 'Workspace name must not be only spaces',
      }),
    fullName: z
      .string()
      .min(2, 'Full name must be at least 2 characters')
      .max(255, 'Full name must be at most 255 characters')
      .refine((value) => value === value.trim(), {
        message: 'Full name must not have leading or trailing spaces',
      })
      .refine((value) => value.trim().length > 0, {
        message: 'Full name must not be only spaces',
      }),
    email: z.string().email('Enter a valid email address'),
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

const forgotSchema = z.object({
  email: z.string().email('Enter a valid email address'),
})

type LoginValues = z.infer<typeof loginSchema>
type SignupValues = z.infer<typeof signupSchema>
type ForgotValues = z.infer<typeof forgotSchema>

function FieldLabel({ children, htmlFor }: { children: React.ReactNode; htmlFor: string }) {
  return (
    <label htmlFor={htmlFor} className="text-sm font-medium text-foreground">
      {children}
    </label>
  )
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null
  return <p className="text-xs text-red-600">{message}</p>
}

function TextInput({
  id,
  type = 'text',
  placeholder,
  error,
  registration,
}: {
  id: string
  type?: string
  placeholder: string
  error?: string
  registration: ReturnType<ReturnType<typeof useForm>['register']>
}) {
  return (
    <div className="space-y-1.5">
      <input
        id={id}
        type={type}
        placeholder={placeholder}
        className={cn(
          'w-full rounded-xl border bg-surface-solid px-4 py-3 text-sm text-foreground',
          'placeholder:text-muted/60 outline-none transition-all duration-200',
          'focus:border-primary/40 focus:ring-2 focus:ring-primary/15',
          error ? 'border-red-300' : 'border-border hover:border-primary/25',
        )}
        {...registration}
      />
      <FieldError message={error} />
    </div>
  )
}

function PasswordInput({
  id,
  placeholder,
  error,
  registration,
}: {
  id: string
  placeholder: string
  error?: string
  registration: ReturnType<ReturnType<typeof useForm>['register']>
}) {
  const [visible, setVisible] = useState(false)

  return (
    <div className="space-y-1.5">
      <div className="relative">
        <input
          id={id}
          type={visible ? 'text' : 'password'}
          placeholder={placeholder}
          className={cn(
            'w-full rounded-xl border bg-surface-solid px-4 py-3 pr-10 text-sm text-foreground',
            'placeholder:text-muted/60 outline-none transition-all duration-200',
            'focus:border-primary/40 focus:ring-2 focus:ring-primary/15',
            error ? 'border-red-300' : 'border-border hover:border-primary/25',
          )}
          {...registration}
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          className="absolute top-1/2 right-3 -translate-y-1/2 text-muted transition-colors hover:text-foreground"
          aria-label={visible ? 'Hide password' : 'Show password'}
        >
          {visible ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
        </button>
      </div>
      <FieldError message={error} />
    </div>
  )
}

function SubmitButton({ children, loading }: { children: React.ReactNode; loading?: boolean }) {
  return (
    <button
      type="submit"
      disabled={loading}
      className={cn(
        'flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3',
        'text-sm font-semibold text-white shadow-[0_8px_24px_rgb(28_200_141/0.28)]',
        'transition-all duration-200 hover:brightness-105 hover:shadow-[0_12px_32px_rgb(28_200_141/0.35)]',
        'disabled:pointer-events-none disabled:opacity-70',
      )}
    >
      {loading ? <Loader2 className="size-4 animate-spin" /> : null}
      {children}
    </button>
  )
}

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 72 : -72,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction > 0 ? -72 : 72,
    opacity: 0,
  }),
}

function AuthModeTabs({
  active,
  onChange,
}: {
  active: 'login' | 'signup'
  onChange: (mode: 'login' | 'signup') => void
}) {
  const tabs = [
    { id: 'login' as const, label: 'Sign In' },
    { id: 'signup' as const, label: 'Sign Up' },
  ]

  return (
    <div className="relative flex rounded-xl border border-border/80 bg-section-alt/60 p-1">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          onClick={() => onChange(tab.id)}
          className={cn(
            'relative flex-1 rounded-lg py-2.5 text-sm font-semibold transition-colors duration-200',
            active === tab.id ? 'text-foreground' : 'text-muted hover:text-foreground',
          )}
        >
          {active === tab.id ? (
            <motion.span
              layoutId="auth-tab-indicator"
              className="absolute inset-0 rounded-lg bg-surface-solid shadow-[0_2px_10px_rgb(45_45_45/0.06)]"
              transition={{ type: 'spring', stiffness: 420, damping: 34 }}
            />
          ) : null}
          <span className="relative z-10">{tab.label}</span>
        </button>
      ))}
    </div>
  )
}

interface AuthFormsProps {
  initialView?: AuthView
}

export function AuthForms({ initialView = 'login' }: AuthFormsProps) {
  const [view, setView] = useState<AuthView>(initialView === 'signup' ? 'signup' : 'login')
  const [direction, setDirection] = useState(0)
  const [loading, setLoading] = useState(false)
  const [searchParams] = useSearchParams()
  const { login, register } = useAuth()

  const redirectTo = searchParams.get('redirect')
    ? decodeURIComponent(searchParams.get('redirect')!)
    : '/dashboard'

  const loginForm = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  })

  const signupForm = useForm<SignupValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      workspaceName: '',
      fullName: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  })

  const forgotForm = useForm<ForgotValues>({
    resolver: zodResolver(forgotSchema),
    defaultValues: { email: '' },
  })

  const switchView = (next: AuthView) => {
    if (next === 'login' || next === 'signup') {
      setDirection(next === 'signup' ? 1 : -1)
    } else {
      setDirection(1)
    }
    setView(next)
  }

  const onLogin = async (data: LoginValues) => {
    setLoading(true)
    try {
      await login(data, redirectTo)
      toast.success('Welcome back!')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to sign in.')
    } finally {
      setLoading(false)
    }
  }

  const onSignup = async (data: SignupValues) => {
    setLoading(true)
    try {
      await register(
        {
          organization_name: data.workspaceName.trim(),
          full_name: data.fullName.trim(),
          email: data.email,
          password: data.password,
        },
        redirectTo,
      )
      toast.success('Workspace created! Welcome to LeadFlow.')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to create account.')
    } finally {
      setLoading(false)
    }
  }

  const onForgot = async (_data: ForgotValues) => {
    setLoading(true)
    await new Promise((r) => setTimeout(r, 800))
    setLoading(false)
    toast.success('Reset link sent! Check your inbox.')
    switchView('login')
  }

  const titles: Record<AuthView, { heading: string; sub: string }> = {
    login: {
      heading: 'Welcome back',
      sub: 'Sign in to your LeadFlow workspace',
    },
    signup: {
      heading: 'Create your workspace',
      sub: 'Set up your workspace and start turning signals into pipeline',
    },
    forgot: {
      heading: 'Reset your password',
      sub: "We'll send a reset link to your email",
    },
  }

  return (
    <div className="flex w-full max-w-[560px] flex-col gap-6">
      {view !== 'forgot' ? (
        <AuthModeTabs
          active={view}
          onChange={(mode) => switchView(mode)}
        />
      ) : null}

      <AnimatePresence mode="wait" custom={direction}>
        <motion.div
          key={view}
          custom={direction}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.38, ease }}
          className="space-y-6"
        >
          <div className="space-y-1.5">
            {view === 'forgot' ? (
              <button
                type="button"
                onClick={() => switchView('login')}
                className="mb-2 inline-flex items-center gap-1.5 text-sm font-medium text-muted transition-colors hover:text-foreground"
              >
                <ArrowLeft className="size-3.5" />
                Back to sign in
              </button>
            ) : null}
            <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-[1.65rem]">
              {titles[view].heading}
            </h1>
            <p className="text-sm text-muted">{titles[view].sub}</p>
          </div>

          {view === 'login' ? (
            <form onSubmit={loginForm.handleSubmit(onLogin)} className="space-y-4">
              <div className="space-y-1.5">
                <FieldLabel htmlFor="login-email">Email</FieldLabel>
                <TextInput
                  id="login-email"
                  type="email"
                  placeholder="you@company.com"
                  error={loginForm.formState.errors.email?.message}
                  registration={loginForm.register('email')}
                />
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <FieldLabel htmlFor="login-password">Password</FieldLabel>
                  <button
                    type="button"
                    onClick={() => switchView('forgot')}
                    className="text-xs font-medium text-primary transition-colors hover:text-primary/80"
                  >
                    Forgot password?
                  </button>
                </div>
                <PasswordInput
                  id="login-password"
                  placeholder="••••••••"
                  error={loginForm.formState.errors.password?.message}
                  registration={loginForm.register('password')}
                />
              </div>
              <SubmitButton loading={loading}>Sign in</SubmitButton>
            </form>
          ) : null}

          {view === 'signup' ? (
            <form onSubmit={signupForm.handleSubmit(onSignup)} className="space-y-4">
              <div className="space-y-1.5">
                <FieldLabel htmlFor="signup-workspace">Workspace name</FieldLabel>
                <TextInput
                  id="signup-workspace"
                  placeholder="Acme Sales"
                  error={signupForm.formState.errors.workspaceName?.message}
                  registration={signupForm.register('workspaceName')}
                />
              </div>
              <div className="space-y-1.5">
                <FieldLabel htmlFor="signup-full-name">Full name</FieldLabel>
                <TextInput
                  id="signup-full-name"
                  placeholder="Alex Rivera"
                  error={signupForm.formState.errors.fullName?.message}
                  registration={signupForm.register('fullName')}
                />
              </div>
              <div className="space-y-1.5">
                <FieldLabel htmlFor="signup-email">Work email</FieldLabel>
                <TextInput
                  id="signup-email"
                  type="email"
                  placeholder="you@company.com"
                  error={signupForm.formState.errors.email?.message}
                  registration={signupForm.register('email')}
                />
              </div>
              <div className="space-y-1.5">
                <FieldLabel htmlFor="signup-password">Password</FieldLabel>
                <PasswordInput
                  id="signup-password"
                  placeholder="Min. 8 characters"
                  error={signupForm.formState.errors.password?.message}
                  registration={signupForm.register('password')}
                />
                <p className="text-xs text-muted">{PASSWORD_HINT}</p>
              </div>
              <div className="space-y-1.5">
                <FieldLabel htmlFor="signup-confirm">Confirm password</FieldLabel>
                <PasswordInput
                  id="signup-confirm"
                  placeholder="Repeat password"
                  error={signupForm.formState.errors.confirmPassword?.message}
                  registration={signupForm.register('confirmPassword')}
                />
              </div>
              <SubmitButton loading={loading}>Create workspace</SubmitButton>
              <p className="text-center text-xs text-muted">
                By signing up, you agree to our{' '}
                <a href="#" className="font-medium text-primary hover:underline">
                  Terms
                </a>{' '}
                and{' '}
                <a href="#" className="font-medium text-primary hover:underline">
                  Privacy Policy
                </a>
              </p>
            </form>
          ) : null}

          {view === 'forgot' ? (
            <form onSubmit={forgotForm.handleSubmit(onForgot)} className="space-y-4">
              <div className="space-y-1.5">
                <FieldLabel htmlFor="forgot-email">Email</FieldLabel>
                <TextInput
                  id="forgot-email"
                  type="email"
                  placeholder="you@company.com"
                  error={forgotForm.formState.errors.email?.message}
                  registration={forgotForm.register('email')}
                />
              </div>
              <SubmitButton loading={loading}>Send reset link</SubmitButton>
            </form>
          ) : null}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
