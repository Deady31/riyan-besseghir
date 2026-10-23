import { useRef } from 'react'
import { ArrowUpRight } from 'lucide-react'
import { gsap, useGSAP, prefersReducedMotion } from '../../lib/motion'
import { useContent } from '../../data/profile'
import { TitleParts, useT } from '../../i18n/useT'
import { SectionHeading } from '../ui/SectionHeading'
import { Counter } from '../ui/Counter'

export function Impact() {
  const root = useRef<HTMLElement>(null)
  const t = useT()
  const IMPACT = useContent().impact
  const { product, roadmap } = IMPACT

  useGSAP(
    () => {
      if (prefersReducedMotion()) return
      gsap.fromTo(
        '[data-product-shot]',
        { clipPath: 'inset(8% 8% 8% 8% round 24px)' },
        {
          clipPath: 'inset(0% 0% 0% 0% round 20px)',
          ease: 'none',
          scrollTrigger: { trigger: '[data-product-shot]', start: 'top 85%', end: 'center 55%', scrub: true },
        },
      )
      gsap.fromTo('[data-product-shot] img', { scale: 1.12 }, {
        scale: 1,
        ease: 'none',
        scrollTrigger: { trigger: '[data-product-shot]', start: 'top bottom', end: 'bottom top', scrub: true },
      })
      gsap.from('[data-fact]', {
        y: 20,
        opacity: 0,
        duration: 0.8,
        ease: 'expo.out',
        stagger: 0.07,
        scrollTrigger: { trigger: '[data-product-facts]', start: 'top 85%', once: true },
      })
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
      gsap.from('[data-roadmap-item]', {
        y: 40,
        opacity: 0,
        duration: 1,
        ease: 'expo.out',
        stagger: 0.1,
        scrollTrigger: { trigger: '[data-roadmap]', start: 'top 82%', once: true },
      })
    },
    { scope: root },
  )

  return (
    <section ref={root} id="impact" className="relative px-[var(--gutter)] py-32 md:py-48">
      <SectionHeading index="01" label={t.impact.label} title={<TitleParts parts={t.impact.title} />} />

      <div className="grid gap-10 md:ml-[25%] lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)] lg:gap-14">
        <figure>
          <div data-product-shot className="overflow-hidden rounded-[20px] bg-[#dff6fb]">
            <img
              src="/media/shippingbo/shippingbo-intelligence.webp"
              alt={product.alt}
              width={2000}
              height={1500}
              loading="lazy"
              className="block aspect-[4/3] w-full object-cover"
            />
          </div>
          <figcaption className="label mt-3 text-mist">{product.credit}</figcaption>
        </figure>

        <div className="flex flex-col">
          <img src="/media/shippingbo/shippingbo-logo.png" alt="Shippingbo" width={380} height={100} className="h-7 w-auto self-start md:h-8" />
          <h3 className="mt-6 text-3xl tracking-[-0.03em] md:text-4xl">{product.name}</h3>
          <p className="mt-3 leading-relaxed text-mist">{product.tagline}</p>

          <dl data-product-facts className="mt-8 border-t border-line">
            {product.facts.map(([k, v]) => (
              <div data-fact key={k} className="grid grid-cols-[6.5rem_minmax(0,1fr)] gap-4 border-b border-line py-4">
                <dt className="label pt-1 text-mist">{k}</dt>
                <dd>{v}</dd>
              </div>
            ))}
          </dl>

          <a
            href={product.link}
            target="_blank"
            rel="noreferrer"
            className="group mt-8 inline-flex items-center gap-2 self-start rounded-full border border-line px-5 py-2.5 text-sm transition-colors hover:border-paper"
          >
            {product.linkLabel}
            <ArrowUpRight className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" aria-hidden="true" />
            <span className="sr-only">{t.links.newTab}</span>
          </a>
        </div>
      </div>

      <div data-stats className="mt-24 grid grid-cols-2 border-t border-line md:ml-[25%] lg:grid-cols-4">
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
      </div>

      <div data-roadmap className="mt-24 md:ml-[25%]">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <p className="label text-mist">{roadmap.title}</p>
          <span className="label inline-flex items-center gap-2 rounded-full border border-signal/50 px-3 py-1 text-signal-soft">
            <span className="size-1.5 rounded-full bg-signal" aria-hidden="true" />
            {roadmap.badge}
          </span>
        </div>
        <ol className="grid gap-4 md:grid-cols-3">
          {roadmap.items.map((r, i) => (
            <li data-roadmap-item key={r.name} className="relative rounded-[20px] border border-line bg-graphite/70 p-6 backdrop-blur-sm">
              <span className="label text-signal-soft">{String(i + 1).padStart(2, '0')}</span>
              <h4 className="mt-8 text-2xl tracking-[-0.03em]">{r.name}</h4>
              <p className="mt-3 leading-relaxed text-mist">{r.text}</p>
            </li>
          ))}
        </ol>
      </div>

      <p className="mt-16 flex items-center gap-3 text-paper md:ml-[25%]">
        <span className="size-1.5 rounded-full bg-signal" aria-hidden="true" />
        {IMPACT.extra}
      </p>
    </section>
  )
}
