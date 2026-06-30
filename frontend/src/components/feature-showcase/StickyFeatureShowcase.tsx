import { motion, useInView } from 'framer-motion'
import { Layers } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'

import { cn } from '@/lib/utils'

import { FeaturePreviewPanel } from './FeaturePreviewPanel'
import { features } from './feature-data'

/** Navbar clearance + breathing room */
const STICKY_TOP_PX = 112
const PREVIEW_MIN_HEIGHT = 520

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-60px' },
  transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] as const },
}

interface FeatureBlockProps {
  feature: (typeof features)[number]
  index: number
  isActive: boolean
  onActivate: () => void
  isLast: boolean
}

function FeatureBlock({ feature, index, isActive, onActivate, isLast }: FeatureBlockProps) {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { margin: '-45% 0px -45% 0px', amount: 0 })

  useEffect(() => {
    if (isInView) onActivate()
  }, [isInView, onActivate])

  const Icon = feature.icon

  return (
    <div
      ref={ref}
      data-feature-index={index}
      className={cn(
        'flex flex-col justify-center',
        /* Each block is one viewport of scroll runway on desktop */
        'min-h-[70vh] py-12 sm:py-16',
        'lg:min-h-[100vh] lg:py-0',
        isLast && 'lg:min-h-[100vh]',
      )}
    >
      <motion.div
        animate={{
          opacity: isActive ? 1 : 0.32,
          x: isActive ? 0 : -8,
        }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        className="relative max-w-lg"
      >
        <div
          className={cn(
            'absolute -left-6 top-0 hidden h-full w-0.5 rounded-full transition-all duration-700 lg:block',
            isActive ? 'bg-primary shadow-[0_0_12px_rgb(28_200_141/0.5)]' : 'bg-border',
          )}
        />

        <div className="flex items-center gap-3">
          <span
            className={cn(
              'font-mono text-xs tracking-[0.2em] transition-colors duration-500',
              isActive ? 'text-primary' : 'text-muted',
            )}
          >
            {feature.step}
          </span>
          <span
            className={cn(
              'inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[10px] font-semibold tracking-wide uppercase transition-all duration-500',
              isActive
                ? 'border-primary/30 bg-primary-soft text-primary'
                : 'border-border bg-surface/60 text-muted',
            )}
          >
            <Icon className="size-3" />
            {feature.eyebrow}
          </span>
        </div>

        <h3
          className={cn(
            'mt-5 text-3xl font-bold tracking-[-0.02em] transition-colors duration-500 sm:text-4xl lg:text-[2.75rem] lg:leading-[1.08]',
            isActive ? 'text-foreground' : 'text-foreground/70',
          )}
        >
          {feature.title}
        </h3>

        <p
          className={cn(
            'mt-4 text-base leading-relaxed transition-colors duration-500 sm:text-lg',
            isActive ? 'text-muted' : 'text-muted/70',
          )}
        >
          {feature.description}
        </p>

        <ul className="mt-8 space-y-4">
          {feature.bullets.map((bullet) => (
            <li
              key={bullet.label}
              className={cn(
                'flex gap-3 transition-opacity duration-500',
                isActive ? 'opacity-100' : 'opacity-60',
              )}
            >
              <span
                className={cn(
                  'mt-1.5 size-1.5 shrink-0 rounded-full',
                  isActive ? 'bg-primary' : 'bg-border',
                )}
              />
              <div>
                <p className="text-sm font-semibold text-foreground">{bullet.label}</p>
                <p className="text-sm text-muted">{bullet.detail}</p>
              </div>
            </li>
          ))}
        </ul>

        <div
          className={cn(
            'mt-10 flex flex-wrap gap-6 transition-opacity duration-500',
            isActive ? 'opacity-100' : 'opacity-50',
          )}
        >
          {feature.metrics.map((metric) => (
            <div key={metric.label}>
              <p
                className={cn(
                  'text-2xl font-bold tabular-nums tracking-tight sm:text-3xl',
                  isActive ? 'text-primary' : 'text-foreground/60',
                )}
              >
                {metric.value}
              </p>
              <p className="text-xs font-medium text-muted">{metric.label}</p>
            </div>
          ))}
        </div>

        {/* Mobile: inline preview per block */}
        <div className="mt-10 lg:hidden">
          <FeaturePreviewPanel feature={feature} />
        </div>
      </motion.div>
    </div>
  )
}

