import { motion } from 'framer-motion'
import { useEffect, useMemo, useState } from 'react'
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import { AppointmentDetailDrawer } from '@/components/appointments/AppointmentDetailDrawer'
import { AppointmentsEmptyState } from '@/components/appointments/AppointmentsEmptyState'
import { AppointmentsErrorState } from '@/components/appointments/AppointmentsErrorState'
import { AppointmentsPageHeader } from '@/components/appointments/AppointmentsPageHeader'
import { AppointmentsTable } from '@/components/appointments/AppointmentsTable'
import { AppointmentsTableSkeleton } from '@/components/appointments/AppointmentsTableSkeleton'
import { GoogleCalendarStatusBanner } from '@/components/appointments/GoogleCalendarStatusBanner'
import { ProposeAppointmentDialog } from '@/components/appointments/ProposeAppointmentDialog'
import { DashboardAtmosphere } from '@/components/dashboard/DashboardAtmosphere'
import { SIDEBAR_NAV } from '@/components/dashboard/dashboard-data'
import { LeadsPagination } from '@/components/leads/LeadsPageHeader'
import { useAppointmentsQuery, googleCalendarKeys } from '@/hooks/useAppointments'
import { useLeadsQuery } from '@/hooks/useLeads'
import {
  PAGE_SIZE,
  SEARCH_FETCH_LIMIT,
  filterAppointmentsBySearch,
  filterAppointmentsByTab,
  getApiErrorMessage,
  sortAppointments,
} from '@/lib/appointments'
import { cn } from '@/lib/utils'
import type { AppointmentListTab, AppointmentSortField, SortDirection } from '@/types/appointment'

