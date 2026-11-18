import { useRef } from 'react'
import { gsap, useGSAP, prefersReducedMotion } from '../../lib/motion'
import { useContent } from '../../data/profile'
import { TitleParts, useT } from '../../i18n/useT'
import { Anchor } from '../three/Anchor'
import { SectionHeading } from '../ui/SectionHeading'
import { RevealText } from '../ui/RevealText'

export function Feats() {
  const root = useRef<HTMLElement>(null)
  const t = useT()
  const { hackathon } = useContent().feats

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
    },
    { scope: root },
  )

  return (
    <section ref={root} id="hauts-faits" className="relative isolate py-24 md:py-32">
      <Anchor kind="cat" className="top-[3%] right-[3%] w-[9vw] max-md:w-[14vw]" par={0.2} tilt={0.7} />
      <div className="px-[var(--gutter)]">
        <SectionHeading index="02" label={t.feats.label} title={<TitleParts parts={t.feats.title} />} className="!mb-8 md:!mb-8" />
        {/* L'essentiel en un coup d'œil : durée, équipe, commanditaire, rôle, outil. */}
        <ul className="mb-12 flex flex-wrap gap-2.5 md:mb-14" aria-label={t.feats.label}>
          {t.feats.chips.map((c, i) => (
            <li key={c} className={['sticker bg-lemon', 'sticker bg-vermilion', 'sticker bg-chrome', 'sticker bg-paper text-ink', 'sticker bg-signal text-ink'][i % 5]}>
              {c}
            </li>
          ))}
        </ul>
      </div>

      {/* Bureau : le texte à gauche, la photo de la scène à droite, à la même hauteur : plus de blanc de chaque côté. Mobile : photo puis texte. */}
      <div className="grid items-start gap-10 px-[var(--gutter)] lg:grid-cols-[minmax(0,1fr)_minmax(0,0.95fr)] lg:gap-16">
        <figure data-photo className="relative aspect-[5/4] overflow-hidden rounded-[clamp(36px,5vw,64px)] lg:col-start-2 lg:row-start-1 lg:aspect-[4/5]">
          <img src={hackathon.photo} alt={t.feats.photoAlt} className="size-full object-cover object-[50%_32%]" width={1600} height={1720} loading="lazy" />
          <figcaption className="label absolute inset-x-0 bottom-0 flex flex-col gap-1 bg-gradient-to-t from-black/70 to-transparent p-5 text-white md:flex-row md:justify-between md:gap-4 md:p-8">
            <span>{hackathon.event}</span>
            <span>
              {hackathon.date} · {hackathon.duration}
            </span>
          </figcaption>
        </figure>

        <div className="grid gap-8 lg:col-start-1 lg:row-start-1">
          <p>
            <span className="sticker bg-chrome text-paper">{t.feats.brief}</span>
          </p>
          <RevealText className="text-[clamp(1.5rem,1rem+1.2vw,2.25rem)] leading-[1.15] tracking-[-0.02em]">
            <span className="serif">«</span> {hackathon.brief} <span className="serif">»</span>
          </RevealText>
          <div>
            <p className="label text-mist">
              {t.feats.role} · {hackathon.role}
            </p>
            <ul data-delivered className="mt-5 grid gap-3">
              {hackathon.delivered.map((d) => (
                <li key={d} className="flex gap-4 rounded-[28px] bg-graphite px-6 py-4 transition-colors duration-300 hover:bg-graphite-2">
                  <span className="mt-2 size-2 shrink-0 rounded-full bg-signal" aria-hidden="true" />
                  {d}
                </li>
              ))}
            </ul>
            <p className="mt-6 leading-relaxed text-mist">{hackathon.outcome}</p>
          </div>
        </div>
      </div>

      {/* À quoi ça ressemble en vrai : captures du prototype (données fictives). */}
      <div className="mt-16 px-[var(--gutter)] md:mt-20" aria-labelledby="feats-real-title">
        <h3 id="feats-real-title" className="display text-[clamp(1.8rem,1rem+2.6vw,3.4rem)]">
          {t.feats.real.title}
        </h3>
        <p className="mt-3 max-w-2xl text-sm leading-snug text-mist">{t.feats.real.note}</p>
        <ul className="mt-8 grid gap-5 md:grid-cols-3 md:gap-6">
          {t.feats.real.shots.map((s) => (
            <li key={s.src}>
              <figure>
                <img
                  src={s.src}
                  alt={s.alt}
                  loading="lazy"
                  decoding="async"
                  width={900}
                  height={970}
                  className="aspect-[9/10] w-full rounded-[28px] border-[2.5px] border-[#2B0F3A] bg-[#EADFFF] object-cover object-top shadow-[var(--shadow-card)]"
                />
                <figcaption className="mt-3 text-[15px] leading-snug">{s.caption}</figcaption>
              </figure>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
