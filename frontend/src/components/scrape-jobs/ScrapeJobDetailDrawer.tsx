import { format, formatDistanceToNow } from 'date-fns'
import { AnimatePresence, motion } from 'framer-motion'
import { ExternalLink, Loader2, Play, Radio, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import { ScrapeJobStatusBadge } from '@/components/scrape-jobs/ScrapeJobStatusBadge'
import { ScrapeResultStatusBadge } from '@/components/scrape-jobs/ScrapeResultStatusBadge'
import { ScrapeSourceTypeBadge } from '@/components/scrape-jobs/ScrapeSourceTypeBadge'
import { dashboardKeys } from '@/hooks/useDashboardStats'
import {
  scrapeJobKeys,
  useRunScrapeJobMutation,
  useScrapeJobQuery,
  useScrapeJobResultsQuery,
  useScrapeResultQuery,
} from '@/hooks/useScrapeJobs'
import {
  canRunScrapeJob,
  getSignalsCreatedFromResult,
  isScrapeResultTerminal,
} from '@/lib/scrape'
import { cn } from '@/lib/utils'

const ease = [0.22, 1, 0.36, 1] as const

interface ScrapeJobDetailDrawerProps {
  jobId: string | null
  onClose: () => void
}

function DrawerSkeleton() {
  return (
    <div className="space-y-6 p-6">
      <div className="flex gap-2">
        <div className="h-6 w-16 animate-pulse rounded-full bg-foreground/5" />
        <div className="h-6 w-16 animate-pulse rounded-full bg-foreground/5" />
      </div>
      <div className="h-8 w-3/4 animate-pulse rounded bg-foreground/5" />
      <div className="h-24 animate-pulse rounded-xl bg-foreground/5" />
    </div>
  )
}

export function ScrapeJobDetailDrawer({ jobId, onClose }: ScrapeJobDetailDrawerProps) {
  const queryClient = useQueryClient()
  const { data: job, isLoading, isError, refetch } = useScrapeJobQuery(jobId)
  const runMutation = useRunScrapeJobMutation()
  const [pollingResultId, setPollingResultId] = useState<string | null>(null)
  const toastedResultIdRef = useRef<string | null>(null)

  const { data: runResult } = useScrapeResultQuery(pollingResultId)
  const { data: jobResults } = useScrapeJobResultsQuery(jobId)
  const results = jobResults?.items ?? []
  const displayResult = runResult ?? results[0] ?? null

  useEffect(() => {
    if (!jobId) return

    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose()
    }

    document.addEventListener('keydown', handleEscape)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = ''
    }
  }, [jobId, onClose])

  useEffect(() => {
    setPollingResultId(null)
    toastedResultIdRef.current = null
  }, [jobId])

  useEffect(() => {
    if (!jobId) return
    if (!runResult || !isScrapeResultTerminal(runResult.status)) return
    if (toastedResultIdRef.current === runResult.id) return

    toastedResultIdRef.current = runResult.id
    queryClient.invalidateQueries({ queryKey: scrapeJobKeys.detail(jobId) })
    queryClient.invalidateQueries({ queryKey: scrapeJobKeys.jobResults(jobId) })
    queryClient.invalidateQueries({ queryKey: scrapeJobKeys.lists() })
    queryClient.invalidateQueries({ queryKey: dashboardKeys.stats() })
    refetch()

    if (runResult.status === 'success') {
      const signalsCreated = getSignalsCreatedFromResult(runResult)
      const summary = runResult.summary ?? 'Scrape completed successfully.'
      toast.success('Scrape completed', {
        description:
          signalsCreated !== null
            ? `${summary} · ${signalsCreated} signal${signalsCreated === 1 ? '' : 's'} created`
            : summary,
        action:
          signalsCreated && signalsCreated > 0
            ? {
                label: 'View signals',
                onClick: () => {
                  window.location.href = `/signals?scrape_job_id=${jobId}`
                },
              }
            : undefined,
      })
    } else {
      toast.error('Scrape failed', {
        description: runResult.error_message ?? 'The scrape run did not complete.',
      })
    }
  }, [runResult, jobId, queryClient, refetch])

  async function handleRunJob() {
    if (!jobId || !job || !canRunScrapeJob(job)) return
    const response = await runMutation.mutateAsync(jobId)
    setPollingResultId(response.result_id)
    toastedResultIdRef.current = null
    queryClient.invalidateQueries({ queryKey: scrapeJobKeys.jobResults(jobId) })
  }

  const isRunning =
    runMutation.isPending ||
    (displayResult?.status === 'pending' || displayResult?.status === 'running')
  const canRun = job ? canRunScrapeJob(job) : false
  const signalsCreated = displayResult ? getSignalsCreatedFromResult(displayResult) : null

  return (
    <AnimatePresence>
      {jobId ? (
        <div className="fixed inset-0 z-50 flex justify-end">
          <motion.button
            type="button"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-foreground/20 backdrop-blur-sm"
            aria-label="Close drawer"
            onClick={onClose}
          />

          <motion.aside
            role="dialog"
            aria-modal="true"
            aria-labelledby="scrape-job-drawer-title"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.3, ease }}
            className={cn(
              'relative flex h-full w-full max-w-md flex-col border-l border-border/70 bg-surface-solid',
              'shadow-[var(--shadow-float)]',
            )}
          >
            <div className="flex items-center justify-between border-b border-border/60 px-5 py-4">
              <p className="text-sm font-semibold text-foreground">Job details</p>
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg p-1.5 text-muted transition-colors hover:bg-section-alt hover:text-foreground"
                aria-label="Close"
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto">
              {isLoading ? <DrawerSkeleton /> : null}

              {isError ? (
                <div className="p-6 text-center">
                  <p className="text-sm text-muted">Unable to load job details.</p>
                </div>
              ) : null}

              {job ? (
                <div className="space-y-6 p-6">
                  <div className="flex flex-wrap items-center gap-2">
                    <ScrapeJobStatusBadge status={job.status} />
                    <ScrapeSourceTypeBadge sourceType={job.source_type} />
                    {!job.is_active ? (
                      <span className="rounded-full border border-border bg-section-alt px-2.5 py-0.5 text-xs font-medium text-muted">
                        Inactive
                      </span>
                    ) : null}
                  </div>

                  <div>
                    <h2
                      id="scrape-job-drawer-title"
                      className="text-xl font-semibold tracking-tight text-foreground"
                    >
                      {job.name}
                    </h2>
                    <p className="mt-1.5 text-sm text-muted">
                      Created{' '}
                      <time dateTime={job.created_at}>
                        {format(new Date(job.created_at), 'MMM d, yyyy')}
                      </time>
                      {' · '}
                      {formatDistanceToNow(new Date(job.created_at), { addSuffix: true })}
                    </p>
                  </div>

                  {job.description ? (
                    <section className="space-y-2">
                      <h3 className="text-xs font-semibold uppercase tracking-wide text-muted">
                        Description
                      </h3>
                      <p className="text-sm leading-relaxed text-foreground">{job.description}</p>
                    </section>
                  ) : null}

                  <section className="space-y-2">
                    <h3 className="text-xs font-semibold uppercase tracking-wide text-muted">
                      Target URL
                    </h3>
                    <a
                      href={job.target_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 break-all text-sm text-primary hover:underline"
                    >
                      {job.target_url}
                      <ExternalLink className="size-3.5 shrink-0" />
                    </a>
                  </section>

                  <section className="space-y-2">
                    <h3 className="text-xs font-semibold uppercase tracking-wide text-muted">
                      Last run
                    </h3>
                    {job.last_run_at ? (
                      <p className="text-sm text-foreground">
                        <time dateTime={job.last_run_at}>
                          {format(new Date(job.last_run_at), 'MMM d, yyyy · h:mm a')}
                        </time>
                        {' · '}
                        {formatDistanceToNow(new Date(job.last_run_at), { addSuffix: true })}
                      </p>
                    ) : (
                      <p className="text-sm text-muted">This job has not been run yet.</p>
                    )}
                  </section>

                  {displayResult ? (
                    <section className="space-y-3 rounded-xl border border-border/80 bg-section-alt/40 p-4">
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="text-xs font-semibold uppercase tracking-wide text-muted">
                          {isRunning ? 'Current run' : 'Latest run result'}
                        </h3>
                        <ScrapeResultStatusBadge status={displayResult.status} />
                      </div>

                      {isRunning ? (
                        <div className="flex items-center gap-2 text-sm text-muted">
                          <Loader2 className="size-4 animate-spin text-primary" />
                          {displayResult.status === 'pending' ? 'Queued…' : 'Scraping page…'}
                        </div>
                      ) : null}

                      {displayResult.status === 'success' && displayResult.summary ? (
                        <p className="text-sm leading-relaxed text-foreground">
                          {displayResult.summary}
                        </p>
                      ) : null}

                      {displayResult.status === 'success' && displayResult.page_title ? (
                        <p className="text-xs text-muted">Page: {displayResult.page_title}</p>
                      ) : null}

                      {signalsCreated !== null ? (
                        <p className="text-sm text-emerald-700">
                          {signalsCreated} signal{signalsCreated === 1 ? '' : 's'} created
                        </p>
                      ) : null}

                      {displayResult.status === 'failed' && displayResult.error_message ? (
                        <p className="text-sm text-red-600">{displayResult.error_message}</p>
                      ) : null}

                      {displayResult.status === 'success' && signalsCreated && signalsCreated > 0 ? (
                        <Link
                          to={`/signals?scrape_job_id=${job.id}`}
                          className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline"
                        >
                          <Radio className="size-3.5" />
                          View signals
                        </Link>
                      ) : null}
                    </section>
                  ) : null}

                  {results.length > 0 ? (
                    <section className="space-y-2">
                      <h3 className="text-xs font-semibold uppercase tracking-wide text-muted">
                        Run history
                      </h3>
                      <ul className="space-y-1.5">
                        {results.map((result) => (
                          <li
                            key={result.id}
                            className="flex items-center justify-between gap-3 rounded-lg border border-border/60 bg-surface-solid px-3 py-2"
                          >
                            <span className="text-xs text-muted">
                              {format(new Date(result.created_at), 'MMM d · h:mm a')}
                            </span>
                            <ScrapeResultStatusBadge status={result.status} />
                          </li>
                        ))}
                      </ul>
                    </section>
                  ) : null}
                </div>
              ) : null}
            </div>

            {job ? (
              <div className="border-t border-border/60 bg-surface-solid p-4">
                <button
                  type="button"
                  disabled={!canRun || isRunning}
                  onClick={handleRunJob}
                  title={
                    canRun
                      ? 'Run this scrape job now'
                      : 'Job is archived or inactive and cannot be run'
                  }
                  className={cn(
                    'flex w-full items-center justify-center gap-2 rounded-[var(--radius-button)] bg-primary px-5 py-3',
                    'text-sm font-semibold text-white shadow-[var(--shadow-button)]',
                    'transition-shadow hover:shadow-[var(--shadow-button-hover)] disabled:opacity-60',
                  )}
                >
                  {isRunning ? (
                    <>
                      <Loader2 className="size-4 animate-spin" />
                      Running…
                    </>
                  ) : (
                    <>
                      <Play className="size-4" />
                      Run Job
                    </>
                  )}
                </button>
              </div>
            ) : null}
          </motion.aside>
        </div>
      ) : null}
    </AnimatePresence>
  )
}
