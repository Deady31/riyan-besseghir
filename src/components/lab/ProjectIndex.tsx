import { useMemo, useRef, useState } from 'react'
import { Shuffle } from 'lucide-react'
import { gsap, useGSAP, prefersReducedMotion } from '../../lib/motion'
import type { Category } from '../../data/projects'
import { useProjects } from '../../i18n/useProjects'
import { TitleParts, useT } from '../../i18n/useT'
import { SectionHeading } from '../ui/SectionHeading'
import { useOpenProject } from '../../lib/useOpenProject'
import { CATEGORY_TINT, ProjectCard, rarity } from './ProjectCard'
import { cn } from '../../lib/cn'
import { Anchor } from '../three/Anchor'

const ORDER: Category[] = ['consumer', 'ia', 'outils', 'jeux', 'pm', 'clients']
const PAGE = 9
const FEATURED_IDS = new Set(['fooder'])

type Filter = Category | 'all'

export function ProjectIndex() {
  const root = useRef<HTMLElement>(null)
  const t = useT()
  const { projects, categories } = useProjects()
  const ALL = useMemo(
    () =>
      [...projects].sort(
        (a, b) =>
          Number(FEATURED_IDS.has(b.id)) - Number(FEATURED_IDS.has(a.id)) ||
          rarity(b) - rarity(a) ||
          ORDER.indexOf(a.category) - ORDER.indexOf(b.category),
      ),
    [projects],
  )
  const label = (c: Category) => categories.find((x) => x.id === c)!.label
  const [filter, setFilter] = useState<Filter>('all')
  const [limit, setLimit] = useState(PAGE)
  const open = useOpenProject()
  const list = useMemo(() => (filter === 'all' ? ALL : ALL.filter((p) => p.category === filter)), [filter, ALL])
  const shown = list.slice(0, limit)

  useGSAP(
    () => {
      if (prefersReducedMotion()) return
      gsap.from('[data-card]', {
        opacity: 0,
        y: 40,
        rotation: () => gsap.utils.random(-6, 6),
        duration: 0.7,
        ease: 'back.out(1.6)',
        stagger: 0.04,
      })
    },
    { scope: root, dependencies: [filter] },
  )

  const counts = (c: Filter) => (c === 'all' ? ALL.length : ALL.filter((p) => p.category === c).length)
  const pick = (c: Filter) => {
    setFilter(c)
    setLimit(PAGE)
  }
  const random = () => open(list[Math.floor(Math.random() * list.length)])

  return (
    <section ref={root} id="lab" className="relative isolate px-[var(--gutter)] py-32 md:py-44">
      <Anchor kind="earphones" className="top-[1%] right-[2.5%] w-[13vw] max-md:w-[26vw]" par={0.2} tilt={0.7} />
      <Anchor kind="vinyl" className="bottom-[2%] left-[0.5%] w-[14vw] max-md:hidden" par={0.15} tilt={0.7} />
      <SectionHeading
        index="05"
        label={t.index.label}
        title={<TitleParts parts={t.index.title(ALL.length)} />}
        intro={t.index.intro}
      />

      <div className="mb-12 flex flex-wrap items-center gap-3">
        <div role="toolbar" aria-label={t.index.toolbar} className="flex flex-wrap gap-2.5">
          {(['all', ...ORDER] as Filter[]).map((c) => {
            const active = filter === c
            return (
              <button
                key={c}
                type="button"
                aria-pressed={active}
                onClick={() => pick(c)}
                className={cn(
                  'pop flex items-center gap-2 px-5 py-2.5 text-sm font-semibold',
                  active ? (c === 'all' ? 'bg-paper text-ink' : CATEGORY_TINT[c]) : 'bg-transparent text-paper hover:bg-graphite-2',
                )}
              >
                {c === 'all' ? t.index.all : label(c)}
                <sup className="text-xs opacity-60">{counts(c)}</sup>
              </button>
            )
          })}
        </div>
        <button type="button" onClick={random} className="pop ml-auto flex items-center gap-2 bg-lemon px-5 py-2.5 text-sm font-bold text-paper">
          <Shuffle className="size-4" aria-hidden="true" />
          {t.index.random}
        </button>
      </div>

      <ul className="grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-2 lg:grid-cols-3 lg:gap-x-8 lg:gap-y-12">
        {shown.map((p) => (
          <li key={p.id} data-card>
            <ProjectCard project={p} number={ALL.indexOf(p) + 1} total={ALL.length} categoryLabel={label(p.category)} onOpen={open} />
          </li>
        ))}
      </ul>

      {list.length > limit && (
        <div className="mt-14 flex justify-center">
          <button type="button" onClick={() => setLimit((l) => l + PAGE)} className="pop bg-signal px-8 py-4 font-bold text-ink">
            {t.index.more(list.length - limit)}
          </button>
        </div>
      )}
    </section>
  )
}
