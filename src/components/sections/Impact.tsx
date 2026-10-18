import { useRef } from 'react'
import { gsap, useGSAP, prefersReducedMotion } from '../../lib/motion'
import { useContent } from '../../data/profile'
import { TitleParts, useT } from '../../i18n/useT'
import { SectionHeading } from '../ui/SectionHeading'
import { Counter } from '../ui/Counter'

export function Impact() {
  const root = useRef<HTMLElement>(null)
  const t = useT()
  const IMPACT = useContent().impact

  useGSAP(
    () => {
      if (prefersReducedMotion()) return
      gsap.from('[data-stat]', {
        y: 40,
        opacity: 0,
        duration: 1.1,
        ease: 'expo.out',
        stagger: 0.08,
        scrollTrigger: { trigger: '[data-stats]', start: 'top 80%', once: true },
      })
      gsap.from('[data-feature]', {
        y: 30,
        opacity: 0,
        duration: 1,
        ease: 'expo.out',
        stagger: 0.08,
        scrollTrigger: { trigger: '[data-features]', start: 'top 82%', once: true },
      })
    },
    { scope: root },
  )

  return (
    <section ref={root} id="impact" className="relative px-[var(--gutter)] py-32 md:py-48">
      <SectionHeading
        index="01"
        label={t.impact.label}
        title={<TitleParts parts={t.impact.title} />}
        intro={t.impact.intro(IMPACT.role, IMPACT.context)}
      />

      <div data-stats className="grid grid-cols-2 border-t border-line md:ml-[25%] lg:grid-cols-4">
        {IMPACT.stats.map((s) => (
          <div data-stat key={s.label} className="border-b border-line py-8 pr-6 lg:border-b-0">
            <Counter
              value={s.value}
              prefix={s.prefix}
              suffix={s.suffix}
              className="display block text-[clamp(3.5rem,1rem+4.5vw,6.5rem)] whitespace-nowrap tabular-nums"
            />
            <p className="mt-4 text-paper">{s.label}</p>
            <p className="mt-1 text-sm text-mist">{s.note}</p>
          </div>
        ))}
      </div>

      <div data-features className="mt-24 md:ml-[25%]">
        <p className="label mb-6 text-mist">{t.impact.shipped}</p>
        <ul className="border-t border-line">
          {IMPACT.features.map((f, i) => (
            <li data-feature key={f.name} className="grid gap-2 border-b border-line py-7 md:grid-cols-[3rem_minmax(0,1fr)_minmax(0,1.6fr)] md:gap-8">
              <span className="label pt-2 text-mist">{String(i + 1).padStart(2, '0')}</span>
              <h3 className="text-3xl tracking-[-0.03em]">{f.name}</h3>
              <p className="max-w-xl leading-relaxed text-mist">{f.text}</p>
            </li>
          ))}
        </ul>
        <p className="mt-8 flex items-center gap-3 text-paper">
          <span className="size-1.5 rounded-full bg-signal" aria-hidden="true" />
          {IMPACT.extra}
        </p>
      </div>
    </section>
  )
}
