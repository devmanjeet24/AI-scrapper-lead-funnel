import { useSpring, useTransform, motion } from 'framer-motion'
import { useEffect } from 'react'

interface AnimatedCounterProps {
  value: number
  className?: string
}

export function AnimatedCounter({ value, className }: AnimatedCounterProps) {
  const spring = useSpring(0, { stiffness: 80, damping: 22, mass: 0.8 })
  const display = useTransform(spring, (v) => Math.round(v).toLocaleString())

  useEffect(() => {
    spring.set(value)
  }, [value, spring])

  return <motion.span className={className}>{display}</motion.span>
}
