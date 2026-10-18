import { useRef, type ElementType, type ReactNode } from 'react'
import { gsap, SplitText, useGSAP, prefersReducedMotion } from '../../lib/motion'
import { cn } from '../../lib/cn'

type Props = {
  as?: ElementType
  children: ReactNode
  className?: string
  delay?: number
  immediate?: boolean
}

export function RevealText({ as: Tag = 'p', children, className, delay = 0, immediate = false }: Props) {
  const ref = useRef<HTMLElement>(null)

  useGSAP(
    () => {
      if (!ref.current || prefersReducedMotion()) return
      const el = ref.current
      const split = SplitText.create(el, {
        type: 'lines',
        mask: 'lines',
        autoSplit: true,
        onSplit: (self) =>
          gsap.from(self.lines, {
            yPercent: 110,
            duration: 1.1,
            ease: 'expo.out',
            stagger: 0.09,
            delay,
            scrollTrigger: immediate ? undefined : { trigger: el, start: 'top 85%', once: true },
          }),
      })
      return () => split.revert()
    },
    { scope: ref },
  )

  return (
    <Tag ref={ref} className={cn(className)}>
      {children}
    </Tag>
  )
}
