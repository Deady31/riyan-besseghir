import { useEffect, useMemo, useRef } from 'react'
import depth from '../../data/depth.json'
import { prefersReducedMotion } from '../../lib/motion'

/**
 * Champ de profondeur (inspiré du composant « Depth Field » de ReactDrops) : les captures de mes projets naissent au
 * loin, grossissent en tournant autour du centre et passent devant, comme si on volait à travers elles.
 *  - le centre reste libre (le chiffre et sa légende restent lisibles) ;
 *  - une impulsion d'entrée accélère tout quand le chapitre apparaît, puis le flux retombe en dérive lente ;
 *  - défiler la page donne une brève poussée vers l'avant ;
 *  - mouvement réduit : composition fixe, sans boucle.
 * Ressources : vignettes de 10 à 25 Ko (scripts/make-depth-thumbs.mjs), 9 cartes sur ordinateur et 5 sur mobile ;
 * la boucle ne tourne que lorsque le chapitre est à l'écran et l'onglet visible ; seuls transform et opacity changent.
 */
type Item = { id: string; w: number; h: number }
const ITEMS = depth as Item[]

type Card = { angle: number; radius: number; z: number; mul: number }

const smooth = (a: number, b: number, x: number) => {
  const t = Math.max(0, Math.min(1, (x - a) / (b - a)))
  return t * t * (3 - 2 * t)
}
const spawn = (c: Card, z: number) => {
  c.angle = Math.random() * Math.PI * 2
  c.radius = 0.35 + Math.random() * 0.65
  c.z = z
  c.mul = 0.8 + Math.random() * 0.5
}

export function DepthField({ className }: { className?: string }) {
  const root = useRef<HTMLDivElement>(null)
  const mobile = typeof window !== 'undefined' && window.matchMedia('(max-width: 767px)').matches
  const count = Math.min(ITEMS.length, mobile ? 5 : 9)
  const picked = useMemo(() => [...ITEMS].sort(() => Math.random() - 0.5).slice(0, count), [count])

  useEffect(() => {
    const el = root.current
    if (!el) return
    const nodes = [...el.children] as HTMLElement[]
    const cards: Card[] = nodes.map((_, i) => {
      const c = { angle: 0, radius: 0, z: 0, mul: 1 }
      // la première carte est déjà en route ; les suivantes attendent leur tour, une toutes les 2 ou 3 secondes
      spawn(c, 0.3 - (i / nodes.length) * 1.05)
      return c
    })
    const reduced = prefersReducedMotion()
    let w = 0
    let h = 0
    const measure = () => {
      const r = el.getBoundingClientRect()
      w = r.width
      h = r.height
    }
    measure()
    const ro = new ResizeObserver(() => {
      measure()
      if (reduced) draw(0)
    })
    ro.observe(el)

    const base = (i: number) => (picked[i].w >= picked[i].h ? 1 : 0.78)
    // Place chaque carte : projection simple, rotation uniforme (l'orbite reste circulaire quelle que soit la forme de l'écran).
    const draw = (rot: number) => {
      const vmin = Math.min(w, h)
      const cx = w / 2
      const cy = h / 2
      for (let i = 0; i < nodes.length; i++) {
        const c = cards[i]
        const g = Math.pow(Math.max(0, c.z), 1.8)
        const R = c.radius * vmin * (0.12 + 1.5 * g)
        const th = c.angle + rot
        const width = picked[i].w
        const sc = (vmin * 0.15 * base(i) * (0.1 + 2.0 * g)) / width
        const x = cx + Math.cos(th) * R
        const y = cy + Math.sin(th) * R
        // le centre se dégage, les cartes naissent et s'éteignent en douceur
        const alpha = smooth(0, 0.16, c.z) * (1 - smooth(0.9, 1, c.z)) * smooth(0.1 * vmin, 0.3 * vmin, R)
        const n = nodes[i]
        n.style.transform = `translate3d(${(x - width / 2).toFixed(1)}px, ${(y - picked[i].h / 2).toFixed(1)}px, 0) scale(${sc.toFixed(3)})`
        n.style.opacity = alpha.toFixed(3)
        n.style.zIndex = String(Math.floor(c.z * 100))
      }
    }

    if (reduced) {
      // composition fixe : quelques cartes posées à des profondeurs différentes
      cards.forEach((c, i) => spawn(c, 0.35 + (i / nodes.length) * 0.5))
      draw(0)
      return () => ro.disconnect()
    }

    let raf = 0
    let last = 0
    let rot = 0
    let boost = 0
    let lastScroll = window.scrollY
    let visible = false
    let entryAt = -1
    const tick = (now: number) => {
      if (!visible || document.hidden) {
        raf = 0
        return
      }
      const dt = Math.min((now - (last || now)) / 1000, 0.05)
      last = now
      // impulsion d'entrée : forte au début, retombe en 2,8 s
      const burst = entryAt < 0 ? 0 : 7 * Math.pow(Math.max(0, 1 - (now - entryAt) / 3600), 2)
      const sy = window.scrollY
      boost += (Math.min(12, (Math.abs(sy - lastScroll) / Math.max(dt, 0.001)) * 0.006) - boost) * 0.1
      lastScroll = sy
      const speed = 0.042 + (burst + boost) * 0.008
      rot += ((5 * Math.PI) / 180) * dt * (1 + burst * 0.03)
      for (const c of cards) {
        c.z += speed * dt * c.mul
        if (c.z >= 1) spawn(c, c.z - 1)
      }
      draw(rot)
      raf = requestAnimationFrame(tick)
    }
    const start = () => {
      if (!raf && visible && !document.hidden) {
        last = 0
        raf = requestAnimationFrame(tick)
      }
    }
    const io = new IntersectionObserver(
      ([e]) => {
        visible = e.isIntersecting
        if (visible && entryAt < 0) entryAt = performance.now()
        start()
      },
      { threshold: 0.15 },
    )
    io.observe(el)
    document.addEventListener('visibilitychange', start)
    return () => {
      cancelAnimationFrame(raf)
      io.disconnect()
      ro.disconnect()
      document.removeEventListener('visibilitychange', start)
    }
  }, [picked])

  return (
    <div ref={root} aria-hidden="true" className={`pointer-events-none absolute inset-0 isolate overflow-hidden ${className ?? ''}`}>
      {picked.map((it) => (
        <div
          key={it.id}
          className="absolute top-0 left-0 overflow-hidden rounded-[16px] border-[3px] border-[#FFF6E5] bg-[#FFF6E5] opacity-0 shadow-[0_8px_0_rgb(5_10_58/0.4)] will-change-transform"
          style={{ width: it.w, height: it.h, transformOrigin: 'center' }}
        >
          <img src={`/media/depth/${it.id}.webp`} alt="" width={it.w} height={it.h} loading="lazy" decoding="async" draggable={false} className="size-full object-cover" />
        </div>
      ))}
    </div>
  )
}
