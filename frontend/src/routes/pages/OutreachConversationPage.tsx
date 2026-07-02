import { format, formatDistanceToNow } from 'date-fns'
import { motion } from 'framer-motion'
import { ArrowLeft, ExternalLink, Loader2, Sparkles, Users } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'

import { getLead } from '@/api/leads'
import { DashboardAtmosphere } from '@/components/dashboard/DashboardAtmosphere'
import { SIDEBAR_NAV } from '@/components/dashboard/dashboard-data'
import { BookAppointmentCta } from '@/components/outreach/BookAppointmentCta'
import { ConversationReplyComposer } from '@/components/outreach/ConversationReplyComposer'
import { ConversationThread } from '@/components/outreach/ConversationThread'
import { OutreachCampaignStatusBadge } from '@/components/outreach/OutreachCampaignStatusBadge'
import { OutreachChannelBadge } from '@/components/outreach/OutreachChannelBadge'
import { OutreachConversationStatusBadge } from '@/components/outreach/OutreachConversationStatusBadge'
import { VettingResultsPanel } from '@/components/outreach/VettingResultsPanel'
import {
  useAddLeadReplyMutation,
  useConversationMessagesQuery,
  useOutreachCampaignQuery,
  useOutreachConversationQuery,
  useVetConversationMutation,
} from '@/hooks/useOutreach'
import {
  canBookAppointment,
  canReplyToConversation,
  getCampaignDisplaySubject,
  getVettingInsights,
} from '@/lib/outreach'
import { cn } from '@/lib/utils'
import type { VettingResponse } from '@/types/outreach'

function ConversationPageSkeleton() {
  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
      <div className="h-[480px] animate-pulse rounded-2xl bg-foreground/5" />
      <div className="h-[320px] animate-pulse rounded-2xl bg-foreground/5" />
    </div>
  )
}

