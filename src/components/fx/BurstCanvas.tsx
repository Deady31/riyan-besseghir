import { useEffect, useRef } from 'react'
import { drawBurst, onBurstWake, setBurstEnabled, stepBurst } from '../../lib/burst'
import { prefersReducedMotion } from '../../lib/motion'

/** Canvas plein écran des particules (voir lib/burst.ts). Il ne tourne que tant qu'il reste des particules. */
export function BurstCanvas() {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = ref.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return
    setBurstEnabled(!prefersReducedMotion())
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5)
    const resize = () => {
      canvas.width = Math.round(window.innerWidth * dpr)
      canvas.height = Math.round(window.innerHeight * dpr)
    }
    resize()
    window.addEventListener('resize', resize)

    let raf = 0
    let last = 0
    const loop = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.04)
      last = now
      const alive = stepBurst(dt)
      ctx.setTransform(1, 0, 0, 1, 0, 0)
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      if (alive > 0) {
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
        drawBurst(ctx)
        raf = requestAnimationFrame(loop)
      } else {
        raf = 0
      }
    }
    onBurstWake(() => {
      if (!raf) {
        last = performance.now()
        raf = requestAnimationFrame(loop)
      }
    })
    return () => {
      onBurstWake(null)
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return <canvas ref={ref} aria-hidden="true" className="pointer-events-none fixed inset-0 z-[41] size-full" />
}
