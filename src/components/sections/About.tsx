import { useRef } from 'react'
import { gsap, useGSAP, prefersReducedMotion } from '../../lib/motion'
import { SectionHeading } from '../ui/SectionHeading'
import { Anchor } from '../three/Anchor'
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
      <Anchor kind="form-cobalt" className="top-[10%] right-[3%] w-[16vw] max-md:w-[30vw]" par={0.15} />
      <Anchor kind="sat-chrome" className="bottom-[10%] left-[44%] w-[3vw] max-md:hidden" par={0.3} />
      <Anchor kind="cube-chrome" className="top-[56%] left-[1.5%] w-[3.6vw] max-md:hidden" par={0.3} />
      <SectionHeading index="05" label={a.label} title={<TitleParts parts={a.title} />} />

      <div>
        <div className="grid gap-14 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:gap-24">
          <div className="relative">
            {/* aplat vermillon décalé derrière le portrait : même langage que le hero */}
            <div className="absolute -right-4 -bottom-4 size-[88%] rounded-[clamp(40px,5vw,72px)] bg-vermilion max-lg:-right-2 max-lg:-bottom-2" aria-hidden="true" />
            <figure data-about-photo data-reveal-img className="relative aspect-[4/5] overflow-hidden rounded-[clamp(40px,5vw,72px)] bg-graphite">
              <img
                src="/media/about-portrait.webp"
                alt={a.photoAlt}
                className="size-full object-cover object-[50%_20%]"
                width={900}
                height={1059}
                loading="lazy"
              />
            </figure>
          </div>

          <div>
            <p data-light className="text-[clamp(1.35rem,1rem+0.9vw,2rem)] leading-[1.2] tracking-[-0.02em]">{a.lead}</p>
            <div className="mt-8 space-y-5 text-lg leading-relaxed text-mist">
              {a.paragraphs.map((p) => (
                <p key={p}>{p}</p>
              ))}
            </div>

            <dl data-facts className="mt-12 grid gap-3">
              {a.facts.map(([k, v]) => (
                <div
                  data-fact
                  key={k}
                  className="grid grid-cols-[7rem_minmax(0,1fr)] gap-4 rounded-[28px] bg-graphite px-6 py-4 transition-[background-color,transform] duration-300 hover:-translate-y-0.5 hover:bg-graphite-2 active:scale-[0.985]"
                >
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
