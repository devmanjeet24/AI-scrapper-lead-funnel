import { Sparkles } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'

import { AuthCarousel } from '@/components/auth/AuthCarousel'
import { AuthCursorGlow } from '@/components/auth/AuthCursorGlow'
import { AuthForms } from '@/components/auth/AuthForms'
import { cn } from '@/lib/utils'

export function AuthPage() {
  const { pathname } = useLocation()
  const initialView = pathname.includes('register') ? 'signup' : 'login'

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto flex min-h-screen w-full flex-col lg:flex-row">
        {/* Form panel — ~65% */}
        <AuthCursorGlow
          className={cn(
            'flex w-full flex-col justify-center px-6 py-8 sm:px-10 sm:py-10 lg:w-[65%] lg:px-14 lg:py-12 xl:px-16',
            'order-1',
          )}
        >
          <Link
            to="/"
            className="mb-8 inline-flex w-fit items-center gap-2.5 transition-opacity hover:opacity-80 lg:mb-10"
          >
            <div className="flex size-9 items-center justify-center rounded-xl bg-primary text-white shadow-[0_6px_20px_rgb(28_200_141/0.25)]">
              <Sparkles className="size-[18px]" />
            </div>
            <span className="text-lg font-semibold tracking-tight text-foreground">LeadFlow</span>
          </Link>

          <AuthForms key={initialView} initialView={initialView} />

          <p className="mt-8 text-xs text-muted lg:mt-10">
            © {new Date().getFullYear()} LeadFlow. All rights reserved.
          </p>
        </AuthCursorGlow>

        {/* Showcase panel — ~35%, slightly darker */}
        <div
          className={cn(
            'relative order-2 flex w-full flex-col overflow-hidden lg:w-[35%]',
            'border-t border-border/60 lg:border-t-0 lg:border-l',
            'bg-[rgb(218,230,223)] px-5 py-8 sm:px-7 sm:py-10 lg:px-8 lg:py-10',
          )}
        >
          <div
            className="pointer-events-none absolute inset-0 opacity-70"
            style={{
              backgroundImage: `
                radial-gradient(circle at 25% 15%, rgb(28 200 141 / 0.1), transparent 50%),
                radial-gradient(circle at 75% 85%, rgb(28 200 141 / 0.07), transparent 45%)
              `,
            }}
          />

          <div
            className="pointer-events-none absolute inset-0 opacity-[0.3]"
            style={{
              backgroundImage:
                'linear-gradient(rgb(28 200 141 / 0.05) 1px, transparent 1px), linear-gradient(90deg, rgb(28 200 141 / 0.05) 1px, transparent 1px)',
              backgroundSize: '28px 28px',
            }}
          />

          <div className="relative flex min-h-[420px] flex-1 flex-col sm:min-h-[480px] lg:min-h-0">
            <AuthCarousel />
          </div>
        </div>
      </div>
    </div>
  )
}
