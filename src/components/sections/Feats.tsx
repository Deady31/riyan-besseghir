import { useRef } from 'react'
import { Lock } from 'lucide-react'
import { gsap, useGSAP, prefersReducedMotion } from '../../lib/motion'
import { useContent } from '../../data/profile'
import { TitleParts, useT } from '../../i18n/useT'
import { BigTile } from '../ui/BigTile'
import { Anchor } from '../three/Anchor'
import { SectionHeading } from '../ui/SectionHeading'
import { RevealText } from '../ui/RevealText'

const REDACTED = [
  ['92%', '74%', '58%'],
  ['84%', '96%', '46%'],
]

export function Feats() {
  const root = useRef<HTMLElement>(null)
  const t = useT()
  const { hackathon, teasers } = useContent().feats

  useGSAP(
    () => {
      if (prefersReducedMotion()) return
      gsap.fromTo(
        '[data-photo]',
        { clipPath: 'inset(12% 14% 12% 14%)' },
        {
          clipPath: 'inset(0% 0% 0% 0%)',
          ease: 'none',
          scrollTrigger: { trigger: '[data-photo]', start: 'top 85%', end: 'center 50%', scrub: true },
        },
      )
      gsap.fromTo(
        '[data-photo] img',
        { scale: 1.25 },
        {
          scale: 1,
          ease: 'none',
          scrollTrigger: { trigger: '[data-photo]', start: 'top bottom', end: 'bottom top', scrub: true },
        },
      )
      gsap.from('[data-delivered] li', {
        y: 24,
        opacity: 0,
        duration: 0.9,
        ease: 'expo.out',
        stagger: 0.1,
        scrollTrigger: { trigger: '[data-delivered]', start: 'top 82%', once: true },
      })
      const tl = gsap.timeline({ scrollTrigger: { trigger: '[data-teasers]', start: 'top 80%', once: true } })
      tl.from('[data-teaser]', { y: 50, opacity: 0, duration: 1, ease: 'expo.out', stagger: 0.15 })
        .from('[data-teaser] .redacted-bar', { scaleX: 0, transformOrigin: 'left center', duration: 0.7, ease: 'power3.out', stagger: 0.08 }, 0.35)
        .from(
          '[data-teaser] .classified-stamp',
          { scale: 2.2, opacity: 0, duration: 0.4, ease: 'power4.in', stagger: 0.15, clearProps: 'transform,opacity' },
          0.9,
        )
    },
    { scope: root },
  )

  return (
    <section ref={root} id="hauts-faits" className="relative isolate py-32 md:py-48">
      <Anchor kind="cat" className="top-[3%] right-[3%] w-[9vw] max-md:w-[14vw]" par={0.2} tilt={0.7} />
      <div className="px-[var(--gutter)]">
        <SectionHeading index="02" label={t.feats.label} title={<TitleParts parts={t.feats.title} />} className="!mb-8 md:!mb-10" />
        {/* L'essentiel en un coup d'œil : durée, équipe, commanditaire, rôle, outil. */}
        <ul className="mb-14 flex flex-wrap gap-2.5 md:mb-20" aria-label={t.feats.label}>
          {t.feats.chips.map((c, i) => (
            <li key={c} className={['sticker bg-lemon', 'sticker bg-vermilion', 'sticker bg-chrome', 'sticker bg-paper text-ink', 'sticker bg-signal text-ink'][i % 5]}>
              {c}
            </li>
          ))}
        </ul>
      </div>

      <figure data-photo className="relative mx-[var(--gutter)] aspect-[5/4] overflow-hidden rounded-[clamp(36px,5vw,72px)] md:mx-auto md:aspect-[16/9] md:w-[min(calc(100%-2*var(--gutter)),calc(66svh*16/9))]">
        <img src={hackathon.photo} alt={t.feats.photoAlt} className="size-full object-cover object-[50%_32%]" width={1600} height={1720} loading="lazy" />
        <figcaption className="label absolute inset-x-0 bottom-0 flex justify-between gap-4 bg-gradient-to-t from-black/70 to-transparent p-6 text-white md:p-10">
          <span>{hackathon.event}</span>
          <span>
            {hackathon.date} · {hackathon.duration}
          </span>
        </figcaption>
      </figure>

      <div className="mt-20 grid gap-8 px-[var(--gutter)]">
        <p>
          <span className="sticker bg-chrome text-paper">{t.feats.brief}</span>
        </p>
        <div className="grid gap-16 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
          <RevealText className="text-[clamp(1.5rem,1rem+1.2vw,2.25rem)] leading-[1.15] tracking-[-0.02em]">
            <span className="serif">«</span> {hackathon.brief} <span className="serif">»</span>
          </RevealText>
          <div>
            <p className="label text-mist">
              {t.feats.role} · {hackathon.role}
            </p>
            <ul data-delivered className="mt-6 grid gap-3">
              {hackathon.delivered.map((d) => (
                <li key={d} className="flex gap-4 rounded-[28px] bg-graphite px-6 py-4 transition-colors duration-300 hover:bg-graphite-2">
                  <span className="mt-2 size-2 shrink-0 rounded-full bg-signal" aria-hidden="true" />
                  {d}
                </li>
              ))}
            </ul>
            <p className="mt-8 leading-relaxed text-mist">{hackathon.outcome}</p>
          </div>
        </div>
      </div>

      <div className="mt-32 grid gap-8 px-[var(--gutter)]">
        <p>
          <span className="sticker bg-vermilion text-paper">{t.feats.soon}</span>
        </p>
        <ul data-teasers className="grid gap-4 md:grid-cols-2">
          {teasers.map((teaser, i) => (
            <li key={teaser.title} data-teaser>
              <BigTile tone="paper" inner="classified group relative overflow-hidden md:!p-11">
                <div className="label flex items-center justify-between gap-4">
                  <span className="sticker bg-paper text-ink">
                    <Lock className="size-3" aria-hidden="true" />
                    {t.feats.classified}
                  </span>
                  <span className="text-mist">{teaser.file}</span>
                </div>

                <h3 className="mt-14 text-[clamp(1.75rem,1rem+1.6vw,2.75rem)] tracking-[-0.03em]">{teaser.title}</h3>

                <div className="mt-6 space-y-2.5" role="img" aria-label={t.feats.redactedAria}>
                  {REDACTED[i % REDACTED.length].map((w, j) => (
                    <span key={j} className="redacted-bar block h-3" style={{ width: w, animationDelay: `${j * 0.35}s` }} />
                  ))}
                </div>

                <p className="label mt-10 flex items-center gap-2.5 text-paper">
                  <span className="relative flex size-2">
                    <span className="absolute inline-flex size-full animate-ping rounded-full bg-signal opacity-70 motion-reduce:hidden" />
                    <span className="relative inline-flex size-2 rounded-full bg-signal" />
                  </span>
                  {teaser.hint}
                </p>

                <span
                  className="classified-stamp label pointer-events-none absolute right-6 bottom-6 -rotate-12 md:right-9 md:bottom-8 rounded-full border-2 border-signal/60 px-4 py-1.5 text-signal"
                  aria-hidden="true"
                >
                  {t.feats.classified}
                </span>
              </BigTile>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
