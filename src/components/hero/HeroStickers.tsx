import { useRef } from 'react'
import { Draggable } from 'gsap/Draggable'
import { InertiaPlugin } from 'gsap/InertiaPlugin'
import { gsap, useGSAP, prefersReducedMotion } from '../../lib/motion'
import { useT } from '../../i18n/useT'
import { cn } from '../../lib/cn'

gsap.registerPlugin(Draggable, InertiaPlugin)

/** Position et couleur de chaque sticker ; le texte vient de l'i18n, dans le même ordre. */
const LAYOUT = [
  { pos: 'top-[18%] left-[44%] max-md:top-[30%] max-md:left-[3%]', rot: -8, tone: 'bg-lemon text-paper', mobile: true },
  { pos: 'top-[27%] right-[6%] max-md:top-[52%] max-md:right-[3%]', rot: 6, tone: 'bg-bubblegum text-paper', mobile: true },
  { pos: 'top-[52%] right-[30%]', rot: -4, tone: 'bg-mint text-paper', mobile: false },
  { pos: 'top-[40%] right-[4%]', rot: 10, tone: 'bg-signal text-ink', mobile: false },
] as const

export function HeroStickers() {
  const root = useRef<HTMLDivElement>(null)
  const t = useT()

  useGSAP(
    () => {
      const els = gsap.utils.toArray<HTMLElement>('[data-sticker]')
      let z = 1
      const drags = Draggable.create(els, {
        type: 'x,y',
        bounds: root.current!,
        inertia: true,
        edgeResistance: 0.6,
        onPress() {
          gsap.set(this.target, { zIndex: ++z })
          gsap.to(this.target, { scale: 1.12, duration: 0.25, ease: 'back.out(3)' })
        },
        onRelease() {
          gsap.to(this.target, { scale: 1, duration: 0.5, ease: 'elastic.out(1, 0.4)' })
        },
      })
      if (!prefersReducedMotion()) {
        els.forEach((el, i) => {
          gsap.fromTo(el, { scale: 0, rotation: -40 }, { scale: 1, rotation: 0, duration: 0.9, ease: 'back.out(2.2)', delay: 1.1 + i * 0.09 })
        })
      }
      return () => drags.forEach((d) => d.kill())
    },
    { scope: root },
  )

  return (
    <div ref={root} className="pointer-events-none absolute inset-0 z-10" aria-hidden="true">
      {t.hero.stickers.map((label, i) => {
        const l = LAYOUT[i % LAYOUT.length]
        return (
          <span
            key={label}
            data-sticker
            style={{ rotate: `${l.rot}deg` }}
            className={cn(
              'sticker pointer-events-auto absolute cursor-grab touch-none select-none px-3 py-1.5 text-sm active:cursor-grabbing md:px-4 md:py-2 md:text-lg',
              l.pos,
              l.tone,
              !l.mobile && 'max-md:hidden',
            )}
          >
            {label}
          </span>
        )
      })}
    </div>
  )
}