export function OutreachConversationPage() {
  const { conversationId } = useParams<{ conversationId: string }>()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const campaignIdFromQuery = searchParams.get('campaign_id')
  const [lastVetting, setLastVetting] = useState<VettingResponse | null>(null)

  const {
    data: conversation,
    isLoading: isConversationLoading,
    isError: isConversationError,
  } = useOutreachConversationQuery(conversationId ?? null)

  const campaignId = campaignIdFromQuery ?? conversation?.campaign_id ?? null

  const { data: campaign } = useOutreachCampaignQuery(campaignId)
  const { data: messagesData, isLoading: isMessagesLoading } = useConversationMessagesQuery(
    conversationId ?? null,
  )

  const { data: lead } = useQuery({
    queryKey: ['leads', 'detail', conversation?.lead_id ?? ''],
    queryFn: () => getLead(conversation!.lead_id),
    enabled: Boolean(conversation?.lead_id),
  })

  const replyMutation = useAddLeadReplyMutation()
  const vetMutation = useVetConversationMutation()

  const messages = messagesData?.items ?? []
  const vettingInsights = useMemo(
    () => getVettingInsights(conversation, lastVetting),
    [conversation, lastVetting],
  )

  const canReply = conversation ? canReplyToConversation(conversation) : false
  const showAppointmentCta = conversation ? canBookAppointment(conversation) : false
  const isActionPending = replyMutation.isPending || vetMutation.isPending

  const backHref = campaignId ? `/outreach?campaign_id=${campaignId}` : '/outreach'

  async function handleReply(payload: { content: string; auto_vet: boolean }) {
    if (!conversationId) return
    await replyMutation.mutateAsync({ conversationId, payload })
    setLastVetting(null)
  }

  async function handleVet() {
    if (!conversationId) return
    const result = await vetMutation.mutateAsync(conversationId)
    setLastVetting(result)
  }

  return (
    <div className="relative isolate min-h-full bg-background">
      <DashboardAtmosphere />

      <div className="relative z-0 flex flex-col">
        <div className="glass-surface border-b border-border px-4 py-3 lg:hidden">
          <nav className="flex gap-1 overflow-x-auto pb-0.5">
            {SIDEBAR_NAV.map((item) => {
              const Icon = item.icon
              const isActive = item.href === '/outreach'

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
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="space-y-3">
                <button
                  type="button"
                  onClick={() => navigate(backHref)}
                  className="inline-flex items-center gap-1.5 text-sm font-medium text-muted transition-colors hover:text-foreground"
                >
                  <ArrowLeft className="size-4" />
                  Back to outreach
                </button>

                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted">
                    Conversation workspace
                  </p>
                  <h1 className="mt-1 text-2xl font-semibold tracking-tight text-foreground">
                    {lead?.title ?? 'Outreach conversation'}
                  </h1>
                  {conversation ? (
                    <p className="mt-1.5 text-sm text-muted">
                      Updated{' '}
                      <time dateTime={conversation.updated_at}>
                        {format(new Date(conversation.updated_at), 'MMM d, yyyy')}
                      </time>
                      {' · '}
                      {formatDistanceToNow(new Date(conversation.updated_at), { addSuffix: true })}
                    </p>
                  ) : null}
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {conversation ? (
                    <OutreachConversationStatusBadge status={conversation.status} />
                  ) : null}
                  {campaign ? (
                    <>
                      <OutreachCampaignStatusBadge status={campaign.status} />
                      <OutreachChannelBadge channel={campaign.channel} />
                    </>
                  ) : null}
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {lead ? (
                  <Link
                    to={`/leads?lead_id=${lead.id}`}
                    className={cn(
                      'inline-flex items-center gap-2 rounded-[var(--radius-button)] border border-border px-4 py-2.5',
                      'text-sm font-semibold text-foreground transition-colors hover:bg-section-alt',
                    )}
                  >
                    <Users className="size-4" />
                    Lead workspace
                  </Link>
                ) : null}
                {campaign ? (
                  <Link
                    to={`/outreach?campaign_id=${campaign.id}`}
                    className={cn(
                      'inline-flex items-center gap-2 rounded-[var(--radius-button)] border border-border px-4 py-2.5',
                      'text-sm font-semibold text-foreground transition-colors hover:bg-section-alt',
                    )}
                  >
                    <ExternalLink className="size-4" />
                    {getCampaignDisplaySubject(campaign)}
                  </Link>
                ) : null}
              </div>
            </div>

            {isConversationLoading ? <ConversationPageSkeleton /> : null}

            {isConversationError ? (
              <div className="rounded-2xl border border-border/80 bg-surface-solid px-6 py-10 text-center">
                <p className="text-sm text-muted">Unable to load this conversation.</p>
                <button
                  type="button"
                  onClick={() => navigate('/outreach')}
                  className="mt-4 text-sm font-semibold text-primary hover:underline"
                >
                  Return to outreach
                </button>
              </div>
            ) : null}

            {conversation ? (
              <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
                <section className="flex min-h-[520px] flex-col rounded-2xl border border-border/80 bg-surface-solid shadow-[var(--shadow-soft)]">
                  <div className="border-b border-border/60 px-5 py-4">
                    <h2 className="text-sm font-semibold text-foreground">Message thread</h2>
                    <p className="mt-0.5 text-xs text-muted">
                      Full timeline of agent, lead, and system messages.
                    </p>
                  </div>

                  <div className="flex-1 overflow-y-auto px-5 py-4">
                    <ConversationThread messages={messages} isLoading={isMessagesLoading} />
                  </div>

                  <div className="border-t border-border/60 px-5 py-4">
                    {canReply ? (
                      <ConversationReplyComposer
                        disabled={!canReply}
                        isSubmitting={replyMutation.isPending}
                        onSubmit={handleReply}
                      />
                    ) : (
                      <p className="rounded-xl border border-border/80 bg-section-alt/40 px-4 py-3 text-sm text-muted">
                        Replies are closed for conversations with status{' '}
                        <span className="font-medium text-foreground">{conversation.status}</span>.
                      </p>
                    )}
                  </div>
                </section>

                <aside className="space-y-4">
                  <section className="rounded-2xl border border-border/80 bg-surface-solid p-5 shadow-[var(--shadow-soft)]">
                    <div className="mb-4 flex items-center justify-between gap-3">
                      <div>
                        <h2 className="text-sm font-semibold text-foreground">AI vetting</h2>
                        <p className="mt-0.5 text-xs text-muted">
                          Qualification score, verdict, and conversation insights.
                        </p>
                      </div>
                      <button
                        type="button"
                        disabled={isActionPending || messages.length === 0}
                        onClick={handleVet}
                        className={cn(
                          'inline-flex shrink-0 items-center gap-1.5 rounded-xl border border-border/80 px-3 py-2',
                          'text-xs font-medium text-foreground transition-colors hover:bg-section-alt disabled:opacity-50',
                        )}
                      >
                        {vetMutation.isPending ? (
                          <Loader2 className="size-3.5 animate-spin" />
                        ) : (
                          <Sparkles className="size-3.5 text-primary" />
                        )}
                        Run vetting
                      </button>
                    </div>

                    <VettingResultsPanel insights={vettingInsights} />
                  </section>

                  {showAppointmentCta ? (
                    <BookAppointmentCta conversationId={conversation.id} />
                  ) : null}
                </aside>
              </div>
            ) : null}
          </div>
        </motion.main>
      </div>
    </div>
  )
}
