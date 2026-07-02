import { AlertTriangle, CheckCircle2, Sparkles, XCircle } from 'lucide-react'

import { QualificationVerdictBadge } from '@/components/outreach/QualificationVerdictBadge'
import { hasVettingInsights } from '@/lib/outreach'
import type { VettingInsights } from '@/types/outreach'

interface VettingResultsPanelProps {
  insights: VettingInsights | null
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
  tone: 'positive' | 'negative'
}) {
  if (items.length === 0) return null

  const toneClasses =
    tone === 'positive'
      ? 'border-emerald-200/80 bg-emerald-50/50 text-emerald-800'
      : 'border-red-200/80 bg-red-50/50 text-red-800'

  return (
    <section className="space-y-2">
      <h4 className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted">
        <Icon className="size-3.5" />
        {title}
      </h4>
      <ul className={`space-y-1.5 rounded-xl border px-3 py-2.5 ${toneClasses}`}>
        {items.map((item) => (
          <li key={item} className="text-sm leading-relaxed">
            {item}
          </li>
        ))}
      </ul>
    </section>
  )
}

export function VettingResultsPanel({ insights }: VettingResultsPanelProps) {
  if (!hasVettingInsights(insights) || !insights) {
    return (
      <div className="rounded-xl border border-dashed border-border/80 bg-section-alt/30 px-4 py-6 text-center">
        <Sparkles className="mx-auto size-5 text-muted" />
        <p className="mt-2 text-sm font-medium text-foreground">No vetting results yet</p>
        <p className="mt-1 text-xs text-muted">
          Send a lead reply with auto-vet enabled or run AI vetting manually.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        {insights.qualification_verdict ? (
          <QualificationVerdictBadge verdict={insights.qualification_verdict} />
        ) : null}
        {insights.qualification_score !== null ? (
          <span className="rounded-full border border-border/80 bg-section-alt/60 px-2 py-0.5 text-[10px] font-medium text-foreground">
            Score: {insights.qualification_score}
          </span>
        ) : null}
      </div>

      {insights.summary ? (
        <section className="space-y-2">
          <h4 className="text-xs font-semibold uppercase tracking-wide text-muted">Summary</h4>
          <div className="rounded-xl border border-primary/20 bg-primary-soft/40 px-4 py-3 text-sm leading-relaxed text-foreground">
            {insights.summary}
          </div>
        </section>
      ) : null}

      {insights.recommended_next_step ? (
        <section className="space-y-2">
          <h4 className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted">
            <Sparkles className="size-3.5 text-primary" />
            Recommended next step
          </h4>
          <p className="text-sm leading-relaxed text-foreground">{insights.recommended_next_step}</p>
        </section>
      ) : null}

      <InsightList
        title="Buying signals"
        items={insights.buying_signals}
        icon={CheckCircle2}
        tone="positive"
      />
      <InsightList
        title="Red flags"
        items={insights.red_flags}
        icon={insights.red_flags.length > 0 ? XCircle : AlertTriangle}
        tone="negative"
      />
    </div>
  )
}
