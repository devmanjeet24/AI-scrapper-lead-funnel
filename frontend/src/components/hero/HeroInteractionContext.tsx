import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  type MouseEvent,
  type ReactNode,
  type RefObject,
} from 'react'
import {
  type MotionValue,
  useMotionValue,
  useSpring,
} from 'framer-motion'

interface HeroInteractionContextValue {
  sectionRef: RefObject<HTMLElement | null>
  glowX: MotionValue<number>
  glowY: MotionValue<number>
  smoothGlowX: MotionValue<number>
  smoothGlowY: MotionValue<number>
  parallaxX: MotionValue<number>
  parallaxY: MotionValue<number>
  onPointerMove: (event: MouseEvent<HTMLElement>) => void
  onPointerLeave: () => void
}

const HeroInteractionContext = createContext<HeroInteractionContextValue | null>(
  null,
)

const glowSpring = { damping: 32, stiffness: 75, mass: 1.1 }
const parallaxSpring = { damping: 48, stiffness: 55, mass: 1.5 }

export function HeroInteractionProvider({ children }: { children: ReactNode }) {
  const sectionRef = useRef<HTMLElement>(null)

  const glowX = useMotionValue(0)
  const glowY = useMotionValue(0)
  const parallaxX = useMotionValue(0.5)
  const parallaxY = useMotionValue(0.5)

  const smoothGlowX = useSpring(glowX, glowSpring)
  const smoothGlowY = useSpring(glowY, glowSpring)
  const smoothParallaxX = useSpring(parallaxX, parallaxSpring)
  const smoothParallaxY = useSpring(parallaxY, parallaxSpring)

  const onPointerMove = useCallback(
    (event: MouseEvent<HTMLElement>) => {
      const rect = event.currentTarget.getBoundingClientRect()
      glowX.set(event.clientX - rect.left)
      glowY.set(event.clientY - rect.top)
      parallaxX.set((event.clientX - rect.left) / rect.width)
      parallaxY.set((event.clientY - rect.top) / rect.height)
    },
    [glowX, glowY, parallaxX, parallaxY],
  )

  const onPointerLeave = useCallback(() => {
    const rect = sectionRef.current?.getBoundingClientRect()
    if (rect) {
      glowX.set(rect.width / 2)
      glowY.set(rect.height / 2)
    }
    parallaxX.set(0.5)
    parallaxY.set(0.5)
  }, [glowX, glowY, parallaxX, parallaxY])

  const value = useMemo(
    () => ({
      sectionRef,
      glowX,
      glowY,
      smoothGlowX,
      smoothGlowY,
      parallaxX: smoothParallaxX,
      parallaxY: smoothParallaxY,
      onPointerMove,
      onPointerLeave,
    }),
    [
      glowX,
      glowY,
      smoothGlowX,
      smoothGlowY,
      smoothParallaxX,
      smoothParallaxY,
      onPointerMove,
      onPointerLeave,
    ],
  )

  return (
    <HeroInteractionContext.Provider value={value}>
      {children}
    </HeroInteractionContext.Provider>
  )
}

export function useHeroInteraction() {
  const context = useContext(HeroInteractionContext)
  if (!context) {
    throw new Error('useHeroInteraction must be used within HeroInteractionProvider')
  }
  return context
}
