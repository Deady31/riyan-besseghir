import { useRef, type PointerEvent as ReactPointerEvent } from 'react'
import type { Category, Project } from '../../data/projects'
import { cn } from '../../lib/cn'

/** Couleur d'en-tête par catégorie : on reconnaît la famille d'un coup d'œil. */
export const CATEGORY_TINT: Record<Category, string> = {
  consumer: 'bg-bubblegum',
  ia: 'bg-signal text-ink',
  outils: 'bg-mint',
  jeux: 'bg-tangerine',
  pm: 'bg-lemon',
  clients: 'bg-graphite-2',
}

/** Rareté façon carte à collectionner : un projet en ligne ou mis en avant brille. */
export function rarity(p: Project): 1 | 2 | 3 {
  if (p.highlight || p.link) return 3
  if (p.shots.length > 0 && p.status !== 'Prototype' && p.status !== 'Cadrage' && p.status !== 'Démarrage') return 2
  return 1
}

type Props = {
  project: Project
  number: number
  total: number
  categoryLabel: string
  onOpen: (p: Project) => void
}

export function ProjectCard({ project, number, total, categoryLabel, onOpen }: Props) {
  const ref = useRef<HTMLButtonElement>(null)
  const shot = project.shots[0]
  const level = rarity(project)

  const onMove = (e: ReactPointerEvent<HTMLButtonElement>) => {
    if (e.pointerType !== 'mouse') return
    const el = ref.current!
    const r = el.getBoundingClientRect()
    const x = (e.clientX - r.left) / r.width
    const y = (e.clientY - r.top) / r.height
    el.style.setProperty('--rx', `${(0.5 - y) * 16}deg`)
    el.style.setProperty('--ry', `${(x - 0.5) * 20}deg`)
    el.style.setProperty('--gx', `${x * 100}%`)
    el.style.setProperty('--gy', `${y * 100}%`)
    el.style.setProperty('--hover', '1')
  }
  const onLeave = () => {
    const el = ref.current!
    el.style.setProperty('--rx', '0deg')
    el.style.setProperty('--ry', '0deg')
    el.style.setProperty('--hover', '0')
  }

  return (
    <button
      ref={ref}
      type="button"
      onClick={() => onOpen(project)}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      className={cn('tcg group relative block w-full text-left', level === 3 && 'tcg-holo')}
    >
      <span className="tcg-inner flex h-full flex-col overflow-hidden rounded-[18px] border border-line bg-graphite">
        <span className={cn('flex items-center justify-between border-b border-line px-3 py-2', CATEGORY_TINT[project.category])}>
          <span className="label truncate text-[10px]">{categoryLabel}</span>
          <span className="label shrink-0 text-[10px]" aria-label={`${level} / 3`}>
            {'★'.repeat(level)}
            <span className="opacity-30">{'★'.repeat(3 - level)}</span>
          </span>
        </span>
        <span className="relative block aspect-[4/3] overflow-hidden border-b border-line bg-graphite-2">
          {shot ? (
            <img
              src={shot.src}
              alt=""
              loading="lazy"
              decoding="async"
              className={cn(
                'size-full object-top transition-transform duration-700 ease-[var(--ease-expo)] group-hover:scale-105',
                shot.frame === 'mobile' ? 'object-contain py-3' : 'object-cover',
              )}
            />
          ) : (
            <span className="display grid size-full place-items-center p-4 text-center text-3xl text-mist">{project.title.slice(0, 2)}</span>
          )}
          {project.highlight && <span className="sticker absolute top-2 left-2 -rotate-3 bg-lemon text-[10px]">{project.highlight}</span>}
        </span>
        <span className="flex flex-1 flex-col p-3.5">
          <span className="flex items-baseline justify-between gap-2">
            <span className="display line-clamp-2 text-[15px] leading-tight break-words md:text-xl">{project.title}</span>
            <span className="label shrink-0 text-[10px] text-mist max-sm:hidden">
              #{String(number).padStart(2, '0')}/{total}
            </span>
          </span>
          <span className="mt-1.5 line-clamp-2 text-[13px] leading-snug text-mist">{project.tagline}</span>
          <span className="mt-auto pt-3">
            <span className="sticker bg-graphite text-[10px] shadow-none">{project.status}</span>
          </span>
        </span>
      </span>
      <span className="tcg-glare pointer-events-none absolute inset-0 rounded-[18px]" aria-hidden="true" />
    </button>
  )
}
