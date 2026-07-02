import { AnimatePresence, motion } from 'framer-motion'
import { useCallback, useEffect, useState } from 'react'

import { authCarouselSlides } from './auth-carousel-data'
import { AuthSidebarScene } from './AuthSidebarScene'
import { carouselPreviews } from './CarouselPreviews'

const SLIDE_DURATION_MS = 4500
const ease = [0.22, 1, 0.36, 1] as const

export function AuthCarousel() {
  const [activeIndex, setActiveIndex] = useState(0)
  const [progress, setProgress] = useState(0)
  const [isPaused, setIsPaused] = useState(false)

  const goTo = useCallback((index: number) => {
    setActiveIndex(index)
    setProgress(0)
  }, [])

  const next = useCallback(() => {
    setActiveIndex((prev) => (prev + 1) % authCarouselSlides.length)
    setProgress(0)
  }, [])

  useEffect(() => {
    if (isPaused) return

    const tick = 50
    const interval = setInterval(() => {
      setProgress((prev) => {
        const nextProgress = prev + tick / SLIDE_DURATION_MS
        if (nextProgress >= 1) {
          next()
          return 0
        }
        return nextProgress
      })
    }, tick)

    return () => clearInterval(interval)
  }, [activeIndex, isPaused, next])

  const slide = authCarouselSlides[activeIndex]
  const Preview = carouselPreviews[slide.previewKey]
  const Icon = slide.icon

  return (
    <div
      className="relative flex h-full min-h-0 flex-col"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div
        className="pointer-events-none absolute inset-0 rounded-[2rem] opacity-80"
        style={{
          background:
            'radial-gradient(ellipse 70% 55% at 50% 35%, rgb(28 200 141 / 0.14), transparent 72%)',
        }}
      />

      <div className="relative flex flex-1 flex-col gap-5 lg:gap-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={slide.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.45, ease }}
            className="space-y-4"
          >
            <div className="flex items-start gap-3">
              <motion.div
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary text-white shadow-[0_8px_24px_rgb(28_200_141/0.25)]"
              >
                <Icon className="size-5" />
              </motion.div>
              <div className="min-w-0 space-y-1">
                <p className="text-[11px] font-semibold tracking-wider text-primary uppercase">
                  {slide.eyebrow}
                </p>
                <h2 className="text-lg font-semibold tracking-tight text-foreground sm:text-xl">
                  {slide.title}
                </h2>
              </div>
            </div>

            <p className="max-w-md text-[13px] leading-relaxed text-muted">{slide.description}</p>

            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1, duration: 0.4, ease }}
              className="inline-flex items-baseline gap-2 rounded-xl border border-primary/15 bg-primary-soft/50 px-3.5 py-2"
            >
              <span className="text-2xl font-bold tabular-nums text-primary">{slide.stat.value}</span>
              <span className="text-xs font-medium text-muted">{slide.stat.label}</span>
            </motion.div>
          </motion.div>
        </AnimatePresence>

        <AuthSidebarScene className="flex-1" />

        <div className="relative shrink-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={`preview-${slide.id}`}
              initial={{ opacity: 0, x: 20, scale: 0.98 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: -20, scale: 0.98 }}
              transition={{ duration: 0.5, ease }}
              className="origin-top scale-[0.92]"
            >
              <Preview />
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="flex items-center gap-3 pt-1">
          <div className="flex flex-1 gap-1.5">
            {authCarouselSlides.map((s, i) => (
              <button
                key={s.id}
                type="button"
                aria-label={`Go to ${s.eyebrow}`}
                onClick={() => goTo(i)}
                className="group relative h-1 flex-1 overflow-hidden rounded-full bg-primary/10"
              >
                <motion.span
                  className="absolute inset-y-0 left-0 rounded-full bg-primary"
                  initial={false}
                  animate={{
                    width: i === activeIndex ? `${progress * 100}%` : i < activeIndex ? '100%' : '0%',
                  }}
                  transition={{ duration: i === activeIndex ? 0.05 : 0.3, ease: 'linear' }}
                />
                <span className="sr-only">{s.eyebrow}</span>
              </button>
            ))}
          </div>
          <span className="shrink-0 text-[10px] font-medium tabular-nums text-muted">
            {activeIndex + 1}/{authCarouselSlides.length}
          </span>
        </div>
      </div>
    </div>
  )
}
