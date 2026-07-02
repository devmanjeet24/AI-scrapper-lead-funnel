import { motion } from 'framer-motion'
import { isAxiosError } from 'axios'
import { useEffect, useMemo, useState } from 'react'
import { Link, useLocation, useSearchParams } from 'react-router-dom'

import { DashboardAtmosphere } from '@/components/dashboard/DashboardAtmosphere'
import { SIDEBAR_NAV } from '@/components/dashboard/dashboard-data'
import { LeadsPagination } from '@/components/leads/LeadsPageHeader'
import { CreateOutreachCampaignDialog } from '@/components/outreach/CreateOutreachCampaignDialog'
import { OutreachCampaignDetailDrawer } from '@/components/outreach/OutreachCampaignDetailDrawer'
import type { OutreachFilters } from '@/components/outreach/OutreachFiltersPanel'
import { OutreachCampaignsTable } from '@/components/outreach/OutreachCampaignsTable'
import { OutreachCampaignsTableSkeleton } from '@/components/outreach/OutreachCampaignsTableSkeleton'
import { OutreachEmptyState } from '@/components/outreach/OutreachEmptyState'
import { OutreachErrorState } from '@/components/outreach/OutreachErrorState'
import { OutreachPageHeader } from '@/components/outreach/OutreachPageHeader'
import { useLeadsQuery } from '@/hooks/useLeads'
import { useOutreachCampaignsQuery } from '@/hooks/useOutreach'
import {
  PAGE_SIZE,
  SEARCH_FETCH_LIMIT,
  filterCampaignsBySearch,
  sortOutreachCampaigns,
} from '@/lib/outreach'
import { cn } from '@/lib/utils'
import type { OutreachCampaignSortField, SortDirection } from '@/types/outreach'

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
  return 'Something went wrong while loading outreach campaigns.'
}

export function OutreachPage() {
  const { pathname } = useLocation()
  const [searchParams, setSearchParams] = useSearchParams()
  const [searchQuery, setSearchQuery] = useState('')
  const [filters, setFilters] = useState<OutreachFilters>(() => ({
    lead_id: searchParams.get('lead_id') ?? undefined,
  }))
  const [sortField, setSortField] = useState<OutreachCampaignSortField>('created_at')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')
  const [page, setPage] = useState(1)
  const [createOpen, setCreateOpen] = useState(false)
  const [selectedCampaignId, setSelectedCampaignId] = useState<string | null>(
    () => searchParams.get('campaign_id'),
  )

  const defaultLeadId = searchParams.get('lead_id')
  const shouldOpenCreate = searchParams.get('create') === '1'

  const isSearchActive = searchQuery.trim().length > 0
  const isClientFilterActive = isSearchActive

  const apiParams = useMemo(
    () => ({
      status: filters.status,
      lead_id: filters.lead_id,
      limit: isClientFilterActive ? SEARCH_FETCH_LIMIT : PAGE_SIZE,
      offset: isClientFilterActive ? 0 : (page - 1) * PAGE_SIZE,
    }),
    [filters.status, filters.lead_id, isClientFilterActive, page],
  )

  const { data, isLoading, isError, error, refetch, isFetching } =
    useOutreachCampaignsQuery(apiParams)
  const { data: leadsData } = useLeadsQuery({ limit: SEARCH_FETCH_LIMIT, offset: 0 })

  const leadMap = useMemo(() => {
    const map = new Map<string, NonNullable<typeof leadsData>['items'][number]>()
    for (const lead of leadsData?.items ?? []) {
      map.set(lead.id, lead)
    }
    return map
  }, [leadsData?.items])

  const leads = leadsData?.items ?? []

  useEffect(() => {
    const campaignId = searchParams.get('campaign_id')
    if (campaignId) setSelectedCampaignId(campaignId)
  }, [searchParams])

  useEffect(() => {
    if (shouldOpenCreate) {
      setCreateOpen(true)
    }
  }, [shouldOpenCreate])

  useEffect(() => {
    setPage(1)
  }, [searchQuery, filters.status, filters.lead_id])

  const processedCampaigns = useMemo(() => {
    const items = data?.items ?? []
    const searched = isSearchActive
      ? filterCampaignsBySearch(items, searchQuery, leadMap)
      : items
    return sortOutreachCampaigns(searched, sortField, sortDirection)
  }, [data?.items, isSearchActive, searchQuery, leadMap, sortField, sortDirection])

  const paginatedCampaigns = useMemo(() => {
    if (!isClientFilterActive) return processedCampaigns
    const start = (page - 1) * PAGE_SIZE
    return processedCampaigns.slice(start, start + PAGE_SIZE)
  }, [processedCampaigns, isClientFilterActive, page])

  const totalCount = isClientFilterActive ? processedCampaigns.length : (data?.total ?? 0)
  const hasActiveFilters = Boolean(filters.status || filters.lead_id || isSearchActive)

  function handleCampaignClick(campaign: { id: string }) {
    setSelectedCampaignId(campaign.id)
    const next = new URLSearchParams(searchParams)
    next.set('campaign_id', campaign.id)
    setSearchParams(next, { replace: true })
  }

  function handleDrawerClose() {
    setSelectedCampaignId(null)
    const next = new URLSearchParams(searchParams)
    next.delete('campaign_id')
    setSearchParams(next, { replace: true })
  }

  function handleCreateClose() {
    setCreateOpen(false)
    const next = new URLSearchParams(searchParams)
    next.delete('create')
    setSearchParams(next, { replace: true })
  }

  function handleSort(field: OutreachCampaignSortField) {
    if (sortField === field) {
      setSortDirection((current) => (current === 'asc' ? 'desc' : 'asc'))
      return
    }

    setSortField(field)
    setSortDirection(field === 'subject' || field === 'channel' ? 'asc' : 'desc')
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
            <OutreachPageHeader
              totalCount={totalCount}
              displayedCount={paginatedCampaigns.length}
              searchQuery={searchQuery}
              filters={filters}
              leads={leads}
              onSearchChange={setSearchQuery}
              onFiltersChange={setFilters}
              onCreateCampaign={() => setCreateOpen(true)}
            />

            {isLoading ? <OutreachCampaignsTableSkeleton /> : null}

            {isError && !isLoading ? (
              <OutreachErrorState message={getErrorMessage(error)} onRetry={() => refetch()} />
            ) : null}

            {!isLoading && !isError && paginatedCampaigns.length === 0 ? (
              <OutreachEmptyState
                hasFilters={hasActiveFilters}
                onCreateCampaign={() => setCreateOpen(true)}
              />
            ) : null}

            {!isLoading && !isError && paginatedCampaigns.length > 0 ? (
              <div className="space-y-4">
                <OutreachCampaignsTable
                  campaigns={paginatedCampaigns}
                  leadMap={leadMap}
                  sortField={sortField}
                  sortDirection={sortDirection}
                  onSort={handleSort}
                  onCampaignClick={handleCampaignClick}
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

      <CreateOutreachCampaignDialog
        open={createOpen}
        defaultLeadId={defaultLeadId}
        onClose={handleCreateClose}
        onCreated={(campaignId) => {
          setSelectedCampaignId(campaignId)
          const next = new URLSearchParams(searchParams)
          next.set('campaign_id', campaignId)
          next.delete('create')
          setSearchParams(next, { replace: true })
        }}
      />

      <OutreachCampaignDetailDrawer
        campaignId={selectedCampaignId}
        onClose={handleDrawerClose}
      />
    </div>
  )
}
