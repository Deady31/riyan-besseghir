import { useRef, useState } from 'react'
import { gsap, useGSAP, prefersReducedMotion } from '../../lib/motion'
import { useT } from '../../i18n/useT'
import { ChapterBg } from '../backgrounds/ChapterBg'

/**
 * Transition avant « Impact » : un mur de tuiles holographiques violettes (HoloMosaic, React Bits).
 * Il s'ouvre en cercle depuis le centre, ses tuiles se retournent, le mot du chapitre passe dessus, puis le mur
 * remonte comme un rideau et laisse place à la section. Mouvement réduit : rien (simple enchaînement).
 */
export function HoloGate() {
  const root = useRef<HTMLDivElement>(null)
  const t = useT()
  const [reduced] = useState(() => prefersReducedMotion())

  useGSAP(
    () => {
      if (reduced) return
      const tl = gsap.timeline({ scrollTrigger: { trigger: root.current, start: 'top bottom', end: 'bottom top', scrub: 0.5 } })
      tl.fromTo('[data-holo]', { clipPath: 'circle(0% at 50% 55%)' }, { clipPath: 'circle(80% at 50% 50%)', ease: 'power2.out', duration: 0.4 })
        .fromTo('[data-holo-word]', { yPercent: 60, opacity: 0, scale: 0.9 }, { yPercent: 0, opacity: 1, scale: 1, ease: 'expo.out', duration: 0.25 }, 0.25)
        .to('[data-holo-word]', { yPercent: -40, opacity: 0, ease: 'power2.in', duration: 0.2 }, 0.62)
        .to('[data-holo]', { clipPath: 'inset(0% 0% 100% 0%)', ease: 'power3.inOut', duration: 0.3 }, 0.7)
    },
    { scope: root, dependencies: [reduced] },
  )

  if (reduced) return null
  return (
    <div ref={root} aria-hidden="true" className="relative h-[200vh]">
      <div className="sticky top-0 h-[100svh] overflow-hidden">
        <div data-holo className="absolute inset-0 isolate bg-[#2B0F3A]" style={{ clipPath: 'circle(0% at 50% 55%)' }}>
          <ChapterBg kind="holo" soft={false} className="z-0" />
          <p
            data-holo-word
            className="brand-name absolute inset-0 z-10 grid place-items-center text-[clamp(4rem,2rem+12vw,13rem)] text-[#FFF6E5] [text-shadow:6px_7px_0_#2B0F3A]"
          >
            {t.nav.links.impact}
          </p>
        </div>
      </div>
    </div>
  )
}
