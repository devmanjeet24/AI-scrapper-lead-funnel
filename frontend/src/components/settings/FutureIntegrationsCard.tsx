import type { LucideIcon } from 'lucide-react'
import { Mail, Phone, PhoneCall, Plug } from 'lucide-react'

import { SettingsCard } from '@/components/settings/SettingsCard'
import { cn } from '@/lib/utils'
import type { FutureIntegrationsStatus } from '@/types/settings'

interface FutureIntegrationsCardProps {
  integrations: FutureIntegrationsStatus
}

interface IntegrationItem {
  key: keyof FutureIntegrationsStatus
  name: string
  description: string
  icon: LucideIcon
}

const INTEGRATIONS: IntegrationItem[] = [
  {
    key: 'resend_configured',
    name: 'Resend',
    description: 'Transactional email delivery',
    icon: Mail,
  },
  {
    key: 'retell_configured',
    name: 'Retell AI',
    description: 'Voice agent calling',
    icon: PhoneCall,
  },
  {
    key: 'vapi_configured',
    name: 'Vapi',
    description: 'Voice AI outreach',
    icon: Phone,
  },
]

export function FutureIntegrationsCard({ integrations }: FutureIntegrationsCardProps) {
  return (
    <SettingsCard
      icon={Plug}
      title="Future Integrations"
      description="Additional channels — coming soon"
    >
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {INTEGRATIONS.map((item) => {
          const Icon = item.icon
          const configured = integrations[item.key]

          return (
            <div
              key={item.key}
              className="flex items-start gap-3 rounded-2xl border border-border/80 bg-section-alt/40 p-4"
            >
              <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-surface-solid text-muted shadow-[var(--shadow-soft)]">
                <Icon className="size-4" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-foreground">{item.name}</p>
                  <span
                    className={cn(
                      'inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium',
                      configured
                        ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                        : 'border-border bg-surface-solid text-muted',
                    )}
                  >
                    {configured ? 'Configured' : 'Coming soon'}
                  </span>
                </div>
                <p className="mt-0.5 text-xs text-muted">{item.description}</p>
              </div>
            </div>
          )
        })}
      </div>
    </SettingsCard>
  )
}
