import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react'
import { format } from 'date-fns'

import { LeadPriorityBadge } from '@/components/leads/LeadPriorityBadge'
import { LeadStatusBadge } from '@/components/leads/LeadStatusBadge'
import { getLeadCompany, getLeadSourceSignal } from '@/lib/leads'
import { cn } from '@/lib/utils'
import type { Lead, LeadSortField, SortDirection } from '@/types/lead'

interface LeadsTableProps {
  leads: Lead[]
  sortField: LeadSortField
  sortDirection: SortDirection
  onSort: (field: LeadSortField) => void
}

interface Column {
  field: LeadSortField
  label: string
  className?: string
}

const COLUMNS: Column[] = [
  { field: 'title', label: 'Company', className: 'min-w-[180px]' },
  { field: 'lead_score', label: 'Lead Score', className: 'w-28' },
  { field: 'status', label: 'Status', className: 'w-32' },
  { field: 'source_label', label: 'Source Signal', className: 'min-w-[160px]' },
  { field: 'priority', label: 'Priority', className: 'w-28' },
  { field: 'created_at', label: 'Created Date', className: 'w-36' },
]

function SortIcon({
  field,
  sortField,
  sortDirection,
}: {
  field: LeadSortField
  sortField: LeadSortField
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

export function LeadsTable({ leads, sortField, sortDirection, onSort }: LeadsTableProps) {
  return (
    <div
      className={cn(
        'overflow-hidden rounded-[var(--radius-card)] border border-border/70 bg-surface-solid',
        'shadow-[var(--shadow-soft)]',
      )}
    >
      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] border-collapse text-left">
          <thead>
            <tr className="border-b border-border/60 bg-section-alt/60">
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
            {leads.map((lead) => {
              const sourceSignal = getLeadSourceSignal(lead)

              return (
                <tr
                  key={lead.id}
                  className="transition-colors hover:bg-primary-soft/30"
                >
                  <td className="px-5 py-4">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-foreground">
                        {getLeadCompany(lead)}
                      </p>
                      {lead.summary ? (
                        <p className="mt-0.5 truncate text-xs text-muted">{lead.summary}</p>
                      ) : null}
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <LeadScoreCell score={lead.lead_score} />
                  </td>
                  <td className="px-5 py-4">
                    <LeadStatusBadge status={lead.status} />
                  </td>
                  <td className="px-5 py-4">
                    {sourceSignal ? (
                      <span className="text-sm text-foreground">{sourceSignal}</span>
                    ) : (
                      <span className="text-sm text-muted">—</span>
                    )}
                  </td>
                  <td className="px-5 py-4">
                    <LeadPriorityBadge priority={lead.priority} />
                  </td>
                  <td className="px-5 py-4">
                    <time
                      dateTime={lead.created_at}
                      className="text-sm tabular-nums text-muted"
                    >
                      {format(new Date(lead.created_at), 'MMM d, yyyy')}
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
