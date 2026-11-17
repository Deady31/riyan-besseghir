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
    <section ref={root} id="about" className="relative isolate px-[var(--gutter)] py-32 md:py-48">
      <Anchor kind="dumbbell" className="top-[5%] right-[2%] w-[17vw] max-md:w-[32vw]" par={0.15} tilt={0.7} />
      <Anchor kind="torus" className="top-[1%] left-[40%] w-[7vw] max-md:hidden" par={0.25} />
      <SectionHeading index="06" label={a.label} title={<TitleParts parts={a.title} />} />

      <div>
        <div className="grid gap-14 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:gap-24">
          <div className="relative mx-auto w-full max-w-[460px] lg:mx-0">
            {/* Même portrait détouré que dans le hero, sans cadre ni bloc de couleur : une seule façon de montrer la photo. */}
            <figure data-about-photo className="relative">
              <img
                src="/media/portrait/naturel.webp"
                alt={a.photoAlt}
                className="block h-auto w-full select-none"
                style={{ maskImage: 'linear-gradient(to bottom, #000 82%, transparent 100%)', WebkitMaskImage: 'linear-gradient(to bottom, #000 82%, transparent 100%)' }}
                width={900}
                height={1059}
                loading="lazy"
                draggable={false}
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
