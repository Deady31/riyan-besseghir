import { lazy, Suspense, useEffect, useRef, useState, type ComponentType } from 'react'
import { prefersReducedMotion } from '../../lib/motion'
import { cn } from '../../lib/cn'

/**
 * Un seul fond sur tout le site : la vague de fils fins (Threads, React Bits) vue dans « Je construis. Je le raconte tout
 * haut. ». Violet sur les chapitres crème, lilas sur les nuits prune : même mouvement, même trait, donc une seule identité.
 * Le fond n'est monté que lorsque son chapitre approche de l'écran (un seul canvas par chapitre visible).
 * Mouvement réduit : aucun fond (le papier crème ou la nuit prune restent).
 */


type Preset = { load: () => Promise<{ default: ComponentType<Record<string, unknown>> }>; props: Record<string, unknown>; opacity?: number }
const mod = <T,>(p: Promise<{ default: T }>) => p as unknown as Promise<{ default: ComponentType<Record<string, unknown>> }>

const threads = () => mod(import('../vendor/reactbits/Threads'))
const WAVE = { amplitude: 1.2, distance: 0.3, lineCount: 60, thickness: 0.5, speed: 0.4, angle: 25, seed: 3 }
/** Chapitres crème : fils violets, discrets pour laisser le texte lisible. */
const LIGHT: Preset = { load: threads, props: { ...WAVE, color: [0.42, 0.17, 1], brightness: 1 }, opacity: 0.45 }
/** Nuits prune : mêmes fils, en lilas clair. */
const DARK: Preset = { load: threads, props: { ...WAVE, color: [0.78, 0.68, 1], brightness: 1.1 }, opacity: 0.6 }

export const PRESETS = {
  top: LIGHT,
  deck: LIGHT,
  feats: LIGHT,
  studio: LIGHT,
  demo: LIGHT,
  lab: LIGHT,
  about: LIGHT,
  passions: LIGHT,
  morph: DARK,
  ia: DARK,
  contact: DARK,
  onair: DARK,
} satisfies Record<string, Preset>

export type ChapterBgKind = keyof typeof PRESETS

const lazies = new Map<ChapterBgKind, ComponentType<Record<string, unknown>>>()
const lazyFor = (kind: ChapterBgKind) => {
  let c = lazies.get(kind)
  if (!c) {
    c = lazy(PRESETS[kind].load)
    lazies.set(kind, c)
  }
  return c
}

export function ChapterBg({ kind, className, soft = true }: { kind: ChapterBgKind; className?: string; soft?: boolean }) {
  const ref = useRef<HTMLDivElement>(null)
  const [near, setNear] = useState(false)
  const [reduced] = useState(() => prefersReducedMotion())

  useEffect(() => {
    const el = ref.current
    if (!el || reduced) return
    const io = new IntersectionObserver(([e]) => setNear(e.isIntersecting), { rootMargin: '40% 0px 40% 0px' })
    io.observe(el)
    return () => io.disconnect()
  }, [reduced])

  const preset: Preset = PRESETS[kind]
  const Bg = lazyFor(kind)
  // Le fond s'estompe sur 30vh en haut et 40vh en bas du chapitre : jamais de coupure nette au bord d'une section.
  const mask = !soft ? undefined : 'linear-gradient(to bottom, transparent 0, #000 30vh, #000 calc(100% - 40vh), transparent 100%)'
  return (
    <div
      ref={ref}
      aria-hidden="true"
      data-chapter-bg={kind}
      className={cn('pointer-events-none absolute inset-0 -z-10 [overflow:clip]', className)}
      style={{ opacity: preset.opacity ?? 1, maskImage: mask, WebkitMaskImage: mask }}
    >
      {/* Le canvas a toujours la taille de l'écran et reste collé pendant toute la traversée du chapitre :
          une section de 5 000 px ne crée pas un canvas de 5 000 px. */}
      <div className="sticky top-0 h-[100svh] w-full">
        {near && (
          <Suspense fallback={null}>
            <Bg {...preset.props} />
          </Suspense>
        )}
      </div>
    </div>
  )
}
