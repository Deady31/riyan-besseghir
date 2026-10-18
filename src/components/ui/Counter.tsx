import { useRef } from 'react'
import { gsap, useGSAP, prefersReducedMotion } from '../../lib/motion'

type Props = { value: number; prefix?: string; suffix?: string; className?: string }

export function Counter({ value, prefix = '', suffix = '', className }: Props) {
  const ref = useRef<HTMLSpanElement>(null)

  useGSAP(
    () => {
      const el = ref.current
      if (!el || prefersReducedMotion()) return
      const state = { n: 0 }
      gsap.to(state, {
        n: value,
        duration: 1.8,
        ease: 'expo.out',
        scrollTrigger: { trigger: el, start: 'top 85%', once: true },
        onUpdate: () => {
          el.textContent = `${prefix}${Math.round(state.n)}${suffix}`
        },
      })
    },
    { scope: ref },
  )

  return (
    <span ref={ref} className={className}>
      {prefix}
      {value}
      {suffix}
    </span>
  )
}
