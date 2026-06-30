import { useEffect } from 'react'

import { CursorGlowBackground } from '@/components/hero/CursorGlowBackground'
import { HeroContent } from '@/components/hero/HeroContent'
import { HeroVideoCommandCenter } from '@/components/hero/HeroVideoCommandCenter'
import {
  HeroInteractionProvider,
  useHeroInteraction,
} from '@/components/hero/HeroInteractionContext'
import { cn } from '@/lib/utils'

function HeroSectionInner() {
  const { sectionRef, glowX, glowY, onPointerMove, onPointerLeave } =
    useHeroInteraction()

  useEffect(() => {
    const section = sectionRef.current
    if (!section) return

    const rect = section.getBoundingClientRect()
    glowX.set(rect.width / 2)
    glowY.set(rect.height / 2)
  }, [sectionRef, glowX, glowY])

  return (
    <section
      ref={sectionRef}
      onMouseMove={onPointerMove}
      onMouseLeave={onPointerLeave}
      className={cn(
        'relative',
        'rounded-[28px] sm:rounded-[32px] lg:rounded-[40px]',
        'border border-border/60',
        'shadow-[var(--shadow-soft)]',
        'min-h-[calc(100dvh-7.5rem)] sm:min-h-[calc(100dvh-8.5rem)]',
      )}
    >
      <div className="absolute inset-0 overflow-hidden rounded-[inherit]">
        <CursorGlowBackground className="absolute inset-0" />
      </div>

      <div className="relative flex min-h-[inherit] flex-col justify-center overflow-hidden rounded-[inherit] px-5 py-14 sm:px-8 sm:py-16 lg:px-12 lg:py-20">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-10 xl:gap-16">
          <HeroContent />
          <div className="px-1 sm:px-2">
            <HeroVideoCommandCenter />
          </div>
        </div>
      </div>
    </section>
  )
}

export function HeroSection() {
  return (
    <HeroInteractionProvider>
      <HeroSectionInner />
    </HeroInteractionProvider>
  )
}
