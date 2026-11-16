import { useRef } from 'react'
import { gsap, useGSAP, prefersReducedMotion } from '../../lib/motion'
import { useT } from '../../i18n/useT'
import { PROJECTS } from '../../data/projects'
import { Anchor } from '../three/Anchor'

/**
 * Le chiffre clé s'ouvre en fondu net, puis « se fait swiper » : chaque chiffre est une carte du deck,
 * le premier part à gauche (BOF), le dernier à droite (MIAM), avec le tampon qui apparaît et le chiffre qui se floute.
 */
export function MorphMoment() {
  const root = useRef<HTMLElement>(null)
  const t = useT()
  const digits = String(PROJECTS.length).split('')

  useGSAP(
    () => {
      if (prefersReducedMotion()) return
      const tl = gsap.timeline({
        scrollTrigger: { trigger: root.current, start: 'top 40%', end: 'bottom bottom', scrub: true },
      })
      gsap.fromTo(
        '[data-big]',
        { scale: 0.55, opacity: 0, filter: 'blur(24px)' },
        {
          scale: 1,
          opacity: 1,
          filter: 'blur(0px)',
          ease: 'power2.out',
          scrollTrigger: { trigger: root.current, start: 'top 85%', end: 'top 15%', scrub: true },
        },
      )

      // Sortie : les chiffres partent chacun de leur côté comme deux cartes balancées d'un geste.
      const exit = gsap.timeline({
        scrollTrigger: { trigger: root.current, start: 'bottom 160%', end: 'bottom 105%', scrub: true },
      })
      gsap.utils.toArray<HTMLElement>('[data-digit]').forEach((el, i, all) => {
        const dir = i < all.length / 2 ? -1 : 1
        exit.to(
          el,
          {
            xPercent: dir * 190,
            yPercent: 18,
            rotation: dir * 24,
            scale: 1.1,
            ease: 'power2.in',
          },
          0,
        )
        exit.to(el.querySelector('[data-glyph]'), { opacity: 0, filter: 'blur(16px)', ease: 'power2.in', duration: 0.55 }, 0.45)
        exit.fromTo(
          el.querySelector('[data-stamp]'),
          { opacity: 0, scale: 0.6 },
          { opacity: 1, scale: 1, ease: 'back.out(2)', duration: 0.35 },
          0.05,
        )
        exit.to(el.querySelector('[data-stamp]'), { opacity: 0, duration: 0.25 }, 0.85)
      })
      exit.to('[data-caption]', { opacity: 0, y: 40, ease: 'power1.in', duration: 0.6 }, 0)

      tl.fromTo('[data-caption]', { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.25, ease: 'none' })
    },
    { scope: root },
  )

  return (
    <section ref={root} id="morph" className="relative -mb-[30vh] h-[190vh]" aria-label={t.morph.aria}>
      <div className="sticky top-0 flex h-[100svh] flex-col items-center justify-center px-[var(--gutter)]">
        <Anchor kind="form-vermilion" className="top-[14%] left-[5%] w-[19vw] max-md:top-[8%] max-md:w-[30vw]" par={0.1} />
        <Anchor kind="ring" className="right-[7%] bottom-[16%] w-[14vw] max-md:right-[4%] max-md:bottom-[10%] max-md:w-[26vw]" par={0.2} />
        <Anchor kind="sat-chrome" className="top-[20%] right-[22%] w-[3vw] max-md:hidden" par={0.3} />
        <p className="sr-only">{t.morph.sr}</p>
        <p data-big aria-hidden="true" className="display mb-[6vh] flex text-[clamp(10rem,6rem+22vw,26rem)] leading-none">
          {digits.map((d, i) => (
            <span key={i} data-digit className="relative inline-block will-change-transform">
              <span data-glyph className="inline-block">
                {d}
              </span>
              <span
                data-stamp
                className="sticker absolute top-[14%] left-1/2 -translate-x-1/2 rotate-[-8deg] bg-paper text-[clamp(0.9rem,0.5rem+1.4vw,1.6rem)] text-ink opacity-0"
              >
                {i < digits.length / 2 ? t.deck.nope : t.deck.like}
              </span>
            </span>
          ))}
        </p>
        <div data-caption className="max-w-xl text-center">
          <p className="text-[clamp(1.2rem,0.9rem+0.9vw,1.75rem)] leading-snug tracking-[-0.02em]">{t.morph.line1}</p>
          <p className="mt-3 text-mist">{t.morph.line2}</p>
        </div>
      </div>
    </section>
  )
}
