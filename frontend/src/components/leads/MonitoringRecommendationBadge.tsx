import { cn } from '@/lib/utils'
import { getMonitoringRecommendationLabel } from '@/lib/deployment'
import type { MonitoringRecommendation } from '@/types/deployment'

const RECOMMENDATION_STYLES: Record<MonitoringRecommendation, string> = {
  continue: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  optimize: 'border-blue-200 bg-blue-50 text-blue-700',
  pause: 'border-amber-200 bg-amber-50 text-amber-800',
  scale: 'border-violet-200 bg-violet-50 text-violet-700',
  investigate: 'border-orange-200 bg-orange-50 text-orange-800',
}

interface MonitoringRecommendationBadgeProps {
  recommendation: MonitoringRecommendation
  className?: string
}

export function MonitoringRecommendationBadge({
  recommendation,
  className,
}: MonitoringRecommendationBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium',
        RECOMMENDATION_STYLES[recommendation],
        className,
      )}
    >
      {getMonitoringRecommendationLabel(recommendation)}
    </span>
  )
}
