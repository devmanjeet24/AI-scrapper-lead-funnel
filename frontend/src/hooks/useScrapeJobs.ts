import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { isAxiosError } from 'axios'
import { toast } from 'sonner'

import {
  createScrapeJob,
  getScrapeJob,
  getScrapeResult,
  listScrapeJobResults,
  listScrapeJobs,
  runScrapeJob,
} from '@/api/scrape-jobs'
import { dashboardKeys } from '@/hooks/useDashboardStats'
import { isScrapeResultTerminal } from '@/lib/scrape'
import type { ScrapeJobCreateRequest, ScrapeJobListParams } from '@/types/scrape'

export const scrapeJobKeys = {
  all: ['scrape-jobs'] as const,
  lists: () => [...scrapeJobKeys.all, 'list'] as const,
  list: (params: ScrapeJobListParams) => [...scrapeJobKeys.lists(), params] as const,
  details: () => [...scrapeJobKeys.all, 'detail'] as const,
  detail: (id: string) => [...scrapeJobKeys.details(), id] as const,
  results: () => [...scrapeJobKeys.all, 'result'] as const,
  result: (id: string) => [...scrapeJobKeys.results(), id] as const,
  jobResults: (jobId: string) => [...scrapeJobKeys.all, 'job-results', jobId] as const,
}

function getMutationErrorMessage(error: unknown, fallback: string): string {
  if (isAxiosError(error)) {
    const detail = error.response?.data?.detail
    if (typeof detail === 'string') return detail
  }
  if (error instanceof Error) return error.message
  return fallback
}


export function useScrapeJobsQuery(params: ScrapeJobListParams) {
  return useQuery({
    queryKey: scrapeJobKeys.list(params),
    queryFn: () => listScrapeJobs(params),
  })
}

export function useScrapeJobQuery(jobId: string | null) {
  const isValidJobId = Boolean(jobId) && jobId !== 'null' && jobId !== 'undefined'

  return useQuery({
    queryKey: scrapeJobKeys.detail(jobId ?? ''),
    queryFn: () => getScrapeJob(jobId!),
    enabled: isValidJobId,
  })
}

export function useScrapeJobResultsQuery(jobId: string | null) {
  const isValidJobId = Boolean(jobId) && jobId !== 'null' && jobId !== 'undefined'

  return useQuery({
    queryKey: scrapeJobKeys.jobResults(jobId ?? ''),
    queryFn: () => listScrapeJobResults(jobId!),
    enabled: isValidJobId,
    refetchInterval: (query) => {
      const newest = query.state.data?.items?.[0]
      if (newest && !isScrapeResultTerminal(newest.status)) return 2000
      return false
    },
  })
}

export function useScrapeResultQuery(resultId: string | null, enabled = true) {
  return useQuery({
    queryKey: scrapeJobKeys.result(resultId ?? ''),
    queryFn: () => getScrapeResult(resultId!),
    enabled: Boolean(resultId) && enabled,
    refetchInterval: (query) => {
      const status = query.state.data?.status
      if (!status || !isScrapeResultTerminal(status)) return 2000
      return false
    },
  })
}

export function useCreateScrapeJobMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: ScrapeJobCreateRequest) => createScrapeJob(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: scrapeJobKeys.lists() })
      queryClient.invalidateQueries({ queryKey: dashboardKeys.stats() })
      toast.success('Scrape job created')
    },
    onError: (error) => {
      toast.error(getMutationErrorMessage(error, 'Failed to create scrape job.'))
    },
  })
}

export function useRunScrapeJobMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (jobId: string) => runScrapeJob(jobId),
    onSuccess: (response, jobId) => {
      queryClient.invalidateQueries({ queryKey: scrapeJobKeys.detail(jobId) })
      queryClient.invalidateQueries({ queryKey: scrapeJobKeys.lists() })
      toast.success('Scrape run started')
      return response
    },
    onError: (error) => {
      toast.error(getMutationErrorMessage(error, 'Failed to start scrape run.'))
    },
  })
}
