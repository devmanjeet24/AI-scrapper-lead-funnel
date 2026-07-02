import { OutreachMessageBubble } from '@/components/outreach/OutreachMessageBubble'
import type { OutreachMessage } from '@/types/outreach'

interface ConversationThreadProps {
  messages: OutreachMessage[]
  isLoading?: boolean
}

function ThreadSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 4 }, (_, index) => (
        <div
          key={index}
          className={`h-16 animate-pulse rounded-xl bg-foreground/5 ${
            index % 2 === 0 ? 'mr-12' : 'ml-12'
          }`}
        />
      ))}
    </div>
  )
}

export function ConversationThread({ messages, isLoading }: ConversationThreadProps) {
  if (isLoading) {
    return <ThreadSkeleton />
  }

  if (messages.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border/80 bg-section-alt/30 px-4 py-8 text-center">
        <p className="text-sm text-muted">No messages yet. The outreach thread will appear here.</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {messages.map((message) => (
        <OutreachMessageBubble
          key={message.id}
          role={message.role}
          content={message.content}
          createdAt={message.created_at}
        />
      ))}
    </div>
  )
}
