import { useRef } from 'react'
import { gsap, useGSAP, prefersReducedMotion } from '../../lib/motion'

/**
 * Fond de la v6 : une aurore de nuit très discrète (trois halos flous), une trame fine et du grain.
 * Les halos dérivent lentement et glissent avec le scroll, sans jamais voler la vedette au contenu.
 */
const GRAIN =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.55'/%3E%3C/svg%3E\")"

export default function Aurora() {
  const root = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      if (prefersReducedMotion()) return
      gsap.utils.toArray<HTMLElement>('[data-blob]').forEach((el, i) => {
        gsap.to(el, {
          xPercent: i % 2 ? -18 : 22,
          yPercent: i === 1 ? 16 : -12,
          scale: 1.15,
          duration: 14 + i * 4,
          ease: 'sine.inOut',
          repeat: -1,
          yoyo: true,
        })
      })
      gsap.to('[data-aurora]', {
        yPercent: -22,
        rotate: 8,
        ease: 'none',
        scrollTrigger: { trigger: document.documentElement, start: 'top top', end: 'bottom bottom', scrub: 1.2 },
      })
    },
    { scope: root },
  )

  return (
    <div ref={root} className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-ink" aria-hidden="true">
      <div data-aurora className="absolute -inset-[20%]">
        <div data-blob className="absolute top-[8%] left-[10%] size-[46vw] rounded-full bg-[#5b1fa8] opacity-35 blur-[120px]" />
        <div data-blob className="absolute top-[38%] right-[4%] size-[38vw] rounded-full bg-[#ff2e88] opacity-[0.16] blur-[130px]" />
        <div data-blob className="absolute bottom-[6%] left-[34%] size-[34vw] rounded-full bg-[#00a7b5] opacity-[0.14] blur-[120px]" />
      </div>
      <div className="absolute inset-0 bg-[linear-gradient(rgb(241_236_255/0.035)_1px,transparent_1px),linear-gradient(90deg,rgb(241_236_255/0.035)_1px,transparent_1px)] bg-[size:88px_88px] [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_80%)]" />
      <div className="absolute inset-0 opacity-[0.07] mix-blend-overlay" style={{ backgroundImage: GRAIN }} />
    </div>
  )
}
