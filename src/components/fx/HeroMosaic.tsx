import { useMemo, useRef } from 'react'
import { gsap, useGSAP, prefersReducedMotion } from '../../lib/motion'

/**
 * Transition 1 — le portrait se découpe en mosaïque.
 *
 * Une grille de tuiles recouvre exactement le bloc violet et le portrait du hero (chaque tuile contient une copie du bloc,
 * décalée pour n'en montrer que sa part). Au scroll, le hero est épinglé (sans espace ajouté : la section suivante monte
 * dessous) et, en `scrub` :
 *  1. les tuiles prennent leur forme (rond, carré arrondi, demi-lune, quart de rond) et s'écartent un peu ;
 *  2. elles se retournent une à une : le dos est un aplat de la charte (violet, rose, lilas, prune, crème) ;
 *  3. elles s'éparpillent hors de l'écran en tournant, pendant que le texte du hero s'efface : la section suivante
 *     apparaît derrière.
 * Seuls transform, opacity et border-radius changent. Mouvement réduit : rien n'est rendu, le hero reste tel quel.
 */

type Shape = 'square' | 'circle' | 'moonT' | 'moonB' | 'moonL' | 'moonR' | 'quarter'
const RADIUS: Record<Shape, string> = {
  square: '18%',
  circle: '50%',
  moonT: '50% 50% 0 0 / 100% 100% 0 0',
  moonB: '0 0 50% 50% / 0 0 100% 100%',
  moonL: '100% 0 0 100% / 50% 0 0 50%',
  moonR: '0 100% 100% 0 / 0 50% 50% 0',
  quarter: '100% 0 0 0',
}
const SHAPES = Object.keys(RADIUS) as Shape[]
// Dos des tuiles : la charte, sans citron (grande surface cumulée).
const BACKS = ['#6C2BFF', '#FF7EC8', '#EADFFF', '#2B0F3A', '#D8C8FF', '#FFF6E5', '#6C2BFF', '#FF7EC8']

/** Générateur pseudo-aléatoire stable : la mosaïque est la même à chaque visite (et identique côté tests). */
export function mulberry(seed: number) {
  let a = seed
  return () => {
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export type Tile = { col: number; row: number; shape: Shape; back: string; dx: number; dy: number; rot: number; delay: number }

export function makeTiles(cols: number, rows: number, seed = 39): Tile[] {
  const rnd = mulberry(seed)
  const tiles: Tile[] = []
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      // direction d'éparpillement : depuis le centre du bloc, avec du hasard
      const cx = (col + 0.5) / cols - 0.5
      const cy = (row + 0.5) / rows - 0.5
      const ang = Math.atan2(cy + (rnd() - 0.5) * 0.6, cx + (rnd() - 0.5) * 0.6)
      const dist = 70 + rnd() * 70
      tiles.push({
        col,
        row,
        shape: SHAPES[Math.floor(rnd() * SHAPES.length)],
        back: BACKS[Math.floor(rnd() * BACKS.length)],
        dx: Math.cos(ang) * dist,
        dy: Math.sin(ang) * dist - 20,
        rot: (rnd() - 0.5) * 420,
        delay: rnd(),
      })
    }
  }
  return tiles
}

const SLAB_BOX =
  'absolute top-[4.75rem] right-[7%] h-[calc(78%-4.75rem)] w-[34%] max-md:top-36 max-md:right-3 max-md:left-[16%] max-md:h-[36%] max-md:w-auto'

