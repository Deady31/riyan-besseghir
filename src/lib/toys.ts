import { burst } from './burst'
import { cursorBus } from './cursorBus'

/**
 * Les objets 3D sont des jouets : on peut les attraper (souris ou doigt), les déplacer, les lancer, les pousser d'un tap.
 * Ce module porte les corps (position, vitesse, ressorts) et les entrées. La scène 3D (SiteScene) lit et écrit les corps à
 * chaque image ; ici on ne fait que décider qui est sous le doigt et quoi lui faire.
 *
 * Règles :
 *  - un objet du calque avant est toujours attrapable ; un objet du calque arrière seulement là où rien ne le cache
 *    (pas de bloc coloré, de lien, de bouton ni d'image au-dessus) ;
 *  - on n'intercepte que le geste qui commence SUR un objet : le reste de la page défile et clique normalement ;
 *  - un geste sur un objet ne déclenche jamais le clic de l'élément dessous.
 */
export type Body = {
  front: boolean
  seed: number
  /** Centre affiché à l'écran (px) et rayon de prise. */
  x: number
  y: number
  r: number
  visible: boolean
  /** Déplacement par rapport à la place d'origine (px) et vitesse (px/s). */
  dx: number
  dy: number
  vx: number
  vy: number
  /** Cible du centre pendant qu'on tient l'objet. */
  held: boolean
  tx: number
  ty: number
  /** Secondes depuis le dernier contact (le retour à la place d'origine attend un peu). */
  idle: number
  /** Écrasement (ressort) et rotation ajoutée par les chocs. */
  sq: number
  sqv: number
  spinX: number
  spinY: number
  vsx: number
  vsy: number
}

export const bodies = new Set<Body>()
if (import.meta.env.DEV) (window as unknown as { __toys: Set<Body> }).__toys = bodies

export function createBody(front: boolean, seed: number): Body {
  return {
    front, seed, x: -999, y: -999, r: 40, visible: false,
    dx: 0, dy: 0, vx: 0, vy: 0, held: false, tx: 0, ty: 0, idle: 9,
    sq: 0, sqv: 0, spinX: 0, spinY: 0, vsx: 0, vsy: 0,
  }
}

const TOUCH_MIN_R = 34
const BLOCKING = 'a,button,input,textarea,select,summary,label,iframe,video,img,header,[role="button"],[data-no-grab]'

/** Alpha d'une couleur calculée (rgb, rgba ou color(...)) ; 0 si elle est transparente. */
function alphaOf(css: string): number {
  const rgba = css.match(/rgba?\(([^)]+)\)/)
  if (rgba) {
    const p = rgba[1].split(',').map(Number)
    return p.length > 3 ? p[3] : 1
  }
  if (css.startsWith('color(')) {
    const slash = css.split('/')
    return slash.length > 1 ? parseFloat(slash[1]) : 1
  }
  return 0
}

/** Vrai si un élément opaque, interactif ou une image se trouve au-dessus de ce point : un objet du fond y est caché. */
function occludedAt(x: number, y: number): boolean {
  const el = document.elementFromPoint(x, y)
  if (!el) return false
  if (el.closest(BLOCKING)) return true
  for (let n: Element | null = el; n && n.tagName !== 'MAIN' && n !== document.body; n = n.parentElement) {
    const s = getComputedStyle(n)
    if (s.backgroundImage !== 'none') return true
    if (alphaOf(s.backgroundColor) > 0.06) return true
  }
  return false
}

export function pick(x: number, y: number, touch: boolean): Body | null {
  let best: Body | null = null
  let bestScore = Infinity
  for (const b of bodies) {
    if (!b.visible) continue
    const r = touch ? Math.max(b.r * 1.15, TOUCH_MIN_R) : b.r
    const d = Math.hypot(x - b.x, y - b.y)
    if (d > r) continue
    const score = d / r - (b.front ? 2 : 0)
    if (score < bestScore) {
      best = b
      bestScore = score
    }
  }
  if (best && !best.front && occludedAt(x, y)) return null
  return best
}

type Drag = {
  b: Body
  ox: number
  oy: number
  sx: number
  sy: number
  t0: number
  pts: { x: number; y: number; t: number }[]
  touch: boolean
  id: number
}

let drag: Drag | null = null
let lastGesture = -1e9
let users = 0
let remove: (() => void) | null = null

function begin(b: Body, x: number, y: number, touch: boolean, id: number) {
  drag = { b, ox: x - b.x, oy: y - b.y, sx: x, sy: y, t0: performance.now(), pts: [{ x, y, t: performance.now() }], touch, id }
  b.held = true
  b.tx = b.x
  b.ty = b.y
  b.idle = 0
  b.sqv += 3
  cursorBus.dragging = true
  document.body.style.userSelect = 'none'
  burst(x, y, { count: 6, power: 0.45 })
  if (touch) navigator.vibrate?.(8)
}

function move(x: number, y: number) {
  if (!drag) return
  const now = performance.now()
  drag.pts.push({ x, y, t: now })
  if (drag.pts.length > 10) drag.pts.shift()
  // L'objet reste dans l'écran : on ne peut pas le ranger hors de portée.
  const m = Math.min(drag.b.r * 0.5, 80)
  drag.b.tx = Math.max(m, Math.min(window.innerWidth - m, x - drag.ox))
  drag.b.ty = Math.max(m, Math.min(window.innerHeight - m, y - drag.oy))
  drag.b.idle = 0
}

