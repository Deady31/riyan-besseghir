import { useRef } from 'react'
import { gsap, SplitText, useGSAP, prefersReducedMotion } from '../../lib/motion'

/**
 * Animations de scroll globales de la v6, posées par attributs pour rester déclaratives :
 * - [data-light]      : le texte s'allume mot à mot pendant qu'on scrolle (de 55 % à 100 % d'opacité : toujours lisible)
 * - [data-reveal-img] : l'image s'ouvre depuis un cadre resserré et se cale en place
 * - [data-drift]      : léger décalage de parallaxe sur les grands titres
 * + une barre de progression de lecture en haut de page.
 */
export function ScrollFx({ deps }: { deps: unknown }) {
  const bar = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      gsap.to(bar.current, {
        scaleX: 1,
        ease: 'none',
        scrollTrigger: { trigger: document.documentElement, start: 'top top', end: 'bottom bottom', scrub: 0.3 },
      })
      if (prefersReducedMotion()) return

      const splits = gsap.utils.toArray<HTMLElement>('[data-light]').map((el) => {
        const split = SplitText.create(el, { type: 'words', aria: 'none' })
        gsap.fromTo(
          split.words,
          { opacity: 0.55 },
          { opacity: 1, ease: 'none', stagger: 0.08, scrollTrigger: { trigger: el, start: 'top 92%', end: 'bottom 60%', scrub: true } },
        )
        return split
      })

      gsap.utils.toArray<HTMLElement>('[data-reveal-img]').forEach((el) => {
        gsap.fromTo(
          el,
          { clipPath: 'inset(14% 10% 14% 10% round 28px)', scale: 1.08 },
          {
            clipPath: 'inset(0% 0% 0% 0% round 20px)',
            scale: 1,
            ease: 'power2.out',
            scrollTrigger: { trigger: el, start: 'top 90%', end: 'top 30%', scrub: true },
          },
        )
      })

      gsap.utils.toArray<HTMLElement>('[data-drift]').forEach((el) => {
        gsap.fromTo(el, { yPercent: 12 }, { yPercent: -12, ease: 'none', scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true } })
      })

      return () => splits.forEach((s) => s.revert())
    },
    { dependencies: [deps], revertOnUpdate: true },
  )

  return (
    <div className="pointer-events-none fixed inset-x-0 top-0 z-[80] h-[2px]" aria-hidden="true">
      <div ref={bar} className="h-full origin-left scale-x-0 bg-[linear-gradient(90deg,#FF7EC8,#6C2BFF)]" />
    </div>
  )
}