export function HeroMosaic() {
  const root = useRef<HTMLDivElement>(null)
  const mobile = typeof window !== 'undefined' && window.matchMedia('(max-width: 767px)').matches
  const cols = mobile ? 5 : 5
  const rows = mobile ? 4 : 6
  const tiles = useMemo(() => makeTiles(cols, rows), [cols, rows])
  const reduced = prefersReducedMotion()

  useGSAP(
    () => {
      const hero = root.current?.closest('section') as HTMLElement | null
      if (reduced || !hero || !root.current) return
      const els = gsap.utils.toArray<HTMLElement>('[data-tile]', root.current)
      const fronts = gsap.utils.toArray<HTMLElement>('[data-face]', root.current)
      const originals = gsap.utils.toArray<HTMLElement>('[data-slab]', hero)
      const content = gsap.utils.toArray<HTMLElement>('[data-hero-fade]', hero)

      // Échange invisible : au premier pixel de scroll, les tuiles remplacent l'original (même dessin, même place).
      const swap = (on: boolean) => {
        gsap.set(root.current, { autoAlpha: on ? 1 : 0 })
        gsap.set(originals, { autoAlpha: on ? 0 : 1 })
      }

      const tl = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: {
          trigger: hero,
          start: 'top top',
          end: '+=100%',
          pin: true,
          pinSpacing: false,
          scrub: 0.5,
          onUpdate: (self) => swap(self.progress > 0.002),
          onLeaveBack: () => swap(false),
        },
      })

      // 1. découpe : chaque tuile prend sa forme et se resserre (les joints apparaissent)
      tiles.forEach((tile, i) => {
        tl.to(fronts[i * 2], { borderRadius: RADIUS[tile.shape], duration: 0.18 }, 0.02 + tile.delay * 0.06)
        tl.to(fronts[i * 2 + 1], { borderRadius: RADIUS[tile.shape], duration: 0.18 }, 0.02 + tile.delay * 0.06)
        tl.to(els[i], { scale: 0.88, duration: 0.18 }, 0.02 + tile.delay * 0.06)
      })
      // 2. retournement : le dos coloré apparaît
      tiles.forEach((tile, i) => {
        tl.to(els[i], { rotationY: 180, duration: 0.2, ease: 'power2.inOut' }, 0.2 + tile.delay * 0.22)
      })
      // 3. éparpillement hors de l'écran, pendant que le texte du hero s'efface
      tiles.forEach((tile, i) => {
        tl.to(
          els[i],
          {
            xPercent: tile.dx * 6,
            yPercent: tile.dy * 6,
            rotation: tile.rot,
            scale: 0.5 + tile.delay * 0.9,
            duration: 0.42,
            ease: 'power2.in',
          },
          0.5 + tile.delay * 0.1,
        )
      })
      tl.to(content, { autoAlpha: 0, y: -40, duration: 0.2, ease: 'power1.in', stagger: 0.02 }, 0.22)

      return () => swap(false)
    },
    { dependencies: [tiles, reduced] },
  )

  if (reduced) return null

  return (
    <div ref={root} aria-hidden="true" className={`pointer-events-none invisible z-[6] opacity-0 ${SLAB_BOX}`} style={{ perspective: '900px' }}>
      {tiles.map((tile, i) => (
        <div
          key={i}
          data-tile
          className="absolute will-change-transform [transform-style:preserve-3d]"
          style={{ left: `${(tile.col / cols) * 100}%`, top: `${(tile.row / rows) * 100}%`, width: `${100 / cols}%`, height: `${100 / rows}%` }}
        >
          {/* face : la part du bloc violet + portrait */}
          <div data-face className="absolute inset-0 overflow-hidden [backface-visibility:hidden]">
            <div
              className="absolute"
              style={{ left: `${-tile.col * 100}%`, top: `${-tile.row * 100}%`, width: `${cols * 100}%`, height: `${rows * 100}%` }}
            >
              <div className="absolute inset-0 rounded-[56px] bg-signal max-md:rounded-[40px]" />
              <div
                className="absolute top-[2%] left-1/2 aspect-[900/1059] h-[92%] -translate-x-1/2"
                style={{ maskImage: 'linear-gradient(to bottom, #000 82%, transparent 100%)', WebkitMaskImage: 'linear-gradient(to bottom, #000 82%, transparent 100%)' }}
              >
                <img src="/media/portrait/naturel.webp" alt="" width={900} height={1059} decoding="async" draggable={false} className="size-full select-none" />
              </div>
            </div>
          </div>
          {/* dos : un aplat de la charte, contour prune façon autocollant */}
          <div
            data-face
            className="absolute inset-0 border-[3px] border-[#2B0F3A] [backface-visibility:hidden]"
            style={{ background: tile.back, transform: 'rotateY(180deg)' }}
          />
        </div>
      ))}
    </div>
  )
}
