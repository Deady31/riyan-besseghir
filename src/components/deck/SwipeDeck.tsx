import { useCallback, useMemo, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react'
import { Heart, RotateCcw, X } from 'lucide-react'
import { gsap, prefersReducedMotion } from '../../lib/motion'
import type { Project } from '../../data/projects'
import { useProjects } from '../../i18n/useProjects'
import { TitleParts, useT } from '../../i18n/useT'
import { SectionHeading } from '../ui/SectionHeading'
import { useOpenProject } from '../lab/ProjectDialog'
import { cn } from '../../lib/cn'
import { AfkSkater } from './AfkSkater'

const DECK_IDS = ['fooder', 'chatbot-cv', 'finger', 'departs', 'lio', 'one-piece', 'derniere-note', 'ps2-skater'] as const

/** Fond de carte par projet : la palette pop tourne pour que chaque carte ait sa couleur. */
const CARD_TINTS = ['bg-bubblegum', 'bg-lemon', 'bg-mint', 'bg-signal-soft', 'bg-tangerine'] as const

const THRESHOLD = 110
const TAP_TOLERANCE = 6

type Drag = { id: number; x0: number; y0: number; dx: number; dy: number }

function DeckCard({ project, tint, depth }: { project: Project; tint: string; depth: number }) {
  const t = useT()
  const shot = project.shots[0]
  const mobile = shot?.frame === 'mobile'
  return (
    <div
      className="absolute inset-0 flex flex-col overflow-hidden rounded-[28px] border border-line bg-graphite shadow-[var(--shadow-card)]"
      style={{
        transform: `translateY(${depth * 14}px) scale(${1 - depth * 0.05}) rotate(${depth === 0 ? 0 : depth % 2 ? 3 : -3}deg)`,
      }}
    >
      <div className={cn('relative min-h-0 flex-1 overflow-hidden border-b border-line', tint)}>
        {shot && (
          <img
            src={shot.src}
            alt=""
            draggable={false}
            loading={depth < 2 ? 'eager' : 'lazy'}
            className={cn(
              'pointer-events-none select-none',
              mobile
                ? 'absolute top-6 left-1/2 w-[46%] -translate-x-1/2 rounded-[18px] border border-line shadow-[var(--shadow-card)]'
                : 'size-full object-cover object-top',
            )}
          />
        )}
        <div className="absolute top-4 left-4 flex flex-wrap gap-2">
          <span className="sticker bg-graphite">{project.status}</span>
          {project.highlight && <span className="sticker -rotate-3 bg-lemon">{project.highlight}</span>}
        </div>
        <span data-stamp="like" className="deck-stamp left-5 -rotate-12 border-mint text-mint">
          {t.deck.like}
        </span>
        <span data-stamp="nope" className="deck-stamp right-5 rotate-12 border-vermilion text-vermilion">
          {t.deck.nope}
        </span>
      </div>
      <div className="shrink-0 p-5 md:p-6">
        <h3 className="display text-[clamp(1.9rem,1.4rem+1.6vw,2.6rem)]">{project.title}</h3>
        <p className="mt-2 line-clamp-2 text-[15px] leading-snug text-mist">{project.tagline}</p>
      </div>
    </div>
  )
}

export function SwipeDeck() {
  const t = useT()
  const { byId } = useProjects()
  const open = useOpenProject()
  const deck = useMemo(() => DECK_IDS.map((id) => byId(id)).filter((p): p is Project => Boolean(p)), [byId])
  const [index, setIndex] = useState(0)
  const [kept, setKept] = useState<Project[]>([])
  const topRef = useRef<HTMLDivElement>(null)
  const drag = useRef<Drag | null>(null)
  const busy = useRef(false)

  const current = deck[index]
  const done = index >= deck.length

  const paintStamps = useCallback((dx: number) => {
    const el = topRef.current
    if (!el) return
    const like = el.querySelector<HTMLElement>('[data-stamp="like"]')
    const nope = el.querySelector<HTMLElement>('[data-stamp="nope"]')
    if (like) like.style.opacity = String(Math.min(Math.max(dx / THRESHOLD, 0), 1))
    if (nope) nope.style.opacity = String(Math.min(Math.max(-dx / THRESHOLD, 0), 1))
  }, [])

  const decide = useCallback(
    (dir: 1 | -1) => {
      const el = topRef.current
      if (!current || !el || busy.current) return
      busy.current = true
      if (dir === 1) setKept((k) => (k.some((p) => p.id === current.id) ? k : [...k, current]))
      const finish = () => {
        busy.current = false
        setIndex((i) => i + 1)
      }
      if (prefersReducedMotion()) {
        finish()
        return
      }
      paintStamps(dir * THRESHOLD)
      gsap.to(el, {
        x: dir * window.innerWidth * 0.9,
        y: '+=40',
        rotation: dir * 28,
        duration: 0.45,
        ease: 'power2.in',
        onComplete: finish,
      })
    },
    [current, paintStamps],
  )

  const onPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (busy.current) return
    e.currentTarget.setPointerCapture(e.pointerId)
    drag.current = { id: e.pointerId, x0: e.clientX, y0: e.clientY, dx: 0, dy: 0 }
  }

  const onPointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    const d = drag.current
    const el = topRef.current
    if (!d || d.id !== e.pointerId || !el) return
    d.dx = e.clientX - d.x0
    d.dy = e.clientY - d.y0
    gsap.set(el, { x: d.dx, y: d.dy * 0.3, rotation: d.dx * 0.06 })
    paintStamps(d.dx)
  }

  const onPointerUp = (e: ReactPointerEvent<HTMLDivElement>) => {
    const d = drag.current
    const el = topRef.current
    drag.current = null
    if (!d || d.id !== e.pointerId || !el) return
    if (Math.abs(d.dx) < TAP_TOLERANCE && Math.abs(d.dy) < TAP_TOLERANCE) {
      if (current) open(current)
      return
    }
    if (Math.abs(d.dx) > THRESHOLD) {
      decide(d.dx > 0 ? 1 : -1)
      return
    }
    gsap.to(el, { x: 0, y: 0, rotation: 0, duration: 0.6, ease: 'elastic.out(1, 0.55)' })
    paintStamps(0)
  }

  const restart = () => {
    setIndex(0)
    setKept([])
  }

  return (
    <section id="deck" className="relative overflow-hidden px-[var(--gutter)] py-28 md:py-40" aria-label={t.deck.label}>
      <SectionHeading index="00" label={t.deck.label} title={<TitleParts parts={t.deck.title} />} intro={t.deck.intro} />

      <div className="grid items-start gap-14 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
        <div
          className="relative mx-auto aspect-[4/5] w-full max-w-[420px]"
          role="group"
          aria-roledescription="deck"
          aria-label={done ? t.deck.done : t.deck.count(index + 1, deck.length)}
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'ArrowRight') decide(1)
            if (e.key === 'ArrowLeft') decide(-1)
            if (e.key === 'Enter' && current) open(current)
          }}
        >
          {done ? (
            <div className="absolute inset-0 grid place-items-center rounded-[28px] border-[3px] border-dashed border-line bg-lemon p-6 text-center">
              <div>
                <AfkSkater bubble={t.deck.afk} />
                <p className="display mt-2 text-4xl">{t.deck.done}</p>
                <p className="mt-4 text-lg">{t.deck.kept(kept.length)}</p>
                <button type="button" onClick={restart} className="pop mt-8 inline-flex items-center gap-2 rounded-full bg-signal px-6 py-3 font-bold text-ink">
                  <RotateCcw className="size-4" aria-hidden="true" />
                  {t.deck.restart}
                </button>
              </div>
            </div>
          ) : (
            deck
              .slice(index, index + 3)
              .map((p, i) => ({ p, depth: i }))
              .reverse()
              .map(({ p, depth }) =>
                depth === 0 ? (
                  <div
                    key={p.id}
                    ref={topRef}
                    className="absolute inset-0 z-10 cursor-grab touch-none active:cursor-grabbing"
                    onPointerDown={onPointerDown}
                    onPointerMove={onPointerMove}
                    onPointerUp={onPointerUp}
                    onPointerCancel={onPointerUp}
                  >
                    <DeckCard project={p} tint={CARD_TINTS[(index + depth) % CARD_TINTS.length]} depth={0} />
                  </div>
                ) : (
                  <div key={p.id} className="pointer-events-none absolute inset-0" aria-hidden="true">
                    <DeckCard project={p} tint={CARD_TINTS[(index + depth) % CARD_TINTS.length]} depth={depth} />
                  </div>
                ),
              )
          )}
        </div>

        <div className="flex flex-col gap-10 lg:pt-6">
          {!done && current && (
            <div className="flex items-center justify-center gap-5 lg:justify-start">
              <button
                type="button"
                onClick={() => decide(-1)}
                aria-label={t.deck.nopeAria(current.title)}
                className="pop grid size-16 place-items-center rounded-full bg-graphite text-vermilion"
              >
                <X className="size-7" strokeWidth={3} aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={() => decide(1)}
                aria-label={t.deck.likeAria(current.title)}
                className="pop grid size-20 place-items-center rounded-full bg-bubblegum text-paper"
              >
                <Heart className="size-9 fill-current" aria-hidden="true" />
              </button>
              <button type="button" onClick={() => open(current)} className="pop rounded-full bg-lemon px-5 py-3 text-sm font-bold">
                {t.deck.open}
              </button>
            </div>
          )}
          <p className="label text-center text-mist lg:text-left">
            {done ? t.deck.done : `${t.deck.count(index + 1, deck.length)} · ${t.deck.hint}`}
          </p>

          <div>
            <p className="label mb-4 text-paper">{t.deck.kept(kept.length)}</p>
            <ul className="flex flex-wrap gap-3">
              {kept.map((p, i) => (
                <li key={p.id}>
                  <button
                    type="button"
                    onClick={() => open(p)}
                    className={cn('sticker pop transition-transform', CARD_TINTS[i % CARD_TINTS.length], i % 2 ? 'rotate-2' : '-rotate-2')}
                  >
                    <Heart className="size-3.5 fill-current" aria-hidden="true" />
                    {p.title}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  )
}
