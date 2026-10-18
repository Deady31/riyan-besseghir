import { useRef } from 'react'
import { gsap, useGSAP, prefersReducedMotion } from '../../lib/motion'
import { SectionHeading } from '../ui/SectionHeading'
import { RevealText } from '../ui/RevealText'
import { TitleParts, useT } from '../../i18n/useT'

export function About() {
  const root = useRef<HTMLElement>(null)
  const t = useT()
  const a = t.about

  useGSAP(
    () => {
      if (prefersReducedMotion()) return
      gsap.fromTo(
        '[data-about-photo]',
        { clipPath: 'inset(100% 0% 0% 0%)' },
        { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.4, ease: 'expo.inOut', scrollTrigger: { trigger: '[data-about-photo]', start: 'top 80%', once: true } },
      )
      gsap.fromTo('[data-about-photo] img', { scale: 1.2 }, {
        scale: 1,
        ease: 'none',
        scrollTrigger: { trigger: '[data-about-photo]', start: 'top bottom', end: 'bottom top', scrub: true },
      })
      gsap.from('[data-fact]', {
        y: 20,
        opacity: 0,
        duration: 0.8,
        ease: 'expo.out',
        stagger: 0.06,
        scrollTrigger: { trigger: '[data-facts]', start: 'top 85%', once: true },
      })
    },
    { scope: root },
  )

  return (
    <section ref={root} id="about" className="relative px-[var(--gutter)] py-32 md:py-48">
      <SectionHeading index="05" label={a.label} title={<TitleParts parts={a.title} />} />

      <div className="grid gap-14 md:grid-cols-[minmax(0,1fr)_minmax(0,3fr)]">
        <div className="hidden md:block" />
        <div className="grid gap-14 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-20">
          <figure data-about-photo className="relative aspect-[4/5] overflow-hidden rounded-[20px] bg-graphite">
            <img
              src="/media/about-portrait.webp"
              alt={a.photoAlt}
              className="size-full object-cover object-[50%_20%]"
              width={900}
              height={1059}
              loading="lazy"
            />
          </figure>

          <div>
            <RevealText className="text-[clamp(1.35rem,1rem+0.9vw,2rem)] leading-[1.2] tracking-[-0.02em]">{a.lead}</RevealText>
            <div className="mt-8 space-y-5 text-lg leading-relaxed text-mist">
              {a.paragraphs.map((p) => (
                <p key={p}>{p}</p>
              ))}
            </div>

            <dl data-facts className="mt-12 border-t border-line">
              {a.facts.map(([k, v]) => (
                <div data-fact key={k} className="grid grid-cols-[8rem_minmax(0,1fr)] gap-4 border-b border-line py-4">
                  <dt className="label pt-1 text-mist">{k}</dt>
                  <dd>{v}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </div>
    </section>
  )
}
