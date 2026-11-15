import { lazy, Suspense, useRef } from 'react'
import { gsap, SplitText, useGSAP, prefersReducedMotion } from '../../lib/motion'
import { useContent } from '../../data/profile'
import { useT } from '../../i18n/useT'
import { LiveClock } from '../ui/LiveClock'
import { HeroStickers } from './HeroStickers'

const Skater3D = lazy(() => import('./Skater3D'))

export function Hero() {
  const root = useRef<HTMLElement>(null)
  const t = useT()
  const PROFILE = useContent().profile

  useGSAP(
    () => {
      if (prefersReducedMotion()) return
      const name = SplitText.create('[data-name]', { type: 'words,chars', mask: 'words' })
      const lines = SplitText.create('[data-statement]', { type: 'lines', mask: 'lines' })
      const tl = gsap.timeline({ delay: 0.3 })
      tl.from(name.chars, { yPercent: 110, duration: 1.3, ease: 'expo.out', stagger: 0.035 })
        .from(lines.lines, { yPercent: 110, duration: 1.1, ease: 'expo.out', stagger: 0.08 }, 0.5)
        .from('[data-meta]', { opacity: 0, duration: 1, ease: 'power2.out', stagger: 0.08 }, 0.9)

      gsap.to('[data-hero-inner]', {
        yPercent: -18,
        opacity: 0,
        ease: 'none',
        scrollTrigger: { trigger: root.current, start: 'top top', end: 'bottom top', scrub: true },
      })
      return () => {
        name.revert()
        lines.revert()
      }
    },
    { scope: root },
  )

  return (
    <section ref={root} id="top" className="relative h-[100svh] min-h-[640px]" aria-label={t.hero.aria}>
      <h1 className="sr-only">
        {PROFILE.name}, {PROFILE.role}
      </h1>
      <div data-hero-inner className="flex h-full flex-col px-[var(--gutter)] pt-28 pb-8 md:pt-32">
        <div className="absolute inset-x-0 top-[17%] h-[42%] md:top-[8%] md:right-[3%] md:bottom-[4%] md:left-auto md:h-auto md:w-[46%]">
          <Suspense fallback={null}>
            <Skater3D className="size-full cursor-grab active:cursor-grabbing" />
          </Suspense>
          <p data-meta className="label pointer-events-none absolute bottom-0 left-1/2 -translate-x-1/2 text-center whitespace-nowrap text-mist max-md:hidden">
            {t.hero.skaterHint}
          </p>
        </div>
        <HeroStickers />
        <div className="label flex flex-col gap-2 text-mist">
          <p data-meta>
            Toulouse, FR <LiveClock className="ml-2 text-paper tabular-nums" />
          </p>
          <p data-meta className="flex items-center gap-2 text-paper">
            <span className="size-1.5 rounded-full bg-signal" aria-hidden="true" />
            {PROFILE.availability}
          </p>
        </div>

        <div className="mt-auto max-w-[min(58vw,56rem)] max-md:max-w-none">
          <p
            data-statement
            className="max-w-[30rem] text-[clamp(1.2rem,0.9rem+1.1vw,2rem)] leading-[1.15] tracking-[-0.02em]"
          >
            {t.hero.statement}
          </p>
          <p data-name aria-hidden="true" className="display mt-8 text-[clamp(4rem,1rem+9.5vw,12.5rem)] md:mt-12">
            Riyan
            <br />
            <em>Besseghir</em>
          </p>
          <div className="label mt-6 flex justify-between text-mist md:hidden">
            <span data-meta>{t.hero.tagline}</span>
            <span data-meta>{t.hero.scroll}</span>
          </div>
        </div>
        <p data-meta className="label absolute right-[var(--gutter)] bottom-8 hidden text-mist md:block">
          {t.hero.scroll}
        </p>
      </div>
    </section>
  )
}
