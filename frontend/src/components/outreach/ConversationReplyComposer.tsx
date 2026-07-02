import { Loader2, Send } from 'lucide-react'
import { useState, type FormEvent } from 'react'

import { cn } from '@/lib/utils'

interface ConversationReplyComposerProps {
  disabled?: boolean
  isSubmitting?: boolean
  onSubmit: (payload: { content: string; auto_vet: boolean }) => void
}

export function ConversationReplyComposer({
  disabled = false,
  isSubmitting = false,
  onSubmit,
}: ConversationReplyComposerProps) {
  const [content, setContent] = useState('')
  const [autoVet, setAutoVet] = useState(true)

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    const trimmed = content.trim()
    if (!trimmed || disabled || isSubmitting) return
    onSubmit({ content: trimmed, auto_vet: autoVet })
    setContent('')
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="space-y-1.5">
        <label htmlFor="conversation-reply" className="text-xs font-semibold uppercase tracking-wide text-muted">
          Lead reply
        </label>
        <textarea
          id="conversation-reply"
          rows={3}
          value={content}
          disabled={disabled || isSubmitting}
          onChange={(event) => setContent(event.target.value)}
          placeholder="Type the lead's reply to continue the conversation…"
          className={cn(
            'w-full resize-none rounded-xl border border-border/80 bg-background px-3.5 py-2.5 text-sm text-foreground',
            'focus:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/15',
            'disabled:cursor-not-allowed disabled:opacity-60',
          )}
        />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <label className="inline-flex cursor-pointer items-center gap-2 text-sm text-foreground">
          <input
            type="checkbox"
            checked={autoVet}
            disabled={disabled || isSubmitting}
            onChange={(event) => setAutoVet(event.target.checked)}
            className="size-4 rounded border-border text-primary focus:ring-primary/20"
          />
          Auto-vet after send
        </label>

        <button
          type="submit"
          disabled={disabled || isSubmitting || !content.trim()}
          className={cn(
            'inline-flex items-center gap-2 rounded-[var(--radius-button)] bg-primary px-4 py-2.5',
            'text-sm font-semibold text-white shadow-[var(--shadow-button)]',
            'transition-shadow hover:shadow-[var(--shadow-button-hover)] disabled:opacity-60',
          )}
        >
          {isSubmitting ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Send className="size-4" />
          )}
          Send reply
        </button>
      </div>
    </form>
  )
}
