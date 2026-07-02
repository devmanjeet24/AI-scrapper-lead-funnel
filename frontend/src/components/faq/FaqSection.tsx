import { AnimatePresence, motion } from 'framer-motion'
import { ChevronDown, CircleHelp } from 'lucide-react'
import { useState } from 'react'

import { cn } from '@/lib/utils'

import { faqItems } from './faq-data'

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-40px' },
  transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] as const },
}

function FaqAccordionItem({
  item,
  isOpen,
  onToggle,
}: {
  item: (typeof faqItems)[number]
  isOpen: boolean
  onToggle: () => void
}) {
  return (
    <div
      className={cn(
        'rounded-2xl border transition-colors duration-300',
        isOpen
          ? 'border-primary/25 bg-surface-solid shadow-[0_8px_32px_rgb(28_200_141/0.08)]'
          : 'border-border/70 bg-surface-solid/80 hover:border-primary/15',
      )}
    >
      <button
        type="button"
        id={`faq-trigger-${item.id}`}
        aria-expanded={isOpen}
        aria-controls={`faq-panel-${item.id}`}
        onClick={onToggle}
        className="flex w-full items-start justify-between gap-4 px-5 py-5 text-left sm:px-6 sm:py-5"
      >
        <span className="text-base font-semibold leading-snug tracking-tight text-foreground sm:text-[1.05rem]">
          {item.question}
        </span>
        <ChevronDown
          className={cn(
            'mt-0.5 size-5 shrink-0 text-muted transition-transform duration-300',
            isOpen && 'rotate-180 text-primary',
          )}
        />
      </button>

      <AnimatePresence initial={false}>
        {isOpen ? (
          <motion.div
            id={`faq-panel-${item.id}`}
            role="region"
            aria-labelledby={`faq-trigger-${item.id}`}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <p className="px-5 pb-5 text-sm leading-relaxed text-muted sm:px-6 sm:pb-6 sm:text-[0.95rem]">
              {item.answer}
            </p>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  )
}

export function FaqSection() {
  const [openId, setOpenId] = useState<string | null>(faqItems[0]?.id ?? null)

  return (
    <section
      id="faq"
      className={cn(
        'relative rounded-[28px] border border-border/60',
        'bg-section-alt shadow-[var(--shadow-soft)] sm:rounded-[32px] lg:rounded-[40px]',
      )}
    >
      <div
        className="pointer-events-none absolute inset-0 rounded-[inherit]"
        style={{
          background: `
            radial-gradient(ellipse 60% 50% at 15% 20%, rgb(28 200 141 / 0.06), transparent 55%),
            radial-gradient(ellipse 50% 40% at 90% 80%, rgb(28 200 141 / 0.05), transparent 50%)
          `,
        }}
      />

      <div className="relative z-10 px-4 py-12 sm:px-8 sm:py-16 lg:px-12 lg:py-20">
        <div className="mx-auto max-w-3xl">
          <motion.div {...fadeUp} className="text-center">
            <span
              className={cn(
                'inline-flex items-center gap-2 rounded-full border border-border',
                'bg-surface/90 px-4 py-1.5 text-[11px] font-semibold tracking-wide text-primary uppercase backdrop-blur-sm',
              )}
            >
              <CircleHelp className="size-3.5" />
              FAQ
            </span>

            <h2 className="mt-4 text-3xl font-bold tracking-[-0.02em] text-foreground sm:text-4xl lg:text-[2.5rem] lg:leading-[1.1]">
              How LeadFlow fits your outbound workflow
            </h2>

            <p className="mx-auto mt-3 max-w-2xl text-base leading-relaxed text-muted sm:text-lg">
              You have seen the four-agent pipeline. These are the questions teams
              ask before they wire it into a live funnel — answered against what the
              platform actually does today.
            </p>
          </motion.div>

          <motion.div
            {...fadeUp}
            transition={{ ...fadeUp.transition, delay: 0.08 }}
            className="mt-10 space-y-3 sm:mt-12 sm:space-y-3.5"
          >
            {faqItems.map((item) => (
              <FaqAccordionItem
                key={item.id}
                item={item}
                isOpen={openId === item.id}
                onToggle={() =>
                  setOpenId((current) => (current === item.id ? null : item.id))
                }
              />
            ))}
          </motion.div>

          <motion.p
            {...fadeUp}
            transition={{ ...fadeUp.transition, delay: 0.14 }}
            className="mt-8 text-center text-sm text-muted"
          >
            Still have questions?{' '}
            <a
              href="mailto:hello@leadflow.com"
              className="font-medium text-primary underline-offset-4 transition-colors hover:text-foreground hover:underline"
            >
              Reach out for a live walkthrough
            </a>
            .
          </motion.p>
        </div>
      </div>
    </section>
  )
}
