import { motion } from 'framer-motion'
import { isAxiosError } from 'axios'
import { useEffect, useMemo, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'

import { CreateLeadDialog } from '@/components/leads/CreateLeadDialog'
import { LeadsEmptyState } from '@/components/leads/LeadsEmptyState'
import { LeadsErrorState } from '@/components/leads/LeadsErrorState'
import {
  LeadsPageHeader,
  LeadsPagination,
} from '@/components/leads/LeadsPageHeader'
import { LeadsTable } from '@/components/leads/LeadsTable'
import { LeadsTableSkeleton } from '@/components/leads/LeadsTableSkeleton'
import type { LeadFilters } from '@/components/leads/LeadsFiltersPanel'
import { SIDEBAR_NAV } from '@/components/dashboard/dashboard-data'
import { useLeadsQuery } from '@/hooks/useLeads'
import {
  PAGE_SIZE,
  SEARCH_FETCH_LIMIT,
  filterLeadsBySearch,
  sortLeads,
} from '@/lib/leads'
import { cn } from '@/lib/utils'
import type { LeadSortField, SortDirection } from '@/types/lead'

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
  return 'Something went wrong while loading leads.'
}

export function LeadsPage() {
  const { pathname } = useLocation()
  const [searchQuery, setSearchQuery] = useState('')
  const [filters, setFilters] = useState<LeadFilters>({})
  const [sortField, setSortField] = useState<LeadSortField>('created_at')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')
  const [page, setPage] = useState(1)
  const [createOpen, setCreateOpen] = useState(false)

  const isSearchActive = searchQuery.trim().length > 0

  const apiParams = useMemo(
    () => ({
      status: filters.status,
      priority: filters.priority,
      limit: isSearchActive ? SEARCH_FETCH_LIMIT : PAGE_SIZE,
      offset: isSearchActive ? 0 : (page - 1) * PAGE_SIZE,
    }),
    [filters.status, filters.priority, isSearchActive, page],
  )

  const { data, isLoading, isError, error, refetch, isFetching } = useLeadsQuery(apiParams)

  useEffect(() => {
    setPage(1)
  }, [searchQuery, filters.status, filters.priority])

  const processedLeads = useMemo(() => {
    const items = data?.items ?? []
    const searched = isSearchActive ? filterLeadsBySearch(items, searchQuery) : items
    return sortLeads(searched, sortField, sortDirection)
  }, [data?.items, isSearchActive, searchQuery, sortField, sortDirection])

  const paginatedLeads = useMemo(() => {
    if (!isSearchActive) return processedLeads
    const start = (page - 1) * PAGE_SIZE
    return processedLeads.slice(start, start + PAGE_SIZE)
  }, [processedLeads, isSearchActive, page])

  const totalCount = isSearchActive ? processedLeads.length : (data?.total ?? 0)
  const hasActiveFilters = Boolean(filters.status || filters.priority || isSearchActive)

  function handleSort(field: LeadSortField) {
    if (sortField === field) {
      setSortDirection((current) => (current === 'asc' ? 'desc' : 'asc'))
      return
    }

    setSortField(field)
    setSortDirection(field === 'title' || field === 'source_label' ? 'asc' : 'desc')
  }

  return (
    <div className="relative min-h-screen">
      <div
        className="pointer-events-none fixed inset-0 opacity-40"
        style={{
          backgroundImage:
            'radial-gradient(circle at 1px 1px, rgb(28 200 141 / 0.06) 1px, transparent 0)',
          backgroundSize: '28px 28px',
        }}
      />

      <div className="relative flex flex-col">
        <div className="border-b border-border/60 bg-surface-solid/80 px-4 py-3 backdrop-blur-xl lg:hidden">
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
                      ? 'bg-primary-soft text-foreground'
                      : 'text-muted hover:bg-primary-soft/50 hover:text-foreground',
                  )}
                >
                  <Icon className="size-3.5" />
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
            <LeadsPageHeader
              totalCount={totalCount}
              displayedCount={paginatedLeads.length}
              searchQuery={searchQuery}
              filters={filters}
              onSearchChange={setSearchQuery}
              onFiltersChange={setFilters}
              onCreateLead={() => setCreateOpen(true)}
            />

            {isLoading ? <LeadsTableSkeleton /> : null}

            {isError && !isLoading ? (
              <LeadsErrorState message={getErrorMessage(error)} onRetry={() => refetch()} />
            ) : null}

            {!isLoading && !isError && paginatedLeads.length === 0 ? (
              <LeadsEmptyState
                hasFilters={hasActiveFilters}
                onCreateLead={() => setCreateOpen(true)}
              />
            ) : null}

            {!isLoading && !isError && paginatedLeads.length > 0 ? (
              <div className="space-y-4">
                <LeadsTable
                  leads={paginatedLeads}
                  sortField={sortField}
                  sortDirection={sortDirection}
                  onSort={handleSort}
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

      <CreateLeadDialog open={createOpen} onClose={() => setCreateOpen(false)} />
    </div>
  )
}
