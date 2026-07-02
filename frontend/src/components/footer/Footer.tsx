import { Sparkles } from 'lucide-react'
import { Link } from 'react-router-dom'

import { cn } from '@/lib/utils'

const footerLinks = [
  { label: 'Product', href: '#product' },
  { label: 'How it works', href: '#workflow' },
  { label: 'Pricing', href: '#pricing' },
] as const

const legalLinks = [
  { label: 'Privacy', href: '#' },
  { label: 'Terms', href: '#' },
] as const

export function Footer() {
  return (
    <footer
      className={cn(
        'rounded-2xl border border-border/50 bg-surface-solid sm:rounded-3xl',
        'shadow-[0_4px_24px_rgb(45_45_45/0.05),0_1px_3px_rgb(45_45_45/0.04)]',
      )}
    >
      <div className="flex flex-col gap-8 px-4 py-8 sm:px-6 sm:py-10 lg:flex-row lg:items-center lg:justify-between">
        <div className="max-w-sm">
          <Link to="/" className="inline-flex items-center gap-2.5">
            <div className="flex size-8 items-center justify-center rounded-xl bg-primary text-white">
              <Sparkles className="size-4" />
            </div>
            <span className="text-base font-semibold tracking-tight text-foreground">
              LeadFlow
            </span>
          </Link>
          <p className="mt-3 text-sm leading-relaxed text-muted">
            AI-powered lead generation that discovers prospects, qualifies intent,
            and books meetings — automatically.
          </p>
        </div>

        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:gap-10">
          <nav aria-label="Footer">
            <ul className="flex flex-wrap gap-x-6 gap-y-2">
              {footerLinks.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-sm font-medium text-muted transition-colors hover:text-foreground"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="rounded-lg px-3.5 py-2 text-sm font-medium text-muted transition-colors hover:text-foreground"
            >
              Log in
            </Link>
            <Link
              to="/register"
              className={cn(
                'inline-flex items-center rounded-[var(--radius-button)] border border-border',
                'bg-surface-solid px-4 py-2 text-sm font-semibold text-foreground',
                'shadow-[0_2px_8px_rgb(45_45_45/0.04)] transition-shadow hover:shadow-[0_4px_16px_rgb(45_45_45/0.08)]',
              )}
            >
              Sign up
            </Link>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3 border-t border-border/60 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <p className="text-xs text-muted">
          © {new Date().getFullYear()} LeadFlow. All rights reserved.
        </p>
        <ul className="flex gap-5">
          {legalLinks.map((link) => (
            <li key={link.label}>
              <a
                href={link.href}
                className="text-xs text-muted transition-colors hover:text-foreground"
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </footer>
  )
}
