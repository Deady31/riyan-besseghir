import { useMemo, useRef } from 'react'
import { gsap, useGSAP, prefersReducedMotion } from '../../lib/motion'
import { mulberry } from './HeroMosaic'

/**
 * Transition 2 — coup de bombe de peinture violette (Jet Set Radio).
 *
 * Un calque plein écran, fixe et sans interaction, n'existe à l'écran que pendant la traversée du repère (avant « Impact »).
 * En `scrub` : l'aplat #6C2BFF descend depuis le haut, son bord inférieur frangé de coulures de longueurs différentes ;
 * il couvre l'écran (éclaboussures rose et prune, contour prune), puis glisse vers le bas et révèle la section, son bord
 * supérieur étant lui aussi irrégulier. Seuls transform et opacity changent. Mouvement réduit : le repère ne rend rien.
 */

export type Drip = { left: number; width: number; length: number; grow: number }
export type Blob = { x: number; y: number; size: number; color: string }

export function makeDrips(count: number, seed = 7): Drip[] {
  const rnd = mulberry(seed)
  const drips: Drip[] = []
  let x = -2
  for (let i = 0; i < count; i++) {
    const width = 3 + rnd() * 6
    drips.push({ left: x, width, length: 6 + rnd() * rnd() * 46, grow: rnd() })
    x += width * 0.7 + rnd() * 2
    if (x > 100) break
  }
  return drips
}

export function makeBlobs(count: number, seed = 11): Blob[] {
  const rnd = mulberry(seed)
  const colors = ['#FF7EC8', '#2B0F3A', '#D8C8FF', '#FF7EC8']
  return Array.from({ length: count }, () => ({ x: rnd() * 100, y: 8 + rnd() * 84, size: 1.5 + rnd() * 5, color: colors[Math.floor(rnd() * colors.length)] }))
}

const PAINT = '#6C2BFF'
const INK = '#2B0F3A'

export function PaintSplash({ trigger }: { trigger: string }) {
  const stage = useRef<HTMLDivElement>(null)
  const reduced = prefersReducedMotion()
  const drips = useMemo(() => makeDrips(22), [])
  const tops = useMemo(() => makeDrips(18, 23), [])
  const blobs = useMemo(() => makeBlobs(14), [])

  useGSAP(
    () => {
      const el = document.querySelector(trigger)
      if (reduced || !el || !stage.current) return
      const body = stage.current.querySelector<HTMLElement>('[data-body]')!
      const dripEls = gsap.utils.toArray<HTMLElement>('[data-drip]', stage.current)
      const blobEls = gsap.utils.toArray<HTMLElement>('[data-blob]', stage.current)
      gsap.set(stage.current, { autoAlpha: 0 })
      gsap.set(body, { yPercent: -100 })
      gsap.set(dripEls, { scaleY: 0.15 })
      gsap.set(blobEls, { scale: 0 })

      const tl = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: {
          trigger: el,
          start: 'top 100%',
          end: () => '+=' + Math.round(window.innerHeight * 1.5),
          invalidateOnRefresh: true,
          scrub: 0.5,
          onToggle: (self) => gsap.set(stage.current, { autoAlpha: self.isActive ? 1 : 0 }),
        },
      })
      // 1. le jet : l'aplat descend, les coulures s'allongent en retard
      tl.to(body, { yPercent: 0, duration: 0.4, ease: 'power3.in' }, 0)
      dripEls.forEach((d, i) => tl.to(d, { scaleY: 1, duration: 0.3, ease: 'power2.out' }, 0.2 + drips[i].grow * 0.15))
      // 2. l'éclaboussure : des taches claquent sur l'aplat pendant qu'il tient l'écran
      blobEls.forEach((b, i) => tl.to(b, { scale: 1, duration: 0.08, ease: 'back.out(3)' }, 0.42 + (i / blobEls.length) * 0.16))
      // 3. la retraite : tout glisse vers le bas et libère la section
      tl.to(body, { yPercent: 108, duration: 0.4, ease: 'power2.inOut' }, 0.62)
      return () => {
        gsap.set(stage.current, { clearProps: 'all' })
      }
    },
    { dependencies: [trigger, reduced] },
  )

  if (reduced) return null

  return (
    <div ref={stage} aria-hidden="true" className="pointer-events-none invisible fixed inset-0 z-[55] overflow-hidden">
      <div data-body className="absolute inset-0 will-change-transform" style={{ background: PAINT }}>
        {/* bord supérieur irrégulier : gouttes retournées qui mordent sur la section révélée */}
        {tops.map((d, i) => (
          <span
            key={`t${i}`}
            className="absolute bottom-full"
            style={{ left: `${d.left}%`, width: `${d.width}vw`, height: `${d.length * 0.35 + 3}vh`, background: PAINT, borderRadius: '50% 50% 0 0 / 40% 40% 0 0', marginBottom: '-1px' }}
          />
        ))}
        {/* coulures : colonnes à bout rond qui pendent sous le bord inférieur */}
        {drips.map((d, i) => (
          <span
            key={`d${i}`}
            data-drip
            className="absolute top-full origin-top"
            style={{ left: `${d.left}%`, width: `${d.width}vw`, height: `${d.length}vh`, background: PAINT, borderRadius: '0 0 999px 999px', marginTop: '-1px' }}
          />
        ))}
        {blobs.map((b, i) => (
          <span
            key={`b${i}`}
            data-blob
            className="absolute rounded-full"
            style={{ left: `${b.x}%`, top: `${b.y}%`, width: `${b.size}vw`, height: `${b.size}vw`, background: b.color, border: `3px solid ${INK}` }}
          />
        ))}
      </div>
    </div>
  )
}
