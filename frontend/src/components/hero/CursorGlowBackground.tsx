import { motion } from 'framer-motion'

import { useHeroInteraction } from '@/components/hero/HeroInteractionContext'

interface CursorGlowBackgroundProps {
  className?: string
}

const ambientBlobs = [
  {
    className: 'left-[8%] top-[12%] size-[420px]',
    color: 'rgb(28 200 141 / 0.12)',
    duration: 22,
    animate: { x: [0, 40, -20, 0], y: [0, -30, 20, 0], scale: [1, 1.06, 0.97, 1] },
  },
  {
    className: 'right-[5%] top-[8%] size-[360px]',
    color: 'rgb(28 200 141 / 0.09)',
    duration: 26,
    animate: { x: [0, -35, 25, 0], y: [0, 25, -15, 0], scale: [1, 0.96, 1.04, 1] },
  },
  {
    className: 'bottom-[10%] left-[35%] size-[500px]',
    color: 'rgb(28 200 141 / 0.07)',
    duration: 30,
    animate: { x: [0, 30, -40, 0], y: [0, -20, 30, 0], scale: [1, 1.03, 0.98, 1] },
  },
]

export function CursorGlowBackground({ className }: CursorGlowBackgroundProps) {
  const { smoothGlowX, smoothGlowY } = useHeroInteraction()

  return (
    <div className={className} aria-hidden>
      <div className="absolute inset-0 bg-background" />

      <div
        className="absolute inset-0"
        style={{
          background: `
            linear-gradient(155deg, rgb(235 244 240) 0%, rgb(242 249 246) 40%, rgb(235 244 240) 100%)
          `,
        }}
      />

      {ambientBlobs.map((blob, index) => (
        <motion.div
          key={index}
          className={`pointer-events-none absolute rounded-full blur-3xl ${blob.className}`}
          style={{ background: blob.color }}
          animate={blob.animate}
          transition={{
            duration: blob.duration,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}

      <motion.div
        className="pointer-events-none absolute size-[520px] -translate-x-1/2 -translate-y-1/2 rounded-full will-change-transform"
        style={{
          left: smoothGlowX,
          top: smoothGlowY,
          background:
            'radial-gradient(circle, rgb(28 200 141 / 0.14) 0%, rgb(28 200 141 / 0.06) 35%, transparent 68%)',
          filter: 'blur(48px)',
        }}
      />

      <motion.div
        className="pointer-events-none absolute size-[280px] -translate-x-1/2 -translate-y-1/2 rounded-full will-change-transform"
        style={{
          left: smoothGlowX,
          top: smoothGlowY,
          background:
            'radial-gradient(circle, rgb(28 200 141 / 0.1) 0%, transparent 72%)',
          filter: 'blur(32px)',
        }}
      />

      <div
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage: `
            linear-gradient(rgb(28 200 141 / 0.025) 1px, transparent 1px),
            linear-gradient(90deg, rgb(28 200 141 / 0.025) 1px, transparent 1px)
          `,
          backgroundSize: '72px 72px',
          maskImage:
            'radial-gradient(ellipse 85% 75% at 50% 45%, black, transparent)',
        }}
      />
    </div>
  )
}
