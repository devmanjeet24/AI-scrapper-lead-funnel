import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react'
import { format } from 'date-fns'

import { OutreachCampaignStatusBadge } from '@/components/outreach/OutreachCampaignStatusBadge'
import { OutreachChannelBadge } from '@/components/outreach/OutreachChannelBadge'
import { getCampaignDisplaySubject } from '@/lib/outreach'
import { getLeadCompany } from '@/lib/leads'
import { cn } from '@/lib/utils'
import type { Lead } from '@/types/lead'
import type { OutreachCampaign, OutreachCampaignSortField, SortDirection } from '@/types/outreach'

interface OutreachCampaignsTableProps {
  campaigns: OutreachCampaign[]
  leadMap: Map<string, Lead>
  sortField: OutreachCampaignSortField
  sortDirection: SortDirection
  onSort: (field: OutreachCampaignSortField) => void
  onCampaignClick?: (campaign: OutreachCampaign) => void
}

interface Column {
  field: OutreachCampaignSortField | 'lead'
  label: string
  className?: string
  sortable?: boolean
}

const COLUMNS: Column[] = [
  { field: 'subject', label: 'Campaign', className: 'min-w-[180px]' },
  { field: 'lead', label: 'Lead', className: 'min-w-[140px]', sortable: false },
  { field: 'channel', label: 'Channel', className: 'w-28' },
  { field: 'status', label: 'Status', className: 'w-32' },
  { field: 'created_at', label: 'Created', className: 'w-36' },
]

function SortIcon({
  field,
  sortField,
  sortDirection,
}: {
  field: OutreachCampaignSortField
  sortField: OutreachCampaignSortField
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

export function OutreachCampaignsTable({
  campaigns,
  leadMap,
  sortField,
  sortDirection,
  onSort,
  onCampaignClick,
}: OutreachCampaignsTableProps) {
  return (
    <div
      className={cn(
        'overflow-hidden rounded-[var(--radius-card)] border border-border bg-surface-solid',
        'shadow-[var(--shadow-soft)]',
      )}
    >
      <div className="overflow-x-auto">
        <table className="w-full min-w-[800px] border-collapse text-left">
          <thead>
            <tr className="border-b border-border bg-section-alt">
              {COLUMNS.map((column) => (
                <th key={column.label} className={cn('px-5 py-3.5', column.className)}>
                  {column.sortable === false ? (
                    <span className="text-xs font-semibold uppercase tracking-wide text-muted">
                      {column.label}
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => onSort(column.field as OutreachCampaignSortField)}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted transition-colors hover:text-foreground"
                    >
                      {column.label}
                      <SortIcon
                        field={column.field as OutreachCampaignSortField}
                        sortField={sortField}
                        sortDirection={sortDirection}
                      />
                    </button>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border/50">
            {campaigns.map((campaign) => {
              const lead = leadMap.get(campaign.lead_id)

              return (
                <tr
                  key={campaign.id}
                  onClick={() => onCampaignClick?.(campaign)}
                  className={cn(
                    'transition-colors hover:bg-foreground/[0.03]',
                    onCampaignClick && 'cursor-pointer',
                    campaign.status === 'active' && 'bg-primary-soft/10',
                  )}
                >
                  <td className="px-5 py-4">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-foreground">
                        {getCampaignDisplaySubject(campaign)}
                      </p>
                      {campaign.deployment_package_id ? (
                        <p className="mt-0.5 truncate text-xs text-muted">From deployment</p>
                      ) : null}
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    {lead ? (
                      <span className="text-sm text-foreground">{getLeadCompany(lead)}</span>
                    ) : (
                      <span className="text-sm text-muted">{campaign.lead_id.slice(0, 8)}…</span>
                    )}
                  </td>
                  <td className="px-5 py-4">
                    <OutreachChannelBadge channel={campaign.channel} />
                  </td>
                  <td className="px-5 py-4">
                    <OutreachCampaignStatusBadge status={campaign.status} />
                  </td>
                  <td className="px-5 py-4">
                    <time
                      dateTime={campaign.created_at}
                      className="text-sm tabular-nums text-muted"
                    >
                      {format(new Date(campaign.created_at), 'MMM d, yyyy')}
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
