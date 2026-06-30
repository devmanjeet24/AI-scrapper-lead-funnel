import { motion } from 'framer-motion'
import { ArrowRight, Calendar, Radio, Sparkles } from 'lucide-react'
import { Link } from 'react-router-dom'

import { cn } from '@/lib/utils'

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-40px' },
  transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const },
}

const pipelineSteps = [
  { icon: Radio, label: 'Signals detected' },
  { icon: Sparkles, label: 'Outreach drafted' },
  { icon: Calendar, label: 'Meetings booked' },
] as const

export function FinalCtaSection() {
  return (
    <section
      id="get-started"
      className={cn(
        'relative overflow-hidden rounded-[28px] border border-primary/20',
        'bg-surface-solid shadow-[var(--shadow-float)] sm:rounded-[32px] lg:rounded-[40px]',
      )}
    >
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: `
            radial-gradient(ellipse 70% 60% at 50% 0%, rgb(28 200 141 / 0.14), transparent 62%),
            radial-gradient(ellipse 45% 40% at 100% 100%, rgb(28 200 141 / 0.08), transparent 55%)
          `,
        }}
      />

      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />

      <div className="relative z-10 px-4 py-14 sm:px-8 sm:py-16 lg:px-12 lg:py-20">
        <motion.div {...fadeUp} className="mx-auto max-w-3xl text-center">
          <p className="text-xs font-semibold tracking-[0.18em] text-primary uppercase">
            Ready when you are
          </p>

          <h2 className="mt-4 text-3xl font-bold tracking-[-0.03em] text-foreground sm:text-4xl lg:text-[2.85rem] lg:leading-[1.08]">
            Stop chasing leads.
            <br className="hidden sm:block" />
            <span className="text-primary"> Start filling your calendar.</span>
          </h2>

          <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-muted sm:text-lg">
            LeadFlow is demo-ready today — scrape intelligence, AI qualification,
            personalized outreach, and Google Calendar booking in one connected
            funnel. Sign up to run the pipeline yourself, or book a walkthrough
            for your team.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3 sm:gap-4">
            <motion.div
              whileHover={{
                scale: 1.02,
                y: -2,
                boxShadow:
                  '0 0 48px rgb(28 200 141 / 0.22), 0 16px 40px rgb(28 200 141 / 0.32)',
              }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: 'spring', stiffness: 400, damping: 28 }}
            >
              <Link
                to="/register"
                className={cn(
                  'group relative inline-flex items-center gap-2 overflow-hidden rounded-[var(--radius-button)]',
                  'bg-primary px-7 py-3.5 text-sm font-semibold text-white sm:px-8 sm:py-4 sm:text-base',
                  'shadow-[0_16px_40px_rgb(28_200_141/0.32)]',
                )}
              >
                <span className="pointer-events-none absolute inset-0 bg-gradient-to-r from-white/0 via-white/12 to-white/0 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                Sign up — run the pipeline
                <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-0.5 sm:size-[18px]" />
              </Link>
            </motion.div>

            <motion.a
              href="mailto:hello@leadflow.com?subject=Book%20a%20LeadFlow%20walkthrough"
              whileHover={{
                scale: 1.02,
                y: -2,
                borderColor: 'rgb(28 200 141 / 0.35)',
                boxShadow: '0 8px 28px rgb(45 45 45 / 0.08)',
              }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: 'spring', stiffness: 400, damping: 28 }}
              className={cn(
                'inline-flex items-center gap-2 rounded-[var(--radius-button)] border border-border',
                'bg-surface-solid/90 px-7 py-3.5 text-sm font-semibold text-foreground backdrop-blur-sm sm:px-8 sm:py-4 sm:text-base',
                'shadow-[0_4px_16px_rgb(45_45_45/0.04)]',
              )}
            >
              Book a live walkthrough
            </motion.a>
          </div>

          <p className="mt-5 text-xs text-muted sm:text-sm">
            No credit card required · Google Calendar connects in minutes · Full
            agent workflow available on signup
          </p>

          <div className="mx-auto mt-10 flex max-w-xl flex-wrap items-center justify-center gap-x-6 gap-y-3 border-t border-border/60 pt-8">
            {pipelineSteps.map((step) => {
              const Icon = step.icon
              return (
                <div
                  key={step.label}
                  className="inline-flex items-center gap-2 text-xs font-medium text-muted sm:text-sm"
                >
                  <span className="flex size-7 items-center justify-center rounded-lg bg-primary-soft text-primary">
                    <Icon className="size-3.5" />
                  </span>
                  {step.label}
                </div>
              )
            })}
          </div>
        </motion.div>
      </div>
    </section>
  )
}
