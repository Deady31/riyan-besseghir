import { useRef } from 'react'
import { gsap, useGSAP, prefersReducedMotion } from '../../lib/motion'
import { useT } from '../../i18n/useT'
import { PROJECTS } from '../../data/projects'

export function MorphMoment() {
  const root = useRef<HTMLElement>(null)
  const t = useT()

  useGSAP(
    () => {
      if (prefersReducedMotion()) return
      const tl = gsap.timeline({
        scrollTrigger: { trigger: root.current, start: 'top 40%', end: 'bottom bottom', scrub: true },
      })
      gsap.fromTo(
        '[data-big]',
        { scale: 0.55, opacity: 0, filter: 'blur(24px)', letterSpacing: '0.4em' },
        {
          scale: 1,
          opacity: 1,
          filter: 'blur(0px)',
          letterSpacing: '-0.02em',
          ease: 'power2.out',
          scrollTrigger: { trigger: root.current, start: 'top 85%', end: 'top 15%', scrub: true },
        },
      )
      gsap.to('[data-big]', {
        yPercent: -30,
        opacity: 0,
        ease: 'power1.in',
        scrollTrigger: { trigger: root.current, start: 'bottom 110%', end: 'bottom 40%', scrub: true },
      })
      tl.fromTo('[data-caption]', { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.25, ease: 'none' })
        .to('[data-caption]', { opacity: 1, duration: 0.45 })
        .to('[data-caption]', { opacity: 0, y: -30, duration: 0.2, ease: 'none' })
    },
    { scope: root },
  )

  return (
    <section ref={root} id="morph" className="relative -mb-[30vh] h-[190vh]" aria-label={t.morph.aria}>
      <div className="sticky top-0 flex h-[100svh] flex-col items-center justify-center px-[var(--gutter)]">
        <p className="sr-only">{t.morph.sr}</p>
        <p data-big aria-hidden="true" className="display mb-[6vh] text-[clamp(10rem,6rem+22vw,26rem)] leading-none drop-shadow-[0_0_40px_rgb(193_60_255/0.45)]">
          {PROJECTS.length}
        </p>
        <div data-caption className="max-w-xl text-center">
          <p className="text-[clamp(1.2rem,0.9rem+0.9vw,1.75rem)] leading-snug tracking-[-0.02em]">
            {t.morph.line1}
          </p>
          <p className="mt-3 text-mist">
            {t.morph.line2}
          </p>
        </div>
      </div>
    </section>
  )
}
