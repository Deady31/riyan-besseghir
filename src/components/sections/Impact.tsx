import { useRef } from 'react'
import { ArrowUpRight } from 'lucide-react'
import { gsap, useGSAP, prefersReducedMotion } from '../../lib/motion'
import { useContent } from '../../data/profile'
import { TitleParts, useT } from '../../i18n/useT'
import { SectionHeading } from '../ui/SectionHeading'
import { Counter } from '../ui/Counter'
import { Anchor } from '../three/Anchor'
import { BigTile, type Tone } from '../ui/BigTile'

const STAT_TONES: Tone[] = ['paper', 'cobalt', 'vermilion', 'acid']
const FEATURE_TONES: Tone[] = ['paper', 'chrome', 'paper', 'chrome']

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
        { clipPath: 'inset(8% 8% 8% 8% round 80px)' },
        {
          clipPath: 'inset(0% 0% 0% 0% round 56px)',
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
      <Anchor kind="slab" className="top-[4%] left-[1.5%] w-[15vw] max-md:hidden" par={0.12} />
      <Anchor kind="ring" className="top-[26%] right-[0.5%] w-[13vw] max-md:hidden" par={0.25} />
      <Anchor kind="form-chrome" className="bottom-[5%] left-[0.5%] w-[19vw] max-md:hidden" par={0.2} />
      <Anchor kind="sat-red" className="top-[58%] right-[5%] w-[3.4vw] max-md:hidden" par={0.35} />
      <Anchor kind="star" className="top-[56%] left-[0.5%] w-[12vw] max-md:hidden" par={0.3} tilt={0.9} />
      <Anchor kind="capsule" className="top-[13%] right-[17%] w-[6.5vw] max-md:hidden" par={0.3} />
      <Anchor kind="crystal" className="bottom-[26%] right-[1%] w-[7.5vw] max-md:hidden" par={0.3} />
      <Anchor kind="mobius" className="top-[80%] right-[8%] w-[14vw] max-md:hidden" par={0.25} />
      <Anchor kind="orb" className="top-[7%] right-[4%] w-[26vw] md:hidden" par={0.2} />
      <Anchor kind="crystal" className="top-[46%] right-[2%] w-[4.5vw] max-md:hidden" par={0.7} layer="front" />
      <SectionHeading index="01" align="right" label={t.impact.label} title={<TitleParts parts={t.impact.title} />} />

      <div className="grid gap-10 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)] lg:gap-16">
        <figure>
          <div data-product-shot data-reveal-img className="overflow-hidden rounded-[56px] bg-[#dff6fb]">
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
            className="pop group mt-8 inline-flex items-center gap-2 self-start px-6 py-3 text-sm font-semibold transition-colors hover:bg-paper hover:text-ink"
          >
            {product.linkLabel}
            <ArrowUpRight className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" aria-hidden="true" />
            <span className="sr-only">{t.links.newTab}</span>
          </a>
        </div>
      </div>

      <div data-stats className="mt-24 grid grid-cols-2 gap-4 md:gap-6 lg:grid-cols-4">
        {IMPACT.stats.map((s, i) => (
          <BigTile data-stat key={s.label} tone={STAT_TONES[i % STAT_TONES.length]} inner="flex flex-col justify-between gap-10 !p-6 md:!p-8">
            <Counter
              value={s.value}
              prefix={s.prefix}
              suffix={s.suffix}
              className="display block text-[clamp(2.6rem,1rem+3.6vw,5.5rem)] whitespace-nowrap tabular-nums"
            />
            <span className="block">
              <span className="block text-lg leading-snug font-semibold">{s.label}</span>
              <span className="mt-1 block text-sm opacity-75">{s.note}</span>
            </span>
          </BigTile>
        ))}
      </div>

      <div data-features className="mt-24">
        <p className="sticker mb-8 bg-lemon text-paper">{t.impact.shipped}</p>
        <ul className="grid gap-4 md:grid-cols-2 md:gap-6">
          {IMPACT.features.map((f, i) => (
            <li data-feature key={f.name}>
              <BigTile tone={FEATURE_TONES[i % FEATURE_TONES.length]} inner="flex flex-col gap-5 md:!p-10">
                <span className="label opacity-70">{String(i + 1).padStart(2, '0')}</span>
                <h3 className="text-[clamp(1.6rem,1.1rem+1.4vw,2.6rem)] leading-[1.02] tracking-[-0.03em]">{f.name}</h3>
                <p className="max-w-xl leading-relaxed opacity-80">{f.text}</p>
              </BigTile>
            </li>
          ))}
        </ul>
      </div>

      <div data-roadmap className="mt-24">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <p className="label text-mist">{roadmap.title}</p>
          <span className="sticker bg-lemon text-paper">
            <span className="size-1.5 rounded-full bg-paper" aria-hidden="true" />
            {roadmap.badge}
          </span>
        </div>
        <ol className="grid gap-4 md:grid-cols-3 md:gap-6">
          {roadmap.items.map((r, i) => (
            <li data-roadmap-item key={r.name}>
              <BigTile tone={i === 1 ? 'cobalt' : 'paper'} inner="flex flex-col">
                <span className="label opacity-70">{String(i + 1).padStart(2, '0')}</span>
                <h4 className="mt-10 text-2xl leading-tight tracking-[-0.03em]">{r.name}</h4>
                <p className="mt-3 leading-relaxed opacity-80">{r.text}</p>
              </BigTile>
            </li>
          ))}
        </ol>
      </div>

      <p className="mt-14 inline-flex max-w-3xl items-start gap-3 rounded-[28px] bg-graphite px-6 py-4 text-paper">
        <span className="mt-2 size-2 shrink-0 rounded-full bg-signal" aria-hidden="true" />
        {IMPACT.extra}
      </p>
    </section>
  )
}
