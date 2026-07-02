import { motion } from 'framer-motion'
import { ArrowRight, Sparkles } from 'lucide-react'
import { Link } from 'react-router-dom'

import { cn } from '@/lib/utils'

const entrance = {
  initial: { opacity: 0, y: 28 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] as const },
}

const floatHighlight = {
  animate: { y: [0, -5, 0], rotate: [-3.5, -2.5, -3.5] },
  transition: {
    duration: 5,
    repeat: Infinity,
    ease: 'easeInOut' as const,
  },
}

export function HeroContent() {
  return (
    <div className="flex max-w-xl flex-col">
      <motion.div
        {...entrance}
        transition={{ ...entrance.transition, delay: 0 }}
        className="mb-6 inline-flex w-fit items-center gap-2 rounded-full border border-border bg-surface px-4 py-1.5 text-xs font-semibold tracking-wide text-primary uppercase backdrop-blur-sm"
      >
        <Sparkles className="size-3.5" />
        AI-Powered Lead Generation
      </motion.div>

      <motion.h1
        {...entrance}
        transition={{ ...entrance.transition, delay: 0.1 }}
        className="text-4xl leading-[1.12] font-semibold tracking-tight text-foreground sm:text-5xl lg:text-[3.35rem]"
      >
        Turn More Prospects Into Meetings{' '}
        <motion.span
          {...floatHighlight}
          className={cn(
            'relative -mt-1 inline-flex translate-y-0.5 items-center',
            'rounded-2xl bg-primary px-3.5 py-1 text-white',
            'shadow-[0_8px_24px_rgb(28_200_141/0.28)]',
            'origin-top-left sm:px-4 sm:py-1.5',
          )}
        >
          With AI
        </motion.span>
      </motion.h1>

      <motion.p
        {...entrance}
        transition={{ ...entrance.transition, delay: 0.2 }}
        className="mt-6 max-w-lg text-base leading-relaxed text-muted sm:text-lg"
      >
        Our AI continuously discovers high-intent leads, qualifies prospects in
        real time, crafts personalized outreach, and books meetings on your
        calendar — so your team focuses on closing, not chasing.
      </motion.p>

      <motion.div
        {...entrance}
        transition={{ ...entrance.transition, delay: 0.3 }}
        className="mt-9 flex flex-wrap items-center gap-4"
      >
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
              'bg-primary px-6 py-3.5 text-sm font-semibold text-white',
              'shadow-[0_12px_32px_rgb(28_200_141/0.28)]',
            )}
          >
            <span className="pointer-events-none absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
            Sign up
            <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-0.5" />
          </Link>
        </motion.div>

        <motion.a
          href="mailto:hello@leadflow.com?subject=Book%20a%20demo"
          whileHover={{
            scale: 1.02,
            y: -2,
            boxShadow:
              '0 0 32px rgb(28 200 141 / 0.1), 0 8px 28px rgb(45 45 45 / 0.08)',
            borderColor: 'rgb(28 200 141 / 0.35)',
          }}
          whileTap={{ scale: 0.98 }}
          transition={{ type: 'spring', stiffness: 400, damping: 28 }}
          className={cn(
            'inline-flex items-center gap-2 rounded-[var(--radius-button)] border border-border',
            'bg-surface-solid px-6 py-3.5 text-sm font-semibold text-foreground',
            'shadow-[0_4px_16px_rgb(45_45_45/0.04)] backdrop-blur-sm',
          )}
        >
          Book Demo
        </motion.a>
      </motion.div>
    </div>
  )
}
