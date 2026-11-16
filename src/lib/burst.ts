/**
 * Particules « autocollant » (ronds, étincelles, pastilles) qui jaillissent quand on touche un objet 3D.
 * Le canvas qui les dessine est monté par `BurstCanvas` ; ce module ne contient que l'état et la simulation,
 * ce qui permet de déclencher une explosion depuis n'importe où (`burst(x, y)`).
 */
export type BurstOptions = {
  count?: number
  /** Direction privilégiée (vecteur quelconque) ; sans elle, les particules partent dans tous les sens. */
  dirX?: number
  dirY?: number
  /** Multiplicateur de vitesse. */
  power?: number
}

type Particle = {
  x: number
  y: number
  vx: number
  vy: number
  life: number
  max: number
  size: number
  rot: number
  vrot: number
  shape: 0 | 1 | 2
  color: string
}

const COLORS = ['#254dff', '#f05235', '#d9f05a', '#fff6e0', '#20211f', '#f05235', '#254dff']
const INK = '#20211f'
const particles: Particle[] = []
let wake: (() => void) | null = null
let enabled = true

export function setBurstEnabled(on: boolean) {
  enabled = on
}

export function onBurstWake(fn: (() => void) | null) {
  wake = fn
}

export function burst(x: number, y: number, opts: BurstOptions = {}) {
  if (!enabled) return
  const count = opts.count ?? 14
  const power = opts.power ?? 1
  const hasDir = (opts.dirX ?? 0) !== 0 || (opts.dirY ?? 0) !== 0
  const base = hasDir ? Math.atan2(opts.dirY ?? 0, opts.dirX ?? 0) : 0
  for (let i = 0; i < count; i++) {
    const a = hasDir ? base + (Math.random() - 0.5) * 1.9 : Math.random() * Math.PI * 2
    const sp = (150 + Math.random() * 400) * power
    particles.push({
      x,
      y,
      vx: Math.cos(a) * sp,
      vy: Math.sin(a) * sp - 90,
      life: 0,
      max: 0.7 + Math.random() * 0.6,
      size: 4.6 + Math.random() * 5.6,
      rot: Math.random() * Math.PI,
      vrot: (Math.random() - 0.5) * 12,
      shape: (Math.floor(Math.random() * 3) as 0 | 1 | 2),
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
    })
  }
  if (particles.length > 160) particles.splice(0, particles.length - 160)
  wake?.()
}

/** Avance la simulation ; retourne le nombre de particules vivantes. */
export function stepBurst(dt: number): number {
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i]
    p.life += dt
    if (p.life >= p.max) {
      particles.splice(i, 1)
      continue
    }
    p.vy += 820 * dt
    const drag = Math.exp(-dt * 1.7)
    p.vx *= drag
    p.vy *= drag
    p.x += p.vx * dt
    p.y += p.vy * dt
    p.rot += p.vrot * dt
  }
  return particles.length
}

export function drawBurst(ctx: CanvasRenderingContext2D) {
  for (const p of particles) {
    const k = 1 - p.life / p.max
    const s = p.size * (0.4 + 0.6 * Math.min(1, k * 2.2))
    ctx.save()
    ctx.translate(p.x, p.y)
    ctx.rotate(p.rot)
    ctx.globalAlpha = Math.min(1, k * 2.4)
    ctx.fillStyle = p.color
    ctx.strokeStyle = INK
    ctx.lineWidth = 1.6
    ctx.lineJoin = 'round'
    ctx.beginPath()
    if (p.shape === 0) {
      ctx.arc(0, 0, s, 0, Math.PI * 2)
    } else if (p.shape === 1) {
      const r = s * 1.5
      ctx.moveTo(0, -r)
      ctx.quadraticCurveTo(r * 0.18, -r * 0.18, r, 0)
      ctx.quadraticCurveTo(r * 0.18, r * 0.18, 0, r)
      ctx.quadraticCurveTo(-r * 0.18, r * 0.18, -r, 0)
      ctx.quadraticCurveTo(-r * 0.18, -r * 0.18, 0, -r)
    } else {
      const w = s * 1.7
      const h = s * 0.95
      ctx.roundRect(-w / 2, -h / 2, w, h, h / 2)
    }
    ctx.fill()
    if (p.color !== INK) ctx.stroke()
    ctx.restore()
  }
  ctx.globalAlpha = 1
}
