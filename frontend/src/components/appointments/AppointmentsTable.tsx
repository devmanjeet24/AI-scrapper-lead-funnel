import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react'
import { format } from 'date-fns'

import { AppointmentStatusBadge } from '@/components/appointments/AppointmentStatusBadge'
import { cn } from '@/lib/utils'
import type { Appointment, AppointmentSortField, SortDirection } from '@/types/appointment'
import type { Lead } from '@/types/lead'

interface AppointmentsTableProps {
  appointments: Appointment[]
  leadMap: Map<string, Lead>
  sortField: AppointmentSortField
  sortDirection: SortDirection
  onSort: (field: AppointmentSortField) => void
  onAppointmentClick?: (appointment: Appointment) => void
}

interface Column {
  field: AppointmentSortField
  label: string
  className?: string
}

const COLUMNS: Column[] = [
  { field: 'title', label: 'Appointment', className: 'min-w-[200px]' },
  { field: 'status', label: 'Status', className: 'w-32' },
  { field: 'starts_at', label: 'Date / Time', className: 'w-44' },
  { field: 'created_at', label: 'Created', className: 'w-36' },
]

function SortIcon({
  field,
  sortField,
  sortDirection,
}: {
  field: AppointmentSortField
  sortField: AppointmentSortField
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

export function AppointmentsTable({
  appointments,
  leadMap,
  sortField,
  sortDirection,
  onSort,
  onAppointmentClick,
}: AppointmentsTableProps) {
  return (
    <div
      className={cn(
        'overflow-hidden rounded-[var(--radius-card)] border border-border bg-surface-solid',
        'shadow-[var(--shadow-soft)]',
      )}
    >
      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] border-collapse text-left">
          <thead>
            <tr className="border-b border-border bg-section-alt">
              <th className="min-w-[160px] px-5 py-3.5 text-xs font-semibold uppercase tracking-wide text-muted">
                Lead
              </th>
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
          <tbody>
            {appointments.map((appointment) => {
              const lead = leadMap.get(appointment.lead_id)

              return (
                <tr
                  key={appointment.id}
                  className={cn(
                    'border-b border-border/60 transition-colors last:border-b-0',
                    onAppointmentClick && 'cursor-pointer hover:bg-section-alt/50',
                  )}
                  onClick={() => onAppointmentClick?.(appointment)}
                >
                  <td className="px-5 py-4">
                    <p className="text-sm font-medium text-foreground">
                      {lead?.title ?? `Lead ${appointment.lead_id.slice(0, 8)}…`}
                    </p>
                  </td>
                  <td className="px-5 py-4">
                    <p className="text-sm font-medium text-foreground">{appointment.title}</p>
                    {appointment.attendee_name ? (
                      <p className="mt-0.5 text-xs text-muted">{appointment.attendee_name}</p>
                    ) : null}
                  </td>
                  <td className="px-5 py-4">
                    <AppointmentStatusBadge status={appointment.status} />
                  </td>
                  <td className="px-5 py-4 text-sm text-foreground">
                    <time dateTime={appointment.starts_at}>
                      {format(new Date(appointment.starts_at), 'MMM d, yyyy')}
                    </time>
                    <p className="text-xs text-muted">
                      {format(new Date(appointment.starts_at), 'h:mm a')} –{' '}
                      {format(new Date(appointment.ends_at), 'h:mm a')}
                    </p>
                  </td>
                  <td className="px-5 py-4 text-sm text-muted">
                    <time dateTime={appointment.created_at}>
                      {format(new Date(appointment.created_at), 'MMM d, yyyy')}
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
