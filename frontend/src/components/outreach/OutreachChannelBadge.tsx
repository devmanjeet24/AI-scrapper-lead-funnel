import { cn } from '@/lib/utils'
import type { OutreachChannel } from '@/types/outreach'

const CHANNEL_STYLES: Record<OutreachChannel, string> = {
  internal: 'border-border bg-section-alt text-muted',
  email: 'border-blue-200/80 bg-blue-50/80 text-blue-700',
  sms: 'border-violet-200/80 bg-violet-50/80 text-violet-700',
  voice: 'border-orange-200/80 bg-orange-50/80 text-orange-700',
}

const CHANNEL_LABELS: Record<OutreachChannel, string> = {
  internal: 'Internal',
  email: 'Email',
  sms: 'SMS',
  voice: 'Voice',
}

interface OutreachChannelBadgeProps {
  channel: OutreachChannel
  className?: string
}

export function OutreachChannelBadge({ channel, className }: OutreachChannelBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium',
        CHANNEL_STYLES[channel],
        className,
      )}
    >
      {CHANNEL_LABELS[channel]}
    </span>
  )
}
