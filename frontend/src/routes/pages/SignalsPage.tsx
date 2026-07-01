import { motion } from 'framer-motion'
import { isAxiosError } from 'axios'
import { useEffect, useMemo, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'

import { DashboardAtmosphere } from '@/components/dashboard/DashboardAtmosphere'
import { SIDEBAR_NAV } from '@/components/dashboard/dashboard-data'
import { LeadsPagination } from '@/components/leads/LeadsPageHeader'
import { SignalsEmptyState } from '@/components/signals/SignalsEmptyState'
import { SignalsErrorState } from '@/components/signals/SignalsErrorState'
import { ConvertSignalDialog } from '@/components/signals/ConvertSignalDialog'
import { DismissSignalDialog } from '@/components/signals/DismissSignalDialog'
import type { SignalFilters } from '@/components/signals/SignalsFiltersPanel'
import { SignalDetailDrawer } from '@/components/signals/SignalDetailDrawer'
import { SignalsPageHeader } from '@/components/signals/SignalsPageHeader'
import { SignalsTable } from '@/components/signals/SignalsTable'
import { SignalsTableSkeleton } from '@/components/signals/SignalsTableSkeleton'
import { useSignalsQuery } from '@/hooks/useSignals'
import {
  PAGE_SIZE,
  SEARCH_FETCH_LIMIT,
  filterSignalsBySearch,
  sortSignals,
  type SignalStatusTab,
} from '@/lib/signals'
import { cn } from '@/lib/utils'
import type { Signal, SignalSortField, SortDirection } from '@/types/signal'

function getErrorMessage(error: unknown): string {
  if (isAxiosError(error)) {
    const detail = error.response?.data?.detail
    if (typeof detail === 'string') return detail
    if (Array.isArray(detail)) {
      return detail.map((item) => item?.msg ?? 'Validation error').join(', ')
    }
    return error.message
  }
  if (error instanceof Error) return error.message
  return 'Something went wrong while loading signals.'
}

export function SignalsPage() {
  const { pathname } = useLocation()
  const [searchQuery, setSearchQuery] = useState('')
  const [statusTab, setStatusTab] = useState<SignalStatusTab>('new')
  const [filters, setFilters] = useState<SignalFilters>({})
  const [sortField, setSortField] = useState<SignalSortField>('detected_at')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')
  const [page, setPage] = useState(1)
  const [selectedSignalId, setSelectedSignalId] = useState<string | null>(null)
  const [dismissTarget, setDismissTarget] = useState<Signal | null>(null)
  const [convertTarget, setConvertTarget] = useState<Signal | null>(null)

  const isSearchActive = searchQuery.trim().length > 0
  const isClientFilterActive = isSearchActive || Boolean(filters.priority)

  const apiParams = useMemo(
    () => ({
      status: statusTab === 'all' ? undefined : statusTab,
      signal_type: filters.signal_type,
      source_type: filters.source_type,
      limit: isClientFilterActive ? SEARCH_FETCH_LIMIT : PAGE_SIZE,
      offset: isClientFilterActive ? 0 : (page - 1) * PAGE_SIZE,
    }),
    [statusTab, filters.signal_type, filters.source_type, filters.priority, isClientFilterActive, page],
  )

  const { data, isLoading, isError, error, refetch, isFetching } = useSignalsQuery(apiParams)

  useEffect(() => {
    setPage(1)
  }, [searchQuery, statusTab, filters.signal_type, filters.source_type, filters.priority])

  const processedSignals = useMemo(() => {
    const items = data?.items ?? []
    let filtered = isSearchActive ? filterSignalsBySearch(items, searchQuery) : items

    if (filters.priority) {
      filtered = filtered.filter((signal) => signal.priority === filters.priority)
    }

    return sortSignals(filtered, sortField, sortDirection)
  }, [
    data?.items,
    filters.priority,
    isSearchActive,
    searchQuery,
    sortField,
    sortDirection,
  ])

  const paginatedSignals = useMemo(() => {
    if (!isClientFilterActive) return processedSignals
    const start = (page - 1) * PAGE_SIZE
    return processedSignals.slice(start, start + PAGE_SIZE)
  }, [processedSignals, isClientFilterActive, page])

  const totalCount = isClientFilterActive ? processedSignals.length : (data?.total ?? 0)
  const hasActiveFilters = Boolean(
    filters.signal_type ||
      filters.source_type ||
      filters.priority ||
      isSearchActive ||
      statusTab !== 'new',
  )

  function handleSort(field: SignalSortField) {
    if (sortField === field) {
      setSortDirection((current) => (current === 'asc' ? 'desc' : 'asc'))
      return
    }

    setSortField(field)
    setSortDirection(
      field === 'title' || field === 'source_label' || field === 'signal_type' ? 'asc' : 'desc',
    )
  }

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
            <SignalsPageHeader
              totalCount={totalCount}
              displayedCount={paginatedSignals.length}
              searchQuery={searchQuery}
              statusTab={statusTab}
              filters={filters}
              onSearchChange={setSearchQuery}
              onStatusTabChange={setStatusTab}
              onFiltersChange={setFilters}
            />

            {isLoading ? <SignalsTableSkeleton /> : null}

            {isError && !isLoading ? (
              <SignalsErrorState message={getErrorMessage(error)} onRetry={() => refetch()} />
            ) : null}

            {!isLoading && !isError && paginatedSignals.length === 0 ? (
              <SignalsEmptyState hasFilters={hasActiveFilters} />
            ) : null}

            {!isLoading && !isError && paginatedSignals.length > 0 ? (
              <div className="space-y-4">
                <SignalsTable
                  signals={paginatedSignals}
                  sortField={sortField}
                  sortDirection={sortDirection}
                  onSort={handleSort}
                  onSignalClick={(signal) => setSelectedSignalId(signal.id)}
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

      <SignalDetailDrawer
        signalId={selectedSignalId}
        onClose={() => setSelectedSignalId(null)}
        onDismiss={(signal) => setDismissTarget(signal)}
        onConvert={(signal) => setConvertTarget(signal)}
      />

      <DismissSignalDialog
        open={Boolean(dismissTarget)}
        signalId={dismissTarget?.id ?? null}
        signalTitle={dismissTarget?.title}
        onClose={() => setDismissTarget(null)}
      />

      <ConvertSignalDialog
        open={Boolean(convertTarget)}
        signal={convertTarget}
        onClose={() => setConvertTarget(null)}
      />
    </div>
  )
}
