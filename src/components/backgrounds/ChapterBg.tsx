import { lazy, Suspense, useEffect, useRef, useState, type ComponentType } from 'react'
import { gsap, prefersReducedMotion } from '../../lib/motion'
import { cn } from '../../lib/cn'

/**
 * Un fond animé par chapitre (React Bits). Chaque fond est un module à part, chargé seulement quand son chapitre
 * approche de l'écran et démonté quand il s'éloigne : un ou deux contextes WebGL vivent à la fois, jamais douze.
 * Chaque fond entre par une vraie révélation au défilement (iris, rideau, balayage, coin) : le passage d'un chapitre
 * à l'autre se voit, au lieu d'un fondu.
 * Mouvement réduit : aucun fond (le papier crème ou la nuit prune restent).
 */

const CREAM = '#FFF6E5'
const PLUM = '#2B0F3A'
const VIOLET = '#6C2BFF'
const PINK = '#FF7EC8'
const LILAC = '#EADFFF'

type Preset = { load: () => Promise<{ default: ComponentType<Record<string, unknown>> }>; props: Record<string, unknown>; opacity?: number }

const mod = <T,>(p: Promise<{ default: T }>) => p as unknown as Promise<{ default: ComponentType<Record<string, unknown>> }>

export const PRESETS = {
  // Hero : grille de points élastiques, lilas, qui virent au violet sous le curseur.
  top: {
    load: () => mod(import('../vendor/reactbits/DotGrid')),
    props: { dotSize: 4, gap: 26, baseColor: '#E4D6F7', activeColor: VIOLET, proximity: 150, glow: 0.3, intro: true },
  },
  // Le 39 : métal en fusion violet → rose, cœurs crème.
  morph: {
    load: () => mod(import('../vendor/reactbits/MoltenMetal')),
    props: { colors: [VIOLET, PINK], coreColor: CREAM, speed: 0.3, scale: 3.4, detail: 3.5, glow: 2.4, thickness: 1.2, haze: 0.9, brightness: 1.7, grain: 0.04, drift: 0.2 },
  },
  // Le deck : dégradé granuleux crème, lilas et rose, qu'on remue au curseur.
  deck: {
    load: () => mod(import('../vendor/reactbits/Grainient')),
    props: { colors: [CREAM, LILAC, '#FFD9EE', LILAC, CREAM], lightMode: true, speed: 0.5, grainAmount: 0.06, contrast: 0.9, saturation: 0.9 },
  },
  // Hauts faits : grille de formes qui s'allument sous le curseur.
  feats: {
    load: () => mod(import('../vendor/reactbits/ShapeGrid')),
    props: { shape: 'circle', cellSize: 46, lineColor: '#E6D7F2', hoverColor: VIOLET, hoverFillColor: PINK, fillOpacity: 0.25, speed: 0.35, glow: 0.2 },
  },
  // Builder : fils violets qui ondulent.
  studio: {
    load: () => mod(import('../vendor/reactbits/Threads')),
    props: { color: [0.42, 0.17, 1], amplitude: 1.2, distance: 0.3, lineCount: 60, thickness: 0.5, speed: 0.4, brightness: 1 },
    opacity: 0.45,
  },
  // Démo FOODER : liquide qu'on remue, violet, rose, lilas.
  demo: {
    load: () => mod(import('../vendor/reactbits/LiquidEther')),
    props: { colors: [VIOLET, PINK, LILAC], lightMode: true, autoDemo: true, autoSpeed: 0.35, autoIntensity: 1.6, resolution: 0.4 },
    opacity: 0.55,
  },
  // IA : terminal défaillant, glyphes lilas sur nuit prune.
  ia: {
    load: () => mod(import('../vendor/reactbits/FaultyTerminal')),
    props: { tint: '#B79CFF', brightness: 0.55, glyphs: 'characters', scale: 1.4, timeScale: 0.25, curvature: 0.1, vignette: 0.5, glitchAmount: 0.6 },
    opacity: 0.55,
  },
  // Index des 39 projets : nuages de pixels tramés.
  lab: {
    load: () => mod(import('../vendor/reactbits/PixelBlast')),
    props: { variant: 'circle', pixelSize: 4, color: '#B59BFF', accentColor: PINK, lightMode: true, patternScale: 2.5, speed: 0.35, edgeFade: 0.4 },
    opacity: 0.6,
  },
  // À propos : soie lilas.
  about: {
    load: () => mod(import('../vendor/reactbits/Silk')),
    props: { color: '#D9C6FF', sheenColor: '#FFF6E5', lightMode: true, speed: 3, scale: 1.1, noiseIntensity: 1, sheen: 0.5 },
    opacity: 0.45,
  },
  // Passions (jeu vidéo) : la peinture tourbillonnante de Balatro, aux couleurs de la charte.
  passions: {
    load: () => mod(import('../vendor/reactbits/Balatro')),
    props: { color1: VIOLET, color2: PINK, color3: CREAM, lightMode: true, pixelSize: 3, contrast: 2.6, speed: 0.6, opacity: 1 },
    opacity: 0.32,
  },
  // Contact : rayons de lumière lilas depuis le haut, sur la nuit prune.
  contact: {
    load: () => mod(import('../vendor/reactbits/LightRays')),
    props: { raysOrigin: 'top-center', raysColor: '#C9B2FF', raysSpeed: 0.6, lightSpread: 0.7, rayLength: 2.2, intensity: 0.8, followMouse: true },
  },
  // Transition avant Impact : mur de tuiles holographiques violettes.
  holo: {
    load: () => mod(import('../vendor/reactbits/HoloMosaic')),
    props: { color: '#7e3fe4', metalColor: '#e8ebf1', spectrum: 'full', tileSize: 1, gap: 0.08, scatter: 0.3, tilt: 0.35, saturation: 0.1, intensity: 1.25, ripple: 0.6, glitter: 0.85, sheen: 0.8, grain: 0.08, speed: 0.5 },
  },
  // ON AIR : plasma sur écran cathodique, violet sur prune.
  onair: {
    load: () => mod(import('../vendor/reactbits/CRTWarp')),
    props: { color: VIOLET, backgroundColor: PLUM, speed: 0.4, columns: 70, bloom: 1.2, noise: 0.12, flicker: 0.2 },
    opacity: 0.7,
  },
} satisfies Record<string, Preset>

