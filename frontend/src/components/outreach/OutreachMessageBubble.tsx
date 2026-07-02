import { format } from 'date-fns'

import { cn } from '@/lib/utils'
import type { OutreachMessageRole } from '@/types/outreach'

interface OutreachMessageBubbleProps {
  role: OutreachMessageRole
  content: string
  createdAt: string
}

const ROLE_LABELS: Record<OutreachMessageRole, string> = {
  agent: 'Agent',
  lead: 'Lead',
  system: 'System',
}

export function OutreachMessageBubble({ role, content, createdAt }: OutreachMessageBubbleProps) {
  if (role === 'system') {
    return (
      <div className="flex justify-center py-1">
        <div className="max-w-[95%] rounded-lg border border-border/60 bg-section-alt/50 px-3 py-2 text-center">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-muted">System</p>
          <p className="mt-0.5 text-xs leading-relaxed text-muted">{content}</p>
          <time dateTime={createdAt} className="mt-1 block text-[10px] text-muted/70">
            {format(new Date(createdAt), 'MMM d · h:mm a')}
          </time>
        </div>
      </div>
    )
  }

  const isAgent = role === 'agent'

  return (
    <div className={cn('flex', isAgent ? 'justify-start' : 'justify-end')}>
      <div
        className={cn(
          'max-w-[85%] rounded-xl px-3 py-2.5 text-sm leading-relaxed',
          isAgent
            ? 'border border-border/80 bg-section-alt/60 text-foreground'
            : 'bg-primary text-white',
        )}
      >
        <p className="mb-1 text-[10px] font-semibold uppercase tracking-wide opacity-70">
          {ROLE_LABELS[role]}
        </p>
        <p className="whitespace-pre-wrap">{content}</p>
        <time dateTime={createdAt} className="mt-1 block text-[10px] opacity-60">
          {format(new Date(createdAt), 'MMM d · h:mm a')}
        </time>
      </div>
    </div>
  )
}
