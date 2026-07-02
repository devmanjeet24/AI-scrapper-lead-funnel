import type {
  PaginatedScrapeJobsResponse,
  PaginatedScrapeResultsResponse,
  ScrapeJob,
  ScrapeJobCreateRequest,
  ScrapeJobListParams,
  ScrapeResult,
  ScrapeRunResponse,
} from '@/types/scrape'

import { apiClient } from './client'

export async function listScrapeJobs(
  params: ScrapeJobListParams = {},
): Promise<PaginatedScrapeJobsResponse> {
  const { data } = await apiClient.get<PaginatedScrapeJobsResponse>('/scrape-jobs', { params })
  return data
}

export async function getScrapeJob(jobId: string): Promise<ScrapeJob> {
  const { data } = await apiClient.get<ScrapeJob>(`/scrape-jobs/${jobId}`)
  return data
}

export async function createScrapeJob(payload: ScrapeJobCreateRequest): Promise<ScrapeJob> {
  const { data } = await apiClient.post<ScrapeJob>('/scrape-jobs', payload)
  return data
}

export async function runScrapeJob(jobId: string): Promise<ScrapeRunResponse> {
  const { data } = await apiClient.post<ScrapeRunResponse>(`/scrape-jobs/${jobId}/run`)
  return data
}

export async function getScrapeResult(resultId: string): Promise<ScrapeResult> {
  const { data } = await apiClient.get<ScrapeResult>(`/scrape-results/${resultId}`)
  return data
}

export async function listScrapeJobResults(
  jobId: string,
  params: { limit?: number; offset?: number } = {},
): Promise<PaginatedScrapeResultsResponse> {
  const { data } = await apiClient.get<PaginatedScrapeResultsResponse>(
    `/scrape-jobs/${jobId}/results`,
    { params: { limit: 10, offset: 0, ...params } },
  )
  return data
}
