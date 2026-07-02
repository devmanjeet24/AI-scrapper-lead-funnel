import { format } from 'date-fns'
import { AlertTriangle, CheckCircle2, Lightbulb, Sparkles } from 'lucide-react'

import { MonitoringRecommendationBadge } from '@/components/leads/MonitoringRecommendationBadge'
import { getMonitoringAlertLevelStyle } from '@/lib/deployment'
import { cn } from '@/lib/utils'
import type { MonitoringAnalysis } from '@/types/deployment'

interface MonitoringAnalysisPanelProps {
  analysis: MonitoringAnalysis | null
}

function InsightList({
  title,
  items,
  icon: Icon,
  tone,
}: {
  title: string
  items: string[]
  icon: typeof CheckCircle2
  tone: 'neutral' | 'action'
}) {
  if (items.length === 0) return null

  const toneClasses =
    tone === 'action'
      ? 'border-primary/20 bg-primary-soft/35 text-foreground'
      : 'border-border/80 bg-section-alt/50 text-foreground'

  return (
    <section className="space-y-2">
      <h4 className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted">
        <Icon className="size-3.5" />
        {title}
      </h4>
      <ul className={cn('space-y-1.5 rounded-xl border px-3 py-2.5', toneClasses)}>
        {items.map((item) => (
          <li key={item} className="text-sm leading-relaxed">
            {item}
          </li>
        ))}
      </ul>
    </section>
  )
}

export function MonitoringAnalysisPanel({ analysis }: MonitoringAnalysisPanelProps) {
  if (!analysis) {
    return (
      <div className="rounded-xl border border-dashed border-border/80 bg-section-alt/30 px-4 py-6 text-center">
        <Sparkles className="mx-auto size-5 text-muted" />
        <p className="mt-2 text-sm font-medium text-foreground">No monitoring analysis yet</p>
        <p className="mt-1 text-xs text-muted">
          Add at least one snapshot, then run AI monitoring to get recommendations.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <MonitoringRecommendationBadge recommendation={analysis.recommendation} />
        <span className="rounded-full border border-border/80 bg-section-alt/60 px-2 py-0.5 text-[10px] font-medium text-foreground">
          Health: {analysis.health_score}
        </span>
        <span
          className={cn(
            'rounded-full border px-2 py-0.5 text-[10px] font-medium capitalize',
            getMonitoringAlertLevelStyle(analysis.alert_level),
          )}
        >
          {analysis.alert_level}
        </span>
        {analysis.analyzed_at ? (
          <span className="ml-auto text-[10px] text-muted">
            Analyzed {format(new Date(analysis.analyzed_at), 'MMM d, yyyy · h:mm a')}
          </span>
        ) : null}
      </div>

      <section className="space-y-2">
        <h4 className="text-xs font-semibold uppercase tracking-wide text-muted">Summary</h4>
        <div className="rounded-xl border border-primary/20 bg-primary-soft/40 px-4 py-3 text-sm leading-relaxed text-foreground">
          {analysis.summary}
        </div>
      </section>

      {analysis.suggested_budget_change ? (
        <section className="space-y-2">
          <h4 className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted">
            <AlertTriangle className="size-3.5 text-amber-600" />
            Budget recommendation
          </h4>
          <p className="text-sm leading-relaxed text-foreground">{analysis.suggested_budget_change}</p>
        </section>
      ) : null}

      <InsightList
        title="Key findings"
        items={analysis.key_findings}
        icon={CheckCircle2}
        tone="neutral"
      />
      <InsightList
        title="Action items"
        items={analysis.action_items}
        icon={Sparkles}
        tone="action"
      />
      <InsightList
        title="Creative suggestions"
        items={analysis.creative_suggestions}
        icon={Lightbulb}
        tone="neutral"
      />
    </div>
  )
}
