import { useRef } from 'react'
import { ArrowUpRight, CalendarRange, ChartNoAxesCombined, CopyCheck, FileUp, MessageSquareText, Puzzle, Sparkles, TrendingDown, Users, Zap, type LucideIcon } from 'lucide-react'
import { gsap, useGSAP, prefersReducedMotion } from '../../lib/motion'
import { useContent } from '../../data/profile'
import { TitleParts, useT } from '../../i18n/useT'
import { SectionHeading } from '../ui/SectionHeading'
import { Counter } from '../ui/Counter'
import { Anchor } from '../three/Anchor'
import { BigTile, type Tone } from '../ui/BigTile'

const STAT_TONES: Tone[] = ['paper', 'cobalt', 'vermilion', 'acid']
const FEATURE_TONES: Tone[] = ['paper', 'chrome', 'paper', 'chrome']

// Un symbole par case : on comprend avant de lire. L'ordre suit celui des données (livrables, roadmap, chiffres).
// Classes de ventes (3ᵉ livrable) et Commandes identiques (4ᵉ) ont un mini-visuel à la place de l'icône : l'image y est plus claire que le mot.
const FEATURE_ICONS: (LucideIcon | null)[] = [MessageSquareText, ChartNoAxesCombined, null, null]
const ROADMAP_ICONS: LucideIcon[] = [FileUp, Puzzle, Zap]
const STAT_ICONS: LucideIcon[] = [TrendingDown, Sparkles, Users, CalendarRange]

/** Pastille d'icône : violet sur les cases claires, crème sur la case violette. Elle bouge un peu au survol de la case (`group`). */
function IconChip({ icon: Icon, onDark = false }: { icon: LucideIcon; onDark?: boolean }) {
  return (
    <span
      aria-hidden="true"
      className={`grid size-14 shrink-0 place-items-center rounded-2xl transition-transform duration-300 group-hover:-rotate-6 group-hover:scale-110 ${onDark ? 'bg-ink text-signal' : 'bg-signal text-ink'}`}
    >
      <Icon className="size-7" strokeWidth={2} />
    </span>
  )
}

/** Classes de ventes : les quatre classes A à D, de la plus stratégique à la plus dormante. */
function AbcdVisual() {
  const shades = ['bg-signal text-ink', 'bg-[#8C5BFF] text-ink', 'bg-[#B9A0FF] text-paper', 'bg-[#DCCFFF] text-paper']
  return (
    <span aria-hidden="true" className="flex h-14 items-end gap-1.5">
      {['A', 'B', 'C', 'D'].map((l, i) => (
        <span
          key={l}
          className={`display grid w-10 place-items-center rounded-xl text-lg transition-transform duration-300 group-hover:-translate-y-1 ${shades[i]}`}
          style={{ height: `${3.5 - i * 0.6}rem`, transitionDelay: `${i * 40}ms` }}
        >
          {l}
        </span>
      ))}
    </span>
  )
}

