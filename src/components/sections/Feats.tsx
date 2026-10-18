import { useRef } from 'react'
import { ArrowUpRight } from 'lucide-react'
import { gsap, useGSAP, prefersReducedMotion } from '../../lib/motion'
import { useContent } from '../../data/profile'
import { TitleParts, useT } from '../../i18n/useT'
import { SectionHeading } from '../ui/SectionHeading'
import { RevealText } from '../ui/RevealText'

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
      gsap.fromTo('[data-photo] img', { scale: 1.25 }, {
        scale: 1,
        ease: 'none',
        scrollTrigger: { trigger: '[data-photo]', start: 'top bottom', end: 'bottom top', scrub: true },
      })
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
    <section ref={root} id="hauts-faits" className="relative py-32 md:py-48">
      <div className="px-[var(--gutter)]">
        <SectionHeading
          index="02"
          label={t.feats.label}
          title={<TitleParts parts={t.feats.title} />}
        />
      </div>

      <figure data-photo className="relative mx-[var(--gutter)] aspect-[4/5] overflow-hidden md:aspect-[16/9]">
        <img
          src={hackathon.photo}
          alt={t.feats.photoAlt}
          className="size-full object-cover object-[50%_32%]"
          width={1600}
          height={1720}
          loading="lazy"
        />
        <figcaption className="label absolute inset-x-0 bottom-0 flex justify-between gap-4 bg-gradient-to-t from-ink/80 to-transparent p-5 text-paper md:p-8">
          <span>{hackathon.event}</span>
          <span>
            {hackathon.date} · {hackathon.duration}
          </span>
        </figcaption>
      </figure>

      <div className="mt-20 grid gap-14 px-[var(--gutter)] md:grid-cols-[minmax(0,1fr)_minmax(0,3fr)]">
        <p className="label text-mist">{t.feats.brief}</p>
        <div className="grid gap-16 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
          <RevealText className="text-[clamp(1.5rem,1rem+1.2vw,2.25rem)] leading-[1.15] tracking-[-0.02em]">
            <span className="serif">«</span> {hackathon.brief} <span className="serif">»</span>
          </RevealText>
          <div>
            <p className="label text-mist">{t.feats.role} · {hackathon.role}</p>
            <ul data-delivered className="mt-6 border-t border-line">
              {hackathon.delivered.map((d) => (
                <li key={d} className="flex gap-4 border-b border-line py-4">
                  <span className="mt-2 size-1.5 shrink-0 rounded-full bg-signal" aria-hidden="true" />
                  {d}
                </li>
              ))}
            </ul>
            <p className="mt-8 leading-relaxed text-mist">{hackathon.outcome}</p>
          </div>
        </div>
      </div>

      <div className="mt-32 grid gap-14 px-[var(--gutter)] md:grid-cols-[minmax(0,1fr)_minmax(0,3fr)]">
        <p className="label text-mist">{t.feats.soon}</p>
        <ul className="border-t border-line">
          {teasers.map((teaser) => (
            <li key={teaser.title} className="group grid gap-2 border-b border-line py-8 md:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)_auto] md:items-baseline md:gap-8">
              <h3 className="text-[clamp(1.75rem,1rem+1.6vw,2.75rem)] tracking-[-0.03em]">{teaser.title}</h3>
              <p className="text-mist">{teaser.hint}</p>
              <span className="label inline-flex items-center gap-2 text-signal-soft">
                {t.feats.inPrep}
                <ArrowUpRight className="size-4 opacity-0 transition-opacity group-hover:opacity-100" aria-hidden="true" />
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
