import { cn } from '@/lib/utils'
import type { ScrapeSourceType } from '@/types/signal'

const SOURCE_STYLES: Record<ScrapeSourceType, string> = {
  web: 'border-blue-200/80 bg-blue-50/80 text-blue-700',
  social: 'border-violet-200/80 bg-violet-50/80 text-violet-700',
  competitor: 'border-orange-200/80 bg-orange-50/80 text-orange-700',
  review: 'border-amber-200/80 bg-amber-50/80 text-amber-700',
  other: 'border-border bg-section-alt text-muted',
}

const SOURCE_LABELS: Record<ScrapeSourceType, string> = {
  web: 'Web',
  social: 'Social',
  competitor: 'Competitor',
  review: 'Review',
  other: 'Other',
}

interface ScrapeSourceTypeBadgeProps {
  sourceType: ScrapeSourceType
  className?: string
}

export function ScrapeSourceTypeBadge({ sourceType, className }: ScrapeSourceTypeBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium',
        SOURCE_STYLES[sourceType],
        className,
      )}
    >
      {SOURCE_LABELS[sourceType]}
    </span>
  )
}