function end(x: number, y: number) {
  const d = drag
  if (!d) return
  drag = null
  const b = d.b
  b.held = false
  b.idle = 0
  cursorBus.dragging = false
  document.body.style.userSelect = ''
  lastGesture = performance.now()
  const moved = Math.hypot(x - d.sx, y - d.sy)
  const elapsed = performance.now() - d.t0
  if (moved < 9 && elapsed < 380) {
    // Un simple tap : l'objet est repoussé à l'opposé du doigt, tourne, et des particules jaillissent.
    let nx = b.x - x
    let ny = b.y - y
    const len = Math.hypot(nx, ny)
    if (len < 6) {
      const a = Math.random() * Math.PI * 2
      nx = Math.cos(a)
      ny = Math.sin(a)
    } else {
      nx /= len
      ny /= len
    }
    b.vx += nx * 600
    b.vy += ny * 600 - 120
    b.vsy += (Math.random() < 0.5 ? -1 : 1) * (5 + Math.random() * 3)
    b.vsx += (Math.random() - 0.5) * 5
    b.sqv += 4.5
    burst(x, y, { count: 18, dirX: nx, dirY: ny })
    return
  }
  // Un lancer : la vitesse vient des derniers 180 ms du geste.
  const now = performance.now()
  const recent = d.pts.filter((p) => now - p.t < 180)
  if (recent.length < 2) {
    // Le doigt s'est arrêté avant de lâcher : l'objet est posé, pas lancé.
    b.vx = 0
    b.vy = 0
    return
  }
  const a = recent[0]
  const z = recent[recent.length - 1]
  const dt = Math.max((z.t - a.t) / 1000, 0.016)
  const cap = (v: number) => Math.max(-2400, Math.min(2400, v))
  b.vx = cap((z.x - a.x) / dt)
  b.vy = cap((z.y - a.y) / dt)
  b.vsy = b.vx * 0.006
  b.vsx = -b.vy * 0.004
  const speed = Math.hypot(b.vx, b.vy)
  if (speed > 500) burst(z.x, z.y, { count: 8, dirX: -b.vx, dirY: -b.vy, power: 0.6 })
}

/** Branche les entrées (souris et tactile). Appelée par chaque scène ; l'écoute n'existe qu'une fois. */
export function useToysInput(): () => void {
  users++
  if (users === 1) {
    const onPointerMove = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return
      if (drag && !drag.touch) move(e.clientX, e.clientY)
      else cursorBus.overGrab = !!pick(e.clientX, e.clientY, false)
    }
    const onPointerDown = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse' || e.button !== 0 || drag) return
      const b = pick(e.clientX, e.clientY, false)
      if (!b) return
      begin(b, e.clientX, e.clientY, false, -1)
      e.preventDefault()
    }
    const onPointerUp = (e: PointerEvent) => {
      if (e.pointerType === 'mouse' && drag && !drag.touch) end(e.clientX, e.clientY)
    }
    const onTouchStart = (e: TouchEvent) => {
      if (drag) return
      const t = e.changedTouches[0]
      const b = t && pick(t.clientX, t.clientY, true)
      if (!b) return
      begin(b, t.clientX, t.clientY, true, t.identifier)
      e.preventDefault()
    }
    const find = (e: TouchEvent) => (drag?.touch ? [...e.changedTouches].find((t) => t.identifier === drag!.id) : undefined)
    const onTouchMove = (e: TouchEvent) => {
      const t = find(e)
      if (!t) return
      move(t.clientX, t.clientY)
      e.preventDefault()
    }
    const onTouchEnd = (e: TouchEvent) => {
      const t = find(e)
      if (t) end(t.clientX, t.clientY)
    }
    // Un geste sur un objet ne doit pas cliquer l'élément qui se trouve dessous.
    const onClick = (e: MouseEvent) => {
      if (performance.now() - lastGesture < 450) {
        e.stopPropagation()
        e.preventDefault()
      }
    }
    const onLeave = () => {
      cursorBus.overGrab = false
    }
    window.addEventListener('pointermove', onPointerMove, { passive: true })
    window.addEventListener('pointerdown', onPointerDown)
    window.addEventListener('pointerup', onPointerUp, { passive: true })
    window.addEventListener('pointercancel', onPointerUp, { passive: true })
    window.addEventListener('touchstart', onTouchStart, { passive: false })
    window.addEventListener('touchmove', onTouchMove, { passive: false })
    window.addEventListener('touchend', onTouchEnd, { passive: true })
    window.addEventListener('touchcancel', onTouchEnd, { passive: true })
    window.addEventListener('click', onClick, true)
    document.documentElement.addEventListener('pointerleave', onLeave)
    remove = () => {
      window.removeEventListener('pointermove', onPointerMove)
      window.removeEventListener('pointerdown', onPointerDown)
      window.removeEventListener('pointerup', onPointerUp)
      window.removeEventListener('pointercancel', onPointerUp)
      window.removeEventListener('touchstart', onTouchStart)
      window.removeEventListener('touchmove', onTouchMove)
      window.removeEventListener('touchend', onTouchEnd)
      window.removeEventListener('touchcancel', onTouchEnd)
      window.removeEventListener('click', onClick, true)
      document.documentElement.removeEventListener('pointerleave', onLeave)
      cursorBus.overGrab = false
      cursorBus.dragging = false
    }
  }
  return () => {
    users--
    if (users === 0) {
      remove?.()
      remove = null
    }
  }
}