export type ChapterBgKind = keyof typeof PRESETS

/** Formes de révélation (clip-path de départ → d'arrivée), attribuées chapitre par chapitre pour varier les entrées. */
const REVEALS = {
  iris: ['circle(0% at 50% 100%)', 'circle(150% at 50% 100%)'],
  curtain: ['inset(100% 0% 0% 0%)', 'inset(0% 0% 0% 0%)'],
  sweep: ['inset(0% 100% 0% 0%)', 'inset(0% 0% 0% 0%)'],
  corner: ['circle(0% at 0% 0%)', 'circle(145% at 0% 0%)'],
} as const
const REVEAL_OF: Partial<Record<ChapterBgKind, keyof typeof REVEALS>> = {
  deck: 'iris', feats: 'sweep', studio: 'curtain', demo: 'corner', ia: 'iris', lab: 'sweep', about: 'curtain', passions: 'corner', contact: 'iris',
}

const lazies = new Map<ChapterBgKind, ComponentType<Record<string, unknown>>>()
const lazyFor = (kind: ChapterBgKind) => {
  let c = lazies.get(kind)
  if (!c) {
    c = lazy(PRESETS[kind].load)
    lazies.set(kind, c)
  }
  return c
}

export function ChapterBg({ kind, className, fade = false }: { kind: ChapterBgKind; className?: string; fade?: boolean }) {
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

  // Révélation pilotée par le défilement : le fond s'ouvre pendant que le haut du chapitre monte dans l'écran.
  useEffect(() => {
    const el = ref.current
    const stage = el?.firstElementChild as HTMLElement | null
    const shape = REVEAL_OF[kind]
    if (!el || !stage || !shape || reduced) return
    const [from, to] = REVEALS[shape]
    const tw = gsap.fromTo(
      stage,
      { clipPath: from, scale: 1.12 },
      { clipPath: to, scale: 1, ease: 'power2.out', scrollTrigger: { trigger: el, start: 'top 95%', end: 'top 15%', scrub: 0.6 } },
    )
    return () => {
      tw.scrollTrigger?.kill()
      tw.kill()
      gsap.set(stage, { clearProps: 'clipPath,transform' })
    }
  }, [kind, reduced])

  const preset: Preset = PRESETS[kind]
  const Bg = lazyFor(kind)
  const mask = fade ? 'linear-gradient(to bottom, transparent 0, #000 14%, #000 86%, transparent 100%)' : undefined
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
      <div className="sticky top-0 h-[100svh] w-full origin-center will-change-[clip-path]">
        {near && (
          <Suspense fallback={null}>
            <Bg {...preset.props} />
          </Suspense>
        )}
      </div>
    </div>
  )
}