/** Commandes identiques : deux cartes qui se chevauchent, fusionnées par une coche. */
function DuplicateVisual() {
  return (
    <span aria-hidden="true" className="relative block h-14 w-24">
      <span className="absolute top-0 left-0 grid h-11 w-16 rotate-[-6deg] content-center gap-1 rounded-xl border-2 border-[#2B0F3A] bg-[#EADFFF] px-2 transition-transform duration-300 group-hover:-translate-x-1">
        <span className="h-1.5 w-8 rounded-full bg-[#2B0F3A]/60" />
        <span className="h-1.5 w-5 rounded-full bg-[#2B0F3A]/30" />
      </span>
      <span className="absolute right-0 bottom-0 grid h-11 w-16 rotate-[5deg] content-center gap-1 rounded-xl border-2 border-[#2B0F3A] bg-white px-2 transition-transform duration-300 group-hover:translate-x-1">
        <span className="h-1.5 w-8 rounded-full bg-[#2B0F3A]/60" />
        <span className="h-1.5 w-5 rounded-full bg-[#2B0F3A]/30" />
      </span>
      <span className="absolute -top-1 -right-1 grid size-7 place-items-center rounded-full bg-[#FF7EC8] text-[#2B0F3A]">
        <CopyCheck className="size-4" strokeWidth={2.5} />
      </span>
    </span>
  )
}

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
    <section ref={root} id="impact" className="relative px-[var(--gutter)] py-24 md:py-32">
      <Anchor kind="stopwatch" className="top-[3%] left-[1.5%] w-[10vw] max-md:hidden" par={0.12} tilt={0.7} />
      <Anchor kind="stopwatch" className="top-[0.5%] right-[4%] w-[16vw] md:hidden" par={0.2} tilt={0.7} />
      <SectionHeading index="01" align="right" label={t.impact.label} title={<TitleParts parts={t.impact.title} />} className="!mb-10 md:!mb-14" />

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

      <div data-stats className="mt-14 grid grid-cols-2 gap-4 md:gap-6 lg:grid-cols-4">
        {IMPACT.stats.map((s, i) => (
          <BigTile data-stat key={s.label} tone={STAT_TONES[i % STAT_TONES.length]} inner="group flex flex-col justify-between gap-8 !p-6 md:!p-8">
            <span className="flex justify-end">
              <IconChip icon={STAT_ICONS[i % STAT_ICONS.length]} onDark={STAT_TONES[i % STAT_TONES.length] === 'cobalt'} />
            </span>
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

      {/* Bureau : les 4 livrables à gauche, la roadmap en colonne à droite : un seul bloc compact, sans bande vide. */}
      <div className="mt-14 grid gap-14 lg:mt-16 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)] lg:items-start lg:gap-10">
        <div data-features>
          <p className="sticker mb-6 bg-lemon text-paper">{t.impact.shipped}</p>
          <ul className="grid gap-4 md:grid-cols-2 md:gap-5">
            {IMPACT.features.map((f, i) => (
              <li data-feature key={f.name}>
                <BigTile tone={FEATURE_TONES[i % FEATURE_TONES.length]} inner="group flex h-full flex-col gap-4 md:!p-8">
                  <span className="flex items-start justify-between gap-4">
                    {FEATURE_ICONS[i] ? <IconChip icon={FEATURE_ICONS[i]!} /> : i === 2 ? <AbcdVisual /> : <DuplicateVisual />}
                    <span className="label opacity-70">{String(i + 1).padStart(2, '0')}</span>
                  </span>
                  <h3 className="text-[clamp(1.5rem,1.1rem+1vw,2.2rem)] leading-[1.02] tracking-[-0.03em]">{f.name}</h3>
                  <p className="leading-relaxed opacity-80">{f.text}</p>
                </BigTile>
              </li>
            ))}
          </ul>
        </div>

        <div data-roadmap>
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <p className="label text-mist">{roadmap.title}</p>
            <span className="sticker bg-lemon text-paper">
              <span className="size-1.5 rounded-full bg-paper" aria-hidden="true" />
              {roadmap.badge}
            </span>
          </div>
          <ol className="grid gap-4">
            {roadmap.items.map((r, i) => (
              <li data-roadmap-item key={r.name}>
                <BigTile tone={i === 1 ? 'cobalt' : 'paper'} inner="group flex flex-col !p-6">
                  <span className="flex items-start justify-between gap-4">
                    <IconChip icon={ROADMAP_ICONS[i % ROADMAP_ICONS.length]} onDark={i === 1} />
                    <span className="label opacity-70">{String(i + 1).padStart(2, '0')}</span>
                  </span>
                  <h4 className="mt-4 text-2xl leading-tight tracking-[-0.03em]">{r.name}</h4>
                  <p className="mt-2 leading-relaxed opacity-80">{r.text}</p>
                </BigTile>
              </li>
            ))}
          </ol>
          <p className="mt-5 flex items-start gap-3 rounded-[28px] bg-graphite px-5 py-4 text-sm text-paper">
            <span className="mt-1.5 size-2 shrink-0 rounded-full bg-signal" aria-hidden="true" />
            {IMPACT.extra}
          </p>
        </div>
      </div>
    </section>
  )
}
