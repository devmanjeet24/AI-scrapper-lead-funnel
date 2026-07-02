import { Calendar } from 'lucide-react'
import { Link } from 'react-router-dom'

import { cn } from '@/lib/utils'

interface BookAppointmentCtaProps {
  conversationId: string
  className?: string
}

export function BookAppointmentCta({ conversationId, className }: BookAppointmentCtaProps) {
  return (
    <div
      className={cn(
        'rounded-xl border border-violet-200/80 bg-violet-50/60 px-4 py-4',
        className,
      )}
    >
      <p className="text-sm font-medium text-violet-900">Ready for scheduling</p>
      <p className="mt-1 text-xs leading-relaxed text-violet-800/80">
        This conversation is qualified for a sales handoff. Book an appointment to continue in the
        appointments workflow.
      </p>
      <Link
        to={`/appointments?conversation_id=${conversationId}&propose=1`}
        className={cn(
          'mt-3 inline-flex w-full items-center justify-center gap-2 rounded-[var(--radius-button)] bg-violet-600 px-4 py-2.5',
          'text-sm font-semibold text-white shadow-[var(--shadow-button)]',
          'transition-shadow hover:bg-violet-700 hover:shadow-[var(--shadow-button-hover)]',
        )}
      >
        <Calendar className="size-4" />
        Book appointment
      </Link>
    </div>
  )
}
