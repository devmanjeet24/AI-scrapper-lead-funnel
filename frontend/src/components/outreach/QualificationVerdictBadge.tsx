import { cn } from '@/lib/utils'
import { formatQualificationVerdict } from '@/lib/outreach'
import type { QualificationVerdict } from '@/types/outreach'

const VERDICT_STYLES: Record<QualificationVerdict, string> = {
  qualified: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  needs_more_info: 'border-amber-200 bg-amber-50 text-amber-700',
  disqualified: 'border-red-200 bg-red-50 text-red-700',
  handoff: 'border-violet-200 bg-violet-50 text-violet-700',
}

const VERDICT_LABELS: Record<QualificationVerdict, string> = {
  qualified: 'Qualified',
  needs_more_info: 'Needs More Info',
  disqualified: 'Disqualified',
  handoff: 'Handoff',
}

interface QualificationVerdictBadgeProps {
  verdict: QualificationVerdict
  className?: string
}

export function QualificationVerdictBadge({ verdict, className }: QualificationVerdictBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium capitalize',
        VERDICT_STYLES[verdict],
        className,
      )}
    >
      {VERDICT_LABELS[verdict] ?? formatQualificationVerdict(verdict)}
    </span>
  )
}
