import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react'
import { format } from 'date-fns'

import { LeadPriorityBadge } from '@/components/leads/LeadPriorityBadge'
import { SignalStatusBadge } from '@/components/signals/SignalStatusBadge'
import { SignalTypeBadge } from '@/components/signals/SignalTypeBadge'
import { getSignalDetectedAt, getSignalLeadScore } from '@/lib/signals'
import { cn } from '@/lib/utils'
import type { Signal, SignalSortField, SortDirection } from '@/types/signal'

interface SignalsTableProps {
  signals: Signal[]
  sortField: SignalSortField
  sortDirection: SortDirection
  onSort: (field: SignalSortField) => void
  onSignalClick?: (signal: Signal) => void
}

interface Column {
  field: SignalSortField
  label: string
  className?: string
}

const COLUMNS: Column[] = [
  { field: 'title', label: 'Signal', className: 'min-w-[200px]' },
  { field: 'lead_score', label: 'Score', className: 'w-24' },
  { field: 'signal_type', label: 'Type', className: 'w-32' },
  { field: 'status', label: 'Status', className: 'w-32' },
  { field: 'priority', label: 'Priority', className: 'w-28' },
  { field: 'source_label', label: 'Source', className: 'min-w-[140px]' },
  { field: 'detected_at', label: 'Detected', className: 'w-36' },
]

function SortIcon({
  field,
  sortField,
  sortDirection,
}: {
  field: SignalSortField
  sortField: SignalSortField
  sortDirection: SortDirection
}) {
  if (field !== sortField) {
    return <ArrowUpDown className="size-3.5 opacity-40" />
  }
  return sortDirection === 'asc' ? (
    <ArrowUp className="size-3.5 text-primary" />
  ) : (
    <ArrowDown className="size-3.5 text-primary" />
  )
}

function LeadScoreCell({ score }: { score: number | null }) {
  if (score === null) {
    return <span className="text-sm text-muted">—</span>
  }

  const tone =
    score >= 80 ? 'text-primary' : score >= 50 ? 'text-foreground' : 'text-muted'

  return (
    <span className={cn('text-sm font-semibold tabular-nums', tone)}>{score}</span>
  )
}

export function SignalsTable({
  signals,
  sortField,
  sortDirection,
  onSort,
  onSignalClick,
}: SignalsTableProps) {
  return (
    <div
      className={cn(
        'overflow-hidden rounded-[var(--radius-card)] border border-border bg-surface-solid',
        'shadow-[var(--shadow-soft)]',
      )}
    >
      <div className="overflow-x-auto">
        <table className="w-full min-w-[880px] border-collapse text-left">
          <thead>
            <tr className="border-b border-border bg-section-alt">
              {COLUMNS.map((column) => (
                <th key={column.field} className={cn('px-5 py-3.5', column.className)}>
                  <button
                    type="button"
                    onClick={() => onSort(column.field)}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted transition-colors hover:text-foreground"
                  >
                    {column.label}
                    <SortIcon
                      field={column.field}
                      sortField={sortField}
                      sortDirection={sortDirection}
                    />
                  </button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border/50">
            {signals.map((signal) => {
              const detectedAt = getSignalDetectedAt(signal)

              return (
                <tr
                  key={signal.id}
                  onClick={() => onSignalClick?.(signal)}
                  className={cn(
                    'transition-colors hover:bg-foreground/[0.03]',
                    onSignalClick && 'cursor-pointer',
                    signal.status === 'new' && 'bg-primary-soft/20',
                  )}
                >
                  <td className="px-5 py-4">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-foreground">
                        {signal.title}
                      </p>
                      {signal.summary ? (
                        <p className="mt-0.5 truncate text-xs text-muted">{signal.summary}</p>
                      ) : null}
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <LeadScoreCell score={getSignalLeadScore(signal)} />
                  </td>
                  <td className="px-5 py-4">
                    <SignalTypeBadge signalType={signal.signal_type} />
                  </td>
                  <td className="px-5 py-4">
                    <SignalStatusBadge status={signal.status} />
                  </td>
                  <td className="px-5 py-4">
                    <LeadPriorityBadge priority={signal.priority} />
                  </td>
                  <td className="px-5 py-4">
                    {signal.source_label ? (
                      <span className="truncate text-sm text-foreground">{signal.source_label}</span>
                    ) : (
                      <span className="text-sm text-muted">—</span>
                    )}
                  </td>
                  <td className="px-5 py-4">
                    <time
                      dateTime={detectedAt}
                      className="text-sm tabular-nums text-muted"
                    >
                      {format(new Date(detectedAt), 'MMM d, yyyy')}
                    </time>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
