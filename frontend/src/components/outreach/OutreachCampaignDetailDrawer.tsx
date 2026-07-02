import { format, formatDistanceToNow } from 'date-fns'
import { AnimatePresence, motion } from 'framer-motion'
import { ExternalLink, MessageSquare, Package, Users, X } from 'lucide-react'
import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'

import { getLead } from '@/api/leads'
import { OutreachCampaignStatusBadge } from '@/components/outreach/OutreachCampaignStatusBadge'
import { OutreachChannelBadge } from '@/components/outreach/OutreachChannelBadge'
import { OutreachConversationStatusBadge } from '@/components/outreach/OutreachConversationStatusBadge'
import { OutreachMessageBubble } from '@/components/outreach/OutreachMessageBubble'
import { QualificationVerdictBadge } from '@/components/outreach/QualificationVerdictBadge'
import {
  useCampaignConversationsQuery,
  useConversationMessagesQuery,
  useOutreachCampaignQuery,
} from '@/hooks/useOutreach'
import { getCampaignDisplaySubject, getOutreachDraftMessage } from '@/lib/outreach'
import { cn } from '@/lib/utils'

const ease = [0.22, 1, 0.36, 1] as const

interface OutreachCampaignDetailDrawerProps {
  campaignId: string | null
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

export function OutreachCampaignDetailDrawer({
  campaignId,
  onClose,
}: OutreachCampaignDetailDrawerProps) {
  const { data: campaign, isLoading, isError } = useOutreachCampaignQuery(campaignId)
  const { data: conversations = [] } = useCampaignConversationsQuery(campaignId)
  const primaryConversation = conversations[0]
  const { data: messagesData } = useConversationMessagesQuery(primaryConversation?.id ?? null)

  const { data: lead } = useQuery({
    queryKey: ['leads', 'detail', campaign?.lead_id ?? ''],
    queryFn: () => getLead(campaign!.lead_id),
    enabled: Boolean(campaign?.lead_id),
  })

  useEffect(() => {
    if (!campaignId) return

    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose()
    }

    document.addEventListener('keydown', handleEscape)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = ''
    }
  }, [campaignId, onClose])

  const draftMessage = campaign ? getOutreachDraftMessage(campaign) : null
  const messages = messagesData?.items ?? []

  return (
    <AnimatePresence>
      {campaignId ? (
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
            aria-labelledby="outreach-drawer-title"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.3, ease }}
            className={cn(
              'relative flex h-full w-full max-w-xl flex-col border-l border-border/70 bg-surface-solid',
              'shadow-[var(--shadow-float)]',
            )}
          >
            <div className="flex items-center justify-between border-b border-border/60 px-5 py-4">
              <p className="text-sm font-semibold text-foreground">Campaign details</p>
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
                  <p className="text-sm text-muted">Unable to load campaign details.</p>
                </div>
              ) : null}

              {campaign ? (
                <div className="space-y-6 p-6">
                  <div className="flex flex-wrap items-center gap-2">
                    <OutreachCampaignStatusBadge status={campaign.status} />
                    <OutreachChannelBadge channel={campaign.channel} />
                  </div>

                  <div>
                    <h2
                      id="outreach-drawer-title"
                      className="text-xl font-semibold tracking-tight text-foreground"
                    >
                      {getCampaignDisplaySubject(campaign)}
                    </h2>
                    <p className="mt-1.5 text-sm text-muted">
                      Started{' '}
                      <time dateTime={campaign.created_at}>
                        {format(new Date(campaign.created_at), 'MMM d, yyyy')}
                      </time>
                      {' · '}
                      {formatDistanceToNow(new Date(campaign.created_at), { addSuffix: true })}
                    </p>
                  </div>

                  <section className="space-y-2">
                    <h3 className="text-xs font-semibold uppercase tracking-wide text-muted">
                      Connected records
                    </h3>
                    <div className="space-y-2 rounded-xl border border-border/80 bg-section-alt/40 p-3">
                      {lead ? (
                        <Link
                          to={`/leads?lead_id=${lead.id}`}
                          className="flex items-center gap-2 text-sm font-medium text-primary hover:underline"
                        >
                          <Users className="size-3.5" />
                          {lead.title}
                        </Link>
                      ) : (
                        <p className="text-sm text-muted">Lead {campaign.lead_id.slice(0, 8)}…</p>
                      )}
                      {campaign.deployment_package_id ? (
                        <p className="flex items-center gap-2 text-sm text-foreground">
                          <Package className="size-3.5 text-muted" />
                          Deployment package linked
                          <span className="font-mono text-xs text-muted">
                            {campaign.deployment_package_id.slice(0, 8)}…
                          </span>
                        </p>
                      ) : (
                        <p className="text-xs text-muted">No deployment package linked</p>
                      )}
                    </div>
                  </section>

                  {(campaign.recipient_email || campaign.recipient_phone) && (
                    <section className="space-y-2">
                      <h3 className="text-xs font-semibold uppercase tracking-wide text-muted">
                        Recipient
                      </h3>
                      <div className="text-sm text-foreground">
                        {campaign.recipient_email ? <p>{campaign.recipient_email}</p> : null}
                        {campaign.recipient_phone ? <p>{campaign.recipient_phone}</p> : null}
                      </div>
                    </section>
                  )}

                  {draftMessage ? (
                    <section className="space-y-2">
                      <h3 className="text-xs font-semibold uppercase tracking-wide text-muted">
                        AI draft
                      </h3>
                      <div className="rounded-xl border border-primary/20 bg-primary-soft/40 px-4 py-3 text-sm leading-relaxed text-foreground">
                        {draftMessage}
                      </div>
                    </section>
                  ) : null}

                  {campaign.error_message ? (
                    <section className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                      {campaign.error_message}
                    </section>
                  ) : null}

                  {conversations.length > 0 ? (
                    <section className="space-y-3">
                      <h3 className="text-xs font-semibold uppercase tracking-wide text-muted">
                        Conversations
                      </h3>
                      {conversations.map((conversation) => (
                        <div
                          key={conversation.id}
                          className="rounded-xl border border-border/80 bg-section-alt/40 p-3"
                        >
                          <div className="mb-2 flex flex-wrap items-center gap-2">
                            <OutreachConversationStatusBadge status={conversation.status} />
                            {conversation.qualification_verdict ? (
                              <QualificationVerdictBadge verdict={conversation.qualification_verdict} />
                            ) : null}
                            {conversation.qualification_score !== null ? (
                              <span className="text-xs text-muted">
                                Score: {conversation.qualification_score}
                              </span>
                            ) : null}
                          </div>
                          {conversation.summary ? (
                            <p className="text-sm leading-relaxed text-foreground">
                              {conversation.summary}
                            </p>
                          ) : null}
                          <Link
                            to={`/outreach/conversations/${conversation.id}?campaign_id=${campaign.id}`}
                            className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline"
                          >
                            <MessageSquare className="size-3.5" />
                            Open conversation workspace
                          </Link>
                        </div>
                      ))}
                    </section>
                  ) : null}

                  {messages.length > 0 ? (
                    <section className="space-y-3">
                      <div className="flex items-center justify-between gap-3">
                        <h3 className="text-xs font-semibold uppercase tracking-wide text-muted">
                          Message preview
                        </h3>
                        {primaryConversation ? (
                          <Link
                            to={`/outreach/conversations/${primaryConversation.id}?campaign_id=${campaign.id}`}
                            className="text-xs font-semibold text-primary hover:underline"
                          >
                            View full thread
                          </Link>
                        ) : null}
                      </div>
                      <div className="space-y-3">
                        {messages.slice(-3).map((message) => (
                          <OutreachMessageBubble
                            key={message.id}
                            role={message.role}
                            content={message.content}
                            createdAt={message.created_at}
                          />
                        ))}
                      </div>
                    </section>
                  ) : null}
                </div>
              ) : null}
            </div>

            {campaign && primaryConversation ? (
              <div className="space-y-2 border-t border-border/60 bg-surface-solid p-4">
                <Link
                  to={`/outreach/conversations/${primaryConversation.id}?campaign_id=${campaign.id}`}
                  className={cn(
                    'flex w-full items-center justify-center gap-2 rounded-[var(--radius-button)] bg-primary px-5 py-3',
                    'text-sm font-semibold text-white shadow-[var(--shadow-button)]',
                    'transition-shadow hover:shadow-[var(--shadow-button-hover)]',
                  )}
                >
                  <MessageSquare className="size-4" />
                  Open conversation workspace
                </Link>
                {lead ? (
                  <Link
                    to={`/leads?lead_id=${lead.id}`}
                    className={cn(
                      'flex w-full items-center justify-center gap-2 rounded-[var(--radius-button)] border border-border px-5 py-3',
                      'text-sm font-semibold text-foreground transition-colors hover:bg-section-alt',
                    )}
                  >
                    <ExternalLink className="size-4" />
                    Open lead workspace
                  </Link>
                ) : null}
              </div>
            ) : campaign && lead ? (
              <div className="border-t border-border/60 bg-surface-solid p-4">
                <Link
                  to={`/leads?lead_id=${lead.id}`}
                  className={cn(
                    'flex w-full items-center justify-center gap-2 rounded-[var(--radius-button)] border border-border px-5 py-3',
                    'text-sm font-semibold text-foreground transition-colors hover:bg-section-alt',
                  )}
                >
                  <ExternalLink className="size-4" />
                  Open lead workspace
                </Link>
              </div>
            ) : null}
          </motion.aside>
        </div>
      ) : null}
    </AnimatePresence>
  )
}
