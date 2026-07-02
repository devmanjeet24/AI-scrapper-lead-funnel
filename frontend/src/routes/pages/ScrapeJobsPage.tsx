import { motion } from 'framer-motion'
import { isAxiosError } from 'axios'
import { useEffect, useMemo, useState } from 'react'
import { Link, useLocation, useSearchParams } from 'react-router-dom'

import { DashboardAtmosphere } from '@/components/dashboard/DashboardAtmosphere'
import { SIDEBAR_NAV } from '@/components/dashboard/dashboard-data'
import { LeadsPagination } from '@/components/leads/LeadsPageHeader'
import { CreateScrapeJobDialog } from '@/components/scrape-jobs/CreateScrapeJobDialog'
import { ScrapeJobDetailDrawer } from '@/components/scrape-jobs/ScrapeJobDetailDrawer'
import type { ScrapeJobFilters } from '@/components/scrape-jobs/ScrapeJobsFiltersPanel'
import { ScrapeJobsEmptyState } from '@/components/scrape-jobs/ScrapeJobsEmptyState'
import { ScrapeJobsErrorState } from '@/components/scrape-jobs/ScrapeJobsErrorState'
import { ScrapeJobsPageHeader } from '@/components/scrape-jobs/ScrapeJobsPageHeader'
import { ScrapeJobsTable } from '@/components/scrape-jobs/ScrapeJobsTable'
import { ScrapeJobsTableSkeleton } from '@/components/scrape-jobs/ScrapeJobsTableSkeleton'
import { useScrapeJobsQuery } from '@/hooks/useScrapeJobs'
import {
  PAGE_SIZE,
  SEARCH_FETCH_LIMIT,
  filterScrapeJobsBySearch,
  sortScrapeJobs,
} from '@/lib/scrape'
import { cn } from '@/lib/utils'
import type { ScrapeJobSortField, SortDirection } from '@/types/scrape'

function normalizeJobId(value: string | null): string | null {
  if (!value || value === 'null' || value === 'undefined') return null
  return value
}

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
  return 'Something went wrong while loading scrape jobs.'
}

export function ScrapeJobsPage() {
  const { pathname } = useLocation()
  const [searchParams, setSearchParams] = useSearchParams()
  const [searchQuery, setSearchQuery] = useState('')
  const [filters, setFilters] = useState<ScrapeJobFilters>({})
  const [sortField, setSortField] = useState<ScrapeJobSortField>('created_at')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')
  const [page, setPage] = useState(1)
  const [createOpen, setCreateOpen] = useState(false)
  const [selectedJobId, setSelectedJobId] = useState<string | null>(
    () => normalizeJobId(searchParams.get('job_id')),
  )

  const isSearchActive = searchQuery.trim().length > 0
  const isClientFilterActive = isSearchActive

  const apiParams = useMemo(
    () => ({
      status: filters.status,
      source_type: filters.source_type,
      is_active: filters.is_active,
      limit: isClientFilterActive ? SEARCH_FETCH_LIMIT : PAGE_SIZE,
      offset: isClientFilterActive ? 0 : (page - 1) * PAGE_SIZE,
    }),
    [filters.status, filters.source_type, filters.is_active, isClientFilterActive, page],
  )

  const { data, isLoading, isError, error, refetch, isFetching } = useScrapeJobsQuery(apiParams)

  useEffect(() => {
    const jobId = normalizeJobId(searchParams.get('job_id'))
    if (jobId) {
      setSelectedJobId(jobId)
    }
  }, [searchParams])

  useEffect(() => {
    setPage(1)
  }, [searchQuery, filters.status, filters.source_type, filters.is_active])

  const processedJobs = useMemo(() => {
    const items = data?.items ?? []
    const searched = isSearchActive ? filterScrapeJobsBySearch(items, searchQuery) : items
    return sortScrapeJobs(searched, sortField, sortDirection)
  }, [data?.items, isSearchActive, searchQuery, sortField, sortDirection])

  const paginatedJobs = useMemo(() => {
    if (!isClientFilterActive) return processedJobs
    const start = (page - 1) * PAGE_SIZE
    return processedJobs.slice(start, start + PAGE_SIZE)
  }, [processedJobs, isClientFilterActive, page])

  const totalCount = isClientFilterActive ? processedJobs.length : (data?.total ?? 0)
  const hasActiveFilters = Boolean(
    filters.status || filters.source_type || filters.is_active !== undefined || isSearchActive,
  )

  function handleJobClick(job: { id: string }) {
    setSelectedJobId(job.id)
    setSearchParams({ job_id: job.id }, { replace: true })
  }

  function handleDrawerClose() {
    setSelectedJobId(null)
    if (searchParams.has('job_id')) {
      const next = new URLSearchParams(searchParams)
      next.delete('job_id')
      setSearchParams(next, { replace: true })
    }
  }

  function handleSort(field: ScrapeJobSortField) {
    if (sortField === field) {
      setSortDirection((current) => (current === 'asc' ? 'desc' : 'asc'))
      return
    }

    setSortField(field)
    setSortDirection(field === 'name' || field === 'target_url' || field === 'source_type' ? 'asc' : 'desc')
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
            <ScrapeJobsPageHeader
              totalCount={totalCount}
              displayedCount={paginatedJobs.length}
              searchQuery={searchQuery}
              filters={filters}
              onSearchChange={setSearchQuery}
              onFiltersChange={setFilters}
              onCreateJob={() => setCreateOpen(true)}
            />

            {isLoading ? <ScrapeJobsTableSkeleton /> : null}

            {isError && !isLoading ? (
              <ScrapeJobsErrorState message={getErrorMessage(error)} onRetry={() => refetch()} />
            ) : null}

            {!isLoading && !isError && paginatedJobs.length === 0 ? (
              <ScrapeJobsEmptyState
                hasFilters={hasActiveFilters}
                onCreateJob={() => setCreateOpen(true)}
              />
            ) : null}

            {!isLoading && !isError && paginatedJobs.length > 0 ? (
              <div className="space-y-4">
                <ScrapeJobsTable
                  jobs={paginatedJobs}
                  sortField={sortField}
                  sortDirection={sortDirection}
                  onSort={handleSort}
                  onJobClick={handleJobClick}
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

      <CreateScrapeJobDialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreated={(jobId) => {
          if (!jobId) return
          setSelectedJobId(jobId)
          setSearchParams({ job_id: jobId }, { replace: true })
        }}
      />

      <ScrapeJobDetailDrawer jobId={selectedJobId} onClose={handleDrawerClose} />
    </div>
  )
}
