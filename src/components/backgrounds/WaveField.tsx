import { lazy, Suspense, useEffect, useRef, useState } from 'react'
import { prefersReducedMotion } from '../../lib/motion'

/**
 * Le seul fond animé du site : la vague de fils fins (Threads, React Bits), posée une fois pour toutes derrière la page
 * et derrière les objets 3D. Un seul canvas pour tout le site. Sa couleur suit le monde qui passe sous la barre de navigation
 * (`html[data-theme]`, posé par BurnBackdrop) : violet sur le papier crème, lilas sur les nuits prune, avec un fondu doux.
 * Mouvement réduit : aucun fond (le papier ou la nuit restent).
 */

const Threads = lazy(() => import('../vendor/reactbits/Threads'))

export type WaveTone = { color: [number, number, number]; opacity: number; brightness: number }
export const WAVE_TONES: Record<'light' | 'dark', WaveTone> = {
  light: { color: [0.42, 0.17, 1], opacity: 0.45, brightness: 1 },
  dark: { color: [0.78, 0.68, 1], opacity: 0.6, brightness: 1.1 },
}
const WAVE = { amplitude: 1.2, distance: 0.3, lineCount: 60, thickness: 0.5, speed: 0.4, angle: 25, seed: 3 }

const mix = (a: number, b: number, t: number) => a + (b - a) * t
const ease = (t: number) => t * t * (3 - 2 * t)

export function WaveField() {
  const [reduced] = useState(() => prefersReducedMotion())
  const [tone, setTone] = useState<WaveTone>(WAVE_TONES.light)
  const current = useRef<WaveTone>(WAVE_TONES.light)
  const raf = useRef(0)

  useEffect(() => {
    if (reduced) return
    const root = document.documentElement
    const target = () => (root.dataset.theme === 'dark' ? WAVE_TONES.dark : WAVE_TONES.light)
    const go = () => {
      cancelAnimationFrame(raf.current)
      const from = current.current
      const to = target()
      if (from === to) return
      const start = performance.now()
      const step = (now: number) => {
        const k = ease(Math.min(1, (now - start) / 700))
        const next: WaveTone = {
          color: [mix(from.color[0], to.color[0], k), mix(from.color[1], to.color[1], k), mix(from.color[2], to.color[2], k)],
          opacity: mix(from.opacity, to.opacity, k),
          brightness: mix(from.brightness, to.brightness, k),
        }
        if (k >= 1) current.current = to
        setTone(k >= 1 ? to : next)
        if (k < 1) raf.current = requestAnimationFrame(step)
      }
      raf.current = requestAnimationFrame(step)
    }
    go()
    const mo = new MutationObserver(go)
    mo.observe(root, { attributes: true, attributeFilter: ['data-theme'] })
    return () => {
      mo.disconnect()
      cancelAnimationFrame(raf.current)
    }
  }, [reduced])

  if (reduced) return null
  return (
    <div aria-hidden="true" data-wave-field className="pointer-events-none fixed inset-0 -z-[4]" style={{ opacity: tone.opacity }}>
      <Suspense fallback={null}>
        <Threads {...WAVE} color={tone.color} brightness={tone.brightness} />
      </Suspense>
    </div>
  )
}
