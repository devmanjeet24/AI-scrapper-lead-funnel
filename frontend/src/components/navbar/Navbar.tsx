import { ChevronDown, Sparkles } from 'lucide-react'
import { Link } from 'react-router-dom'

import { cn } from '@/lib/utils'

const navLinks = [
  { label: 'Product', hasDropdown: true },
  { label: 'How it works', hasDropdown: false },
  { label: 'Pricing', hasDropdown: false },
  { label: 'Resources', hasDropdown: true },
] as const

export function Navbar() {
  return (
    <header
      className={cn(
        'rounded-2xl border border-border/50 bg-surface-solid px-4 py-3.5 sm:rounded-3xl sm:px-6 sm:py-4',
        'shadow-[0_4px_24px_rgb(45_45_45/0.05),0_1px_3px_rgb(45_45_45/0.04)]',
      )}
    >
      <nav className="flex items-center justify-between gap-4">
        <Link to="/" className="flex shrink-0 items-center gap-2.5">
          <div className="flex size-8 items-center justify-center rounded-xl bg-primary text-white sm:size-9">
            <Sparkles className="size-4 sm:size-[18px]" />
          </div>
          <span className="text-base font-semibold tracking-tight text-foreground sm:text-lg">
            LeadFlow
          </span>
        </Link>

        <ul className="hidden items-center gap-1 lg:flex">
          {navLinks.map((link) => (
            <li key={link.label}>
              <a
                href="#"
                className="inline-flex items-center gap-1 rounded-lg px-3.5 py-2 text-sm font-medium text-muted transition-colors hover:bg-primary-soft hover:text-foreground"
              >
                {link.label}
                {link.hasDropdown ? (
                  <ChevronDown className="size-3.5 opacity-60" />
                ) : null}
              </a>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            to="/login"
            className="hidden rounded-lg px-3.5 py-2 text-sm font-medium text-muted transition-colors hover:text-foreground sm:inline-flex"
          >
            Log in
          </Link>
          <Link
            to="/register"
            className={cn(
              'inline-flex items-center rounded-[var(--radius-button)] border border-border',
              'bg-surface-solid px-4 py-2 text-sm font-semibold text-foreground sm:px-5 sm:py-2.5',
              'shadow-[0_2px_8px_rgb(45_45_45/0.04)] transition-shadow hover:shadow-[0_4px_16px_rgb(45_45_45/0.08)]',
            )}
          >
            Sign up
          </Link>
        </div>
      </nav>
    </header>
  )
}
