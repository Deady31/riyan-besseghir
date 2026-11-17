import { useRef } from 'react'
import { gsap, useGSAP, prefersReducedMotion } from '../../lib/motion'
import { useT } from '../../i18n/useT'
import { PROJECTS } from '../../data/projects'
import { Anchor } from '../three/Anchor'
import { DepthField } from '../fx/DepthField'
import { ChapterBg } from '../backgrounds/ChapterBg'

/**
 * Le chiffre clé, façon tag de rue : il défile de 0 à 39 en entrant, pendant que son relief (deux calques décalés,
 * violet puis rose) s'épaissit derrière lui ; à la sortie, il fonce vers l'écran et le traverse.
 */
export function MorphMoment() {
  const root = useRef<HTMLElement>(null)
  const t = useT()
  const total = PROJECTS.length

  useGSAP(
    () => {
      if (prefersReducedMotion()) return
      const glyphs = gsap.utils.toArray<HTMLElement>('[data-count]')
      const counter = { n: 0 }
      const paint = () => glyphs.forEach((g) => (g.textContent = String(Math.round(counter.n))))
      paint()

      // Entrée : le compteur monte, le chiffre se redresse et son relief s'épaissit.
      const enter = gsap.timeline({ scrollTrigger: { trigger: root.current, start: 'top 80%', end: 'top 5%', scrub: 0.6 } })
      enter
        .fromTo('[data-big]', { scale: 0.6, rotation: -8, opacity: 0 }, { scale: 1, rotation: -3, opacity: 1, ease: 'back.out(1.6)', duration: 1 }, 0)
        .to(counter, { n: total, ease: 'power2.out', duration: 1, onUpdate: paint }, 0)
        .fromTo('[data-layer="1"]', { x: 0, y: 0 }, { x: 14, y: 14, ease: 'power2.out', duration: 1 }, 0.1)
        .fromTo('[data-layer="2"]', { x: 0, y: 0 }, { x: 28, y: 28, ease: 'power2.out', duration: 1 }, 0.2)
        .fromTo('[data-caption]', { opacity: 0, y: 30 }, { opacity: 1, y: 0, ease: 'power2.out', duration: 0.5 }, 0.5)

      // Sortie sobre : la légende s'efface, le relief se replie sous le chiffre, qui remonte légèrement et disparaît.
      const exit = gsap.timeline({ scrollTrigger: { trigger: root.current, start: 'bottom 165%', end: 'bottom 100%', scrub: 0.4 } })
      exit
        // fromTo + immediateRender:false : sinon la sortie mémorise l'opacité 0 posée par l'entrée et la légende ne s'efface jamais.
        .fromTo('[data-caption]', { opacity: 1, y: 0 }, { opacity: 0, y: -20, ease: 'power1.in', duration: 0.3, immediateRender: false }, 0)
        .to('[data-layer]', { x: 0, y: 0, ease: 'power2.inOut', duration: 0.6 }, 0.1)
        .to('[data-big]', { yPercent: -12, scale: 0.94, rotation: 0, ease: 'power2.in', duration: 0.8 }, 0.2)
        .to('[data-big]', { opacity: 0, ease: 'power1.in', duration: 0.4 }, 0.6)
    },
    { scope: root, dependencies: [total] },
  )

  const layer = (n: string, color: string) => (
    <span data-layer={n} aria-hidden="true" className="absolute inset-0 will-change-transform" style={{ color, WebkitTextStroke: '6px #2B0F3A' }}>
      <span data-count>{total}</span>
    </span>
  )

  return (
    <section ref={root} id="morph" className="theme-dark relative -mb-[30vh] h-[190vh] [overflow-x:clip]" aria-label={t.morph.aria}>
      <div className="sticky top-0 isolate flex h-[100svh] flex-col items-center justify-center px-[var(--gutter)]">
        <ChapterBg kind="morph" soft={false} />
        <Anchor kind="reel" className="top-[7%] left-[3%] w-[21vw] max-md:top-[6%] max-md:w-[36vw]" par={0.1} tilt={0.7} />
        <Anchor kind="camera" className="right-[5%] bottom-[10%] w-[17vw] max-md:right-[2%] max-md:bottom-[8%] max-md:w-[32vw]" par={0.2} tilt={0.7} />
        <DepthField />
        <p className="sr-only">{t.morph.sr}</p>
        <p data-big aria-hidden="true" className="display relative z-10 mb-[5vh] text-[clamp(10rem,6rem+22vw,26rem)] leading-none will-change-transform [paint-order:stroke_fill]">
          {layer('2', '#FF7EC8')}
          {layer('1', '#6C2BFF')}
          <span className="relative block text-ink" style={{ color: '#FFF6E5', WebkitTextStroke: '6px #2B0F3A', paintOrder: 'stroke fill' }}>
            <span data-count>{total}</span>
          </span>
        </p>
        <div data-caption className="relative z-10 max-w-3xl text-center">
          <p className="text-[clamp(1.6rem,1.1rem+1.8vw,3rem)] leading-[1.1] font-bold tracking-[-0.02em] text-[#FFF6E5]">{t.morph.line1}</p>
          <p className="mx-auto mt-4 max-w-2xl text-[clamp(1.1rem,0.95rem+0.5vw,1.45rem)] leading-snug font-medium text-[#D8C8FF]">{t.morph.line2}</p>
        </div>
      </div>
    </section>
  )
}
