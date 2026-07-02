import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react'
import { format } from 'date-fns'

import { ScrapeJobStatusBadge } from '@/components/scrape-jobs/ScrapeJobStatusBadge'
import { ScrapeSourceTypeBadge } from '@/components/scrape-jobs/ScrapeSourceTypeBadge'
import { cn } from '@/lib/utils'
import type { ScrapeJob, ScrapeJobSortField, SortDirection } from '@/types/scrape'

interface ScrapeJobsTableProps {
  jobs: ScrapeJob[]
  sortField: ScrapeJobSortField
  sortDirection: SortDirection
  onSort: (field: ScrapeJobSortField) => void
  onJobClick?: (job: ScrapeJob) => void
}

interface Column {
  field: ScrapeJobSortField
  label: string
  className?: string
}

const COLUMNS: Column[] = [
  { field: 'name', label: 'Job', className: 'min-w-[180px]' },
  { field: 'source_type', label: 'Source', className: 'w-32' },
  { field: 'status', label: 'Status', className: 'w-32' },
  { field: 'target_url', label: 'Target URL', className: 'min-w-[200px]' },
  { field: 'last_run_at', label: 'Last Run', className: 'w-36' },
  { field: 'created_at', label: 'Created', className: 'w-36' },
]

function SortIcon({
  field,
  sortField,
  sortDirection,
}: {
  field: ScrapeJobSortField
  sortField: ScrapeJobSortField
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

export function ScrapeJobsTable({
  jobs,
  sortField,
  sortDirection,
  onSort,
  onJobClick,
}: ScrapeJobsTableProps) {
  return (
    <div
      className={cn(
        'overflow-hidden rounded-[var(--radius-card)] border border-border bg-surface-solid',
        'shadow-[var(--shadow-soft)]',
      )}
    >
      <div className="overflow-x-auto">
        <table className="w-full min-w-[900px] border-collapse text-left">
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
            {jobs.map((job) => (
              <tr
                key={job.id}
                onClick={() => onJobClick?.(job)}
                className={cn(
                  'transition-colors hover:bg-foreground/[0.03]',
                  onJobClick && 'cursor-pointer',
                  job.status === 'active' && job.is_active && 'bg-primary-soft/10',
                )}
              >
                <td className="px-5 py-4">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-foreground">{job.name}</p>
                    {job.description ? (
                      <p className="mt-0.5 truncate text-xs text-muted">{job.description}</p>
                    ) : null}
                  </div>
                </td>
                <td className="px-5 py-4">
                  <ScrapeSourceTypeBadge sourceType={job.source_type} />
                </td>
                <td className="px-5 py-4">
                  <ScrapeJobStatusBadge status={job.status} />
                </td>
                <td className="px-5 py-4">
                  <p className="truncate text-sm text-muted">{job.target_url}</p>
                </td>
                <td className="px-5 py-4">
                  {job.last_run_at ? (
                    <time
                      dateTime={job.last_run_at}
                      className="text-sm tabular-nums text-muted"
                    >
                      {format(new Date(job.last_run_at), 'MMM d, yyyy')}
                    </time>
                  ) : (
                    <span className="text-sm text-muted">Never</span>
                  )}
                </td>
                <td className="px-5 py-4">
                  <time
                    dateTime={job.created_at}
                    className="text-sm tabular-nums text-muted"
                  >
                    {format(new Date(job.created_at), 'MMM d, yyyy')}
                  </time>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
