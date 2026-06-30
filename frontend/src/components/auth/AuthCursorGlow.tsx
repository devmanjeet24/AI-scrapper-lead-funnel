import { motion, useMotionValue, useSpring } from 'framer-motion'
import { useCallback, useEffect, useRef, type MouseEvent, type ReactNode } from 'react'

import { cn } from '@/lib/utils'

const glowSpring = { damping: 36, stiffness: 80, mass: 1 }

interface AuthCursorGlowProps {
  children: ReactNode
  className?: string
}

export function AuthCursorGlow({ children, className }: AuthCursorGlowProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const glowX = useMotionValue(0)
  const glowY = useMotionValue(0)
  const smoothX = useSpring(glowX, glowSpring)
  const smoothY = useSpring(glowY, glowSpring)

  const centerGlow = useCallback(() => {
    const rect = containerRef.current?.getBoundingClientRect()
    if (rect) {
      glowX.set(rect.width / 2)
      glowY.set(rect.height / 2)
    }
  }, [glowX, glowY])

  useEffect(() => {
    centerGlow()
    window.addEventListener('resize', centerGlow)
    return () => window.removeEventListener('resize', centerGlow)
  }, [centerGlow])

  const onPointerMove = (event: MouseEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect()
    glowX.set(event.clientX - rect.left)
    glowY.set(event.clientY - rect.top)
  }

  return (
    <div
      ref={containerRef}
      onMouseMove={onPointerMove}
      onMouseLeave={centerGlow}
      className={cn('relative', className)}
    >
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
        <motion.div
          className="absolute size-[480px] -translate-x-1/2 -translate-y-1/2 rounded-full will-change-transform"
          style={{
            left: smoothX,
            top: smoothY,
            background:
              'radial-gradient(circle, rgb(28 200 141 / 0.1) 0%, rgb(28 200 141 / 0.04) 40%, transparent 70%)',
            filter: 'blur(52px)',
          }}
        />
        <motion.div
          className="absolute size-[220px] -translate-x-1/2 -translate-y-1/2 rounded-full will-change-transform"
          style={{
            left: smoothX,
            top: smoothY,
            background: 'radial-gradient(circle, rgb(28 200 141 / 0.07) 0%, transparent 68%)',
            filter: 'blur(28px)',
          }}
        />
      </div>
      <div className="relative">{children}</div>
    </div>
  )
}