export function AppointmentsPage() {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [searchParams, setSearchParams] = useSearchParams()
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState<AppointmentListTab>('upcoming')
  const [sortField, setSortField] = useState<AppointmentSortField>('starts_at')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')
  const [page, setPage] = useState(1)
  const [selectedAppointmentId, setSelectedAppointmentId] = useState<string | null>(
    () => searchParams.get('appointment_id'),
  )

  const conversationId = searchParams.get('conversation_id')
  const shouldOpenPropose = searchParams.get('propose') === '1' && Boolean(conversationId)
  const [proposeOpen, setProposeOpen] = useState(shouldOpenPropose)

  const isSearchActive = searchQuery.trim().length > 0
  const isClientFilterActive = isSearchActive || activeTab !== 'upcoming'

  const apiParams = useMemo(
    () => ({
      limit: isClientFilterActive ? SEARCH_FETCH_LIMIT : PAGE_SIZE,
      offset: isClientFilterActive ? 0 : (page - 1) * PAGE_SIZE,
    }),
    [isClientFilterActive, page],
  )

  const { data, isLoading, isError, error, refetch, isFetching } = useAppointmentsQuery(apiParams)
  const { data: leadsData } = useLeadsQuery({ limit: SEARCH_FETCH_LIMIT, offset: 0 })

  const leadMap = useMemo(() => {
    const map = new Map<string, NonNullable<typeof leadsData>['items'][number]>()
    for (const lead of leadsData?.items ?? []) {
      map.set(lead.id, lead)
    }
    return map
  }, [leadsData?.items])

  useEffect(() => {
    const appointmentId = searchParams.get('appointment_id')
    if (appointmentId) setSelectedAppointmentId(appointmentId)
  }, [searchParams])

  useEffect(() => {
    const calendarResult = searchParams.get('calendar')
    if (!calendarResult) return

    const nextParams = new URLSearchParams(searchParams)
    const email = nextParams.get('email')
    const message = nextParams.get('message')
    nextParams.delete('calendar')
    nextParams.delete('email')
    nextParams.delete('message')
    setSearchParams(nextParams, { replace: true })

    if (calendarResult === 'connected') {
      queryClient.invalidateQueries({ queryKey: googleCalendarKeys.status() })
      toast.success(
        email
          ? `Google Calendar connected (${email})`
          : 'Google Calendar connected successfully',
      )
      return
    }

    if (calendarResult === 'error') {
      toast.error(message ?? 'Failed to connect Google Calendar')
    }
  }, [queryClient, searchParams, setSearchParams])

  useEffect(() => {
    if (shouldOpenPropose) setProposeOpen(true)
  }, [shouldOpenPropose])

  useEffect(() => {
    setPage(1)
  }, [searchQuery, activeTab])

  const processedAppointments = useMemo(() => {
    const items = data?.items ?? []
    const tabbed = filterAppointmentsByTab(items, activeTab)
    const searched = isSearchActive
      ? filterAppointmentsBySearch(tabbed, searchQuery, leadMap)
      : tabbed
    return sortAppointments(searched, sortField, sortDirection)
  }, [data?.items, activeTab, isSearchActive, searchQuery, leadMap, sortField, sortDirection])

  const paginatedAppointments = useMemo(() => {
    if (!isClientFilterActive) return processedAppointments
    const start = (page - 1) * PAGE_SIZE
    return processedAppointments.slice(start, start + PAGE_SIZE)
  }, [processedAppointments, isClientFilterActive, page])

  const totalCount = isClientFilterActive ? processedAppointments.length : (data?.total ?? 0)
  const hasActiveFilters = isSearchActive

  function handleAppointmentClick(appointment: { id: string }) {
    setSelectedAppointmentId(appointment.id)
    const next = new URLSearchParams(searchParams)
    next.set('appointment_id', appointment.id)
    setSearchParams(next, { replace: true })
  }

  function handleDrawerClose() {
    setSelectedAppointmentId(null)
    const next = new URLSearchParams(searchParams)
    next.delete('appointment_id')
    setSearchParams(next, { replace: true })
  }

  function handleProposeClose() {
    setProposeOpen(false)
    const next = new URLSearchParams(searchParams)
    next.delete('propose')
    next.delete('conversation_id')
    setSearchParams(next, { replace: true })
  }

  function handleBooked(appointmentId: string) {
    setSelectedAppointmentId(appointmentId)
    const next = new URLSearchParams(searchParams)
    next.set('appointment_id', appointmentId)
    next.delete('propose')
    next.delete('conversation_id')
    setSearchParams(next, { replace: true })
  }

  function handleSort(field: AppointmentSortField) {
    if (sortField === field) {
      setSortDirection((current) => (current === 'asc' ? 'desc' : 'asc'))
      return
    }

    setSortField(field)
    setSortDirection(field === 'title' || field === 'status' ? 'asc' : 'desc')
  }

  const activeTabLabel =
    activeTab.charAt(0).toUpperCase() + activeTab.slice(1).replace('_', ' ')

  return (
    <div className="relative isolate min-h-full bg-background">
      <DashboardAtmosphere />

      <div className="relative z-0 flex flex-col">
        <div className="glass-surface border-b border-border px-4 py-3 lg:hidden">
          <nav className="flex gap-1 overflow-x-auto pb-0.5">
            {SIDEBAR_NAV.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href

              return (
                <Link
                  key={item.href}
                  to={item.href}
                  className={cn(
                    'inline-flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium transition-colors',
                    isActive
                      ? 'sidebar-active-wash border-l-[3px] border-primary bg-surface-solid pl-[calc(0.75rem-3px)] font-semibold text-foreground shadow-[var(--shadow-soft)]'
                      : 'text-muted hover:bg-foreground/[0.04] hover:text-foreground',
                  )}
                >
                  <Icon className={cn('size-3.5', isActive && 'text-primary')} />
                  {item.label}
                </Link>
              )
            })}
          </nav>
        </div>

        <motion.main
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
          className="flex-1 px-4 py-6 sm:px-6 sm:py-8 lg:px-8"
        >
          <div className="mx-auto flex w-full max-w-[1280px] flex-col gap-6">
            <AppointmentsPageHeader
              totalCount={totalCount}
              displayedCount={paginatedAppointments.length}
              activeTab={activeTab}
              searchQuery={searchQuery}
              onTabChange={setActiveTab}
              onSearchChange={setSearchQuery}
            />

            <GoogleCalendarStatusBanner />

            {isLoading ? <AppointmentsTableSkeleton /> : null}

            {isError && !isLoading ? (
              <AppointmentsErrorState
                message={getApiErrorMessage(error, 'Something went wrong while loading appointments.')}
                onRetry={() => refetch()}
              />
            ) : null}

            {!isLoading && !isError && paginatedAppointments.length === 0 ? (
              <AppointmentsEmptyState
                tabLabel={activeTabLabel}
                hasFilters={hasActiveFilters}
                onBookFromOutreach={() => navigate('/outreach')}
              />
            ) : null}

            {!isLoading && !isError && paginatedAppointments.length > 0 ? (
              <div className="space-y-4">
                <AppointmentsTable
                  appointments={paginatedAppointments}
                  leadMap={leadMap}
                  sortField={sortField}
                  sortDirection={sortDirection}
                  onSort={handleSort}
                  onAppointmentClick={handleAppointmentClick}
                />
                <LeadsPagination
                  page={page}
                  pageSize={PAGE_SIZE}
                  totalItems={totalCount}
                  onPageChange={setPage}
                />
                {isFetching && !isLoading ? (
                  <p className="text-center text-xs text-muted">Refreshing…</p>
                ) : null}
              </div>
            ) : null}
          </div>
        </motion.main>
      </div>

      <AppointmentDetailDrawer
        appointmentId={selectedAppointmentId}
        onClose={handleDrawerClose}
      />

      <ProposeAppointmentDialog
        open={proposeOpen}
        conversationId={conversationId}
        onClose={handleProposeClose}
        onBooked={handleBooked}
      />
    </div>
  )
}
