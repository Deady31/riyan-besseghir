import { useRef } from 'react'
import { gsap, useGSAP, prefersReducedMotion } from '../../lib/motion'
import { useT } from '../../i18n/useT'

/**
 * Transition 3 — nuit prune, glitch VHS / radio, juste avant « Contact ».
 *
 * Une scène de 100 svh est épinglée pendant le défilement : écran prune #2B0F3A, lignes de balayage qui défilent, bruit
 * de bande, un mot (« ON AIR ») qui grésille avec un décalage rouge/bleu (rose et violet de la charte) et des
 * sauts de position, puis le signal se cale, se réduit à un trait lumineux (extinction de tube) et l'écran s'ouvre sur
 * Contact (également prune). Tout est piloté par le scrub : aucun timer, rien ne tourne hors de la scène.
 * Seuls transform et opacity changent. Mouvement réduit : le composant ne rend rien.
 */
const NOISE =
  "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 1  0 0 0 0 .96  0 0 0 0 .9  0 0 0 .55 0'/></filter><rect width='160' height='160' filter='url(%23n)'/></svg>\")"

export function NightOnAir() {
  const root = useRef<HTMLDivElement>(null)
  const t = useT()
  const reduced = prefersReducedMotion()

  useGSAP(
    () => {
      if (reduced || !root.current) return
      const q = (s: string) => root.current!.querySelector<HTMLElement>(s)!
      const word = q('[data-word]')
      const red = q('[data-ghost="r"]')
      const blue = q('[data-ghost="b"]')
      const scan = q('[data-scan]')
      const noise = q('[data-noise]')
      const sub = q('[data-sub]')
      const bar = q('[data-bar]')
      const wrap = q('[data-wrapword]')

      gsap.set([word, red, blue], { opacity: 0 })
      gsap.set(sub, { opacity: 0 })
      gsap.set(bar, { scaleX: 0, opacity: 0 })

      const tl = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: { trigger: root.current, start: 'top top', end: '+=170%', pin: true, scrub: 0.4, invalidateOnRefresh: true },
      })
      // bruit et balayage : dérive continue sur toute la durée
      tl.fromTo(scan, { yPercent: 0 }, { yPercent: -50, duration: 1 }, 0)
      tl.fromTo(noise, { x: 0, y: 0 }, { x: -120, y: 90, duration: 1 }, 0)

      // le mot apparaît par à-coups, avec décalage RVB
      const flicker: [number, number, number, number][] = [
        // [instant, opacité, décalage x (px), décalage y (px)]
        [0.08, 0.5, 14, 2], [0.11, 0, 0, 0], [0.14, 0.9, -18, -3], [0.17, 0.2, 9, 0], [0.2, 1, 22, 4],
        [0.25, 0.4, -12, 0], [0.28, 1, 16, -2], [0.33, 0.6, -24, 3], [0.37, 1, 8, 0], [0.42, 0.35, -16, 2],
        [0.46, 1, 12, 0], [0.5, 0.7, -6, 0], [0.54, 1, 3, 0],
      ]
      flicker.forEach(([at, op, dx, dy]) => {
        tl.set(word, { opacity: op, x: dx * 0.3, y: dy * 0.4 }, at)
        tl.set(red, { opacity: op * 0.9, x: dx, y: dy }, at)
        tl.set(blue, { opacity: op * 0.9, x: -dx * 1.2, y: -dy }, at)
      })
      tl.to(sub, { opacity: 1, duration: 0.1 }, 0.3)
      // signal calé : les fantômes se rejoignent
      tl.to([red, blue], { x: 0, y: 0, opacity: 0.35, duration: 0.12 }, 0.54)
      // extinction de tube : le mot s'écrase en trait, puis tout s'éteint et l'écran s'ouvre sur Contact
      tl.to(wrap, { scaleY: 0.02, duration: 0.14, ease: 'power3.in' }, 0.72)
      tl.to(bar, { scaleX: 1, opacity: 1, duration: 0.1 }, 0.74)
      tl.to(bar, { scaleX: 0, opacity: 0, duration: 0.12 }, 0.88)
      tl.to([scan, noise, sub], { opacity: 0, duration: 0.14 }, 0.82)
      return () => gsap.set([word, red, blue, scan, noise, sub, bar, wrap], { clearProps: 'all' })
    },
    { dependencies: [reduced] },
  )

  if (reduced) return null

  const label = t.night.word
  const glyph = 'display absolute inset-0 grid place-items-center text-[clamp(3.5rem,17vw,15rem)] leading-none font-bold tracking-[0.04em] uppercase'

  return (
    <div ref={root} role="img" aria-label={t.night.aria} className="theme-dark relative z-20 h-[100svh] overflow-hidden isolate bg-[#2B0F3A] [overflow-x:clip]">
      <div data-noise aria-hidden="true" className="absolute -inset-[160px] opacity-[0.14]" style={{ backgroundImage: NOISE }} />
      <div
        data-scan
        aria-hidden="true"
        className="absolute inset-x-0 top-0 h-[200%] opacity-40"
        style={{ backgroundImage: 'repeating-linear-gradient(to bottom, rgba(255,246,229,0.16) 0 1px, transparent 1px 4px)' }}
      />
      <div aria-hidden="true" className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_45%,rgba(20,6,30,0.75)_100%)]" />
      <div data-wrapword aria-hidden="true" className="absolute inset-0 origin-center will-change-transform">
        <span data-ghost="r" className={glyph} style={{ color: '#FF7EC8' }}>{label}</span>
        <span data-ghost="b" className={glyph} style={{ color: '#6C2BFF' }}>{label}</span>
        <span data-word className={glyph} style={{ color: '#FFF6E5' }}>{label}</span>
      </div>
      <div data-bar aria-hidden="true" className="absolute top-1/2 left-[8%] h-[3px] w-[84%] -translate-y-1/2 origin-center bg-[#FFF6E5] shadow-[0_0_18px_4px_rgba(255,126,200,0.7)]" />
      <p data-sub aria-hidden="true" className="label absolute inset-x-0 bottom-[14%] text-center tracking-[0.3em] text-[#EADFFF]">
        {t.night.sub}
      </p>
    </div>
  )
}
