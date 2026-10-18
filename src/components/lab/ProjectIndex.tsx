import { useMemo, useRef, useState } from 'react'
import { ArrowUpRight } from 'lucide-react'
import { gsap, useGSAP, prefersReducedMotion } from '../../lib/motion'
import type { Category, Project } from '../../data/projects'
import { useProjects } from '../../i18n/useProjects'
import { TitleParts, useT } from '../../i18n/useT'
import { SectionHeading } from '../ui/SectionHeading'
import { useOpenProject } from './ProjectDialog'
import { cn } from '../../lib/cn'

const ORDER: Category[] = ['ia', 'consumer', 'jeux', 'clients', 'pm', 'outils']

type Filter = Category | 'all'

function Preview({ project, visible }: { project: Project | null; visible: boolean }) {
  const shot = project?.shots[0]
  return (
    <div
      data-preview
      className={cn(
        'pointer-events-none fixed top-0 left-0 z-40 hidden -translate-x-1/2 -translate-y-1/2 transition-[opacity,scale] duration-300 ease-[var(--ease-expo)] [@media(pointer:fine)]:block',
        visible && shot ? 'scale-100 opacity-100' : 'scale-90 opacity-0',
      )}
      aria-hidden="true"
    >
      {shot && (
        <div className={cn('overflow-hidden rounded-xl border border-line bg-graphite shadow-2xl shadow-black/70', shot.frame === 'mobile' ? 'w-48' : 'w-[380px]')}>
          <img src={shot.src} alt="" className={cn('w-full object-cover object-top', shot.frame === 'mobile' ? 'aspect-[430/700]' : 'aspect-[16/10]')} />
        </div>
      )}
    </div>
  )
}

export function ProjectIndex() {
  const root = useRef<HTMLElement>(null)
  const t = useT()
  const { projects, categories } = useProjects()
  const ALL = useMemo(() => [...projects].sort((a, b) => ORDER.indexOf(a.category) - ORDER.indexOf(b.category)), [projects])
  const label = (c: Category) => categories.find((x) => x.id === c)!.label
  const [filter, setFilter] = useState<Filter>('all')
  const [hovered, setHovered] = useState<Project | null>(null)
  const open = useOpenProject()
  const list = useMemo(() => (filter === 'all' ? ALL : ALL.filter((p) => p.category === filter)), [filter, ALL])
  const move = useRef<{ x: (v: number) => void; y: (v: number) => void } | null>(null)

  useGSAP(
    () => {
      move.current = {
        x: gsap.quickTo('[data-preview]', 'x', { duration: 0.5, ease: 'power3' }),
        y: gsap.quickTo('[data-preview]', 'y', { duration: 0.5, ease: 'power3' }),
      }
    },
    { scope: root },
  )

  useGSAP(
    () => {
      if (prefersReducedMotion()) return
      gsap.from('[data-row]', { opacity: 0, y: 18, duration: 0.5, ease: 'power3.out', stagger: 0.025 })
    },
    { scope: root, dependencies: [filter] },
  )

  const counts = (c: Filter) => (c === 'all' ? ALL.length : ALL.filter((p) => p.category === c).length)

  return (
    <section
      ref={root}
      id="lab"
      className="relative px-[var(--gutter)] py-32 md:py-44"
      onPointerMove={(e) => {
        move.current?.x(e.clientX + 40)
        move.current?.y(e.clientY)
      }}
    >
      <SectionHeading
        index="04"
        label={t.index.label}
        title={<TitleParts parts={t.index.title(ALL.length)} />}
        intro={t.index.intro}
      />

      <div role="toolbar" aria-label={t.index.toolbar} className="mb-10 flex flex-wrap gap-2">
        {(['all', ...ORDER] as Filter[]).map((c) => {
          const active = filter === c
          const meta = c === 'all' ? null : categories.find((x) => x.id === c)
          return (
            <button
              key={c}
              type="button"
              aria-pressed={active}
              onClick={() => setFilter(c)}
              className={cn(
                'flex items-center gap-2 rounded-full border px-4 py-2 text-sm transition-colors duration-300',
                active ? 'border-paper bg-paper text-ink' : 'border-line text-paper hover:border-paper',
              )}
            >
              {c === 'all' ? t.index.all : meta!.label}
              <sup className={cn('text-[10px]', active ? 'text-ink/60' : 'text-mist')}>{counts(c)}</sup>
            </button>
          )
        })}
      </div>

      <ul className="border-t border-line" onPointerLeave={() => setHovered(null)}>
        {list.map((p, i) => (
          <li key={p.id} data-row className="border-b border-line">
            <button
              type="button"
              onClick={() => open(p)}
              onPointerEnter={() => setHovered(p)}
              onFocus={() => setHovered(null)}
              className="group grid w-full grid-cols-[56px_1fr_auto] items-center gap-4 py-4 text-left transition-colors duration-300 hover:bg-paper/[0.03] md:grid-cols-[48px_minmax(0,1.1fr)_minmax(0,1.4fr)_170px_130px_24px] md:gap-6 md:py-5"
            >
              <span className="font-mono text-xs text-mist md:block">
                <span className="hidden md:inline">{String(i + 1).padStart(2, '0')}</span>
                {p.shots[0] && (
                  <img src={p.shots[0].src} alt="" loading="lazy" className="size-14 rounded-md border border-line object-cover object-top md:hidden" />
                )}
              </span>
              <span className="min-w-0">
                <span className="block truncate text-xl font-medium tracking-tight transition-[color,translate] duration-300 group-hover:translate-x-2 group-hover:text-signal md:text-2xl">
                  {p.title}
                </span>
                <span className="mt-1 block truncate text-sm text-mist md:hidden">{p.tagline}</span>
              </span>
              <span className="hidden truncate text-mist md:block">{p.tagline}</span>
              <span className="hidden font-mono text-[11px] tracking-[0.14em] text-mist uppercase md:block">{label(p.category)}</span>
              <span className="hidden font-mono text-[11px] tracking-[0.14em] text-paper uppercase md:block">{p.status}</span>
              <ArrowUpRight className="size-5 text-mist transition-[color,rotate] duration-300 group-hover:rotate-45 group-hover:text-signal" aria-hidden="true" />
            </button>
          </li>
        ))}
      </ul>

      <Preview project={hovered} visible={hovered !== null} />
    </section>
  )
}