function ProgressRail({ activeIndex }: { activeIndex: number }) {
  return (
    <div className="mb-8 hidden items-center gap-3 lg:mb-10 lg:flex">
      {features.map((feature, i) => (
        <div key={feature.id} className="flex items-center gap-3">
          <motion.div
            animate={{
              width: activeIndex === i ? 40 : 8,
              backgroundColor:
                activeIndex === i
                  ? 'rgb(28 200 141)'
                  : i < activeIndex
                    ? 'rgb(28 200 141 / 0.4)'
                    : 'rgb(28 200 141 / 0.15)',
            }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="h-1 rounded-full"
          />
          {i < features.length - 1 ? (
            <span className="text-[10px] text-muted/40">·</span>
          ) : null}
        </div>
      ))}
    </div>
  )
}

export function StickyFeatureShowcase() {
  const [activeIndex, setActiveIndex] = useState(0)
  const trackRef = useRef<HTMLDivElement>(null)

  const handleActivate = useCallback((index: number) => {
    setActiveIndex(index)
  }, [])

  const activeFeature = features[activeIndex]
  const stickyHeight = `calc(100vh - ${STICKY_TOP_PX}px - 2rem)`

  return (
    <section
      id="product"
      className={cn(
        /* overflow-hidden removed — it breaks position: sticky */
        'relative rounded-[28px] border border-border/60',
        'bg-surface-solid shadow-[var(--shadow-soft)] sm:rounded-[32px] lg:rounded-[40px]',
      )}
    >
      {/* Background layers — clipped via border-radius on section, not overflow:hidden */}
      <div
        className="pointer-events-none absolute inset-0 rounded-[inherit]"
        style={{
          background: `
            radial-gradient(ellipse 55% 45% at 90% 20%, rgb(28 200 141 / 0.06), transparent 55%),
            radial-gradient(ellipse 50% 40% at 5% 75%, rgb(28 200 141 / 0.05), transparent 50%)
          `,
        }}
      />

      {/* Section header — scrolls normally */}
      <div className="relative z-10 px-4 pt-12 pb-6 sm:px-8 sm:pt-16 sm:pb-8 lg:px-12 lg:pt-20">
        <motion.div {...fadeUp} className="mx-auto max-w-3xl text-center lg:text-left">
          <span
            className={cn(
              'inline-flex items-center gap-2 rounded-full border border-border',
              'bg-section-alt px-4 py-1.5 text-[11px] font-semibold tracking-wide text-primary uppercase',
            )}
          >
            <Layers className="size-3.5" />
            Product Story
          </span>

          <h2 className="mt-4 text-3xl font-bold tracking-[-0.02em] text-foreground sm:text-4xl lg:text-[2.75rem] lg:leading-[1.1]">
            One pipeline. Four AI agents.
            <br className="hidden sm:block" />
            <span className="text-primary"> Zero manual handoffs.</span>
          </h2>

          <p className="mx-auto mt-3 max-w-2xl text-base leading-relaxed text-muted lg:mx-0 lg:text-lg">
            From the first scraped signal to a confirmed calendar invite — watch how
            specialized agents collaborate to move prospects through your funnel.
          </p>
        </motion.div>
      </div>

      {/*
        Sticky scroll track
        ───────────────────
        Grid columns stretch to equal height (default align-items: stretch).
        Left column height = sum of feature blocks → defines track length.
        Right column matches that height → sticky child pins for the full track,
        then releases naturally when the last block scrolls past.
      */}
      <div
        ref={trackRef}
        className="relative z-10 px-4 pb-12 sm:px-8 sm:pb-16 lg:px-12 lg:pb-20"
      >
        <div className="grid lg:grid-cols-2 lg:gap-x-16 xl:gap-x-20">
          {/* Left: scrollable feature blocks */}
          <div className="relative">
            <ProgressRail activeIndex={activeIndex} />
            {features.map((feature, index) => (
              <FeatureBlock
                key={feature.id}
                feature={feature}
                index={index}
                isActive={activeIndex === index}
                isLast={index === features.length - 1}
                onActivate={() => handleActivate(index)}
              />
            ))}
          </div>

          {/* Right: sticky preview — column stretches to left column height */}
          <div className="relative hidden lg:block">
            <div
              className="sticky flex w-full items-center"
              style={{
                top: STICKY_TOP_PX,
                height: stickyHeight,
              }}
            >
              <div
                className="w-full"
                style={{ minHeight: PREVIEW_MIN_HEIGHT }}
              >
                <FeaturePreviewPanel feature={activeFeature} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
