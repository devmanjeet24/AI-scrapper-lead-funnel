import { cn } from '@/lib/utils'
import type { SignalType } from '@/types/signal'

const TYPE_STYLES: Record<SignalType, string> = {
  lead: 'border-primary/25 bg-primary-soft text-primary',
  competitor_intel: 'border-amber-200 bg-amber-50 text-amber-700',
  review: 'border-purple-200 bg-purple-50 text-purple-700',
  mention: 'border-slate-200 bg-slate-50 text-slate-700',
  hiring: 'border-blue-200 bg-blue-50 text-blue-700',
  pricing_change: 'border-orange-200 bg-orange-50 text-orange-700',
  news: 'border-cyan-200 bg-cyan-50 text-cyan-700',
  other: 'border-border bg-section-alt text-muted',
}

const TYPE_LABELS: Record<SignalType, string> = {
  lead: 'Lead',
  competitor_intel: 'Competitor',
  review: 'Review',
  mention: 'Mention',
  hiring: 'Hiring',
  pricing_change: 'Pricing',
  news: 'News',
  other: 'Other',
}

interface SignalTypeBadgeProps {
  signalType: SignalType
  className?: string
}

export function SignalTypeBadge({ signalType, className }: SignalTypeBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium',
        TYPE_STYLES[signalType],
        className,
      )}
    >
      {TYPE_LABELS[signalType]}
    </span>
  )
}
