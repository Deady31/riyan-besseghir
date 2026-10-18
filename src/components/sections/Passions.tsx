import { useRef } from 'react'
import { ArrowUpRight } from 'lucide-react'
import { gsap, useGSAP, prefersReducedMotion } from '../../lib/motion'
import type { Project } from '../../data/projects'
import { useProjects } from '../../i18n/useProjects'
import { TitleParts, useT } from '../../i18n/useT'
import { SectionHeading } from '../ui/SectionHeading'
import { useOpenProject } from '../lab/ProjectDialog'
import { cn } from '../../lib/cn'

type Tile = { id: string; className: string; imgClass?: string; hoverShot?: number }

const TILES: Tile[] = [
  { id: 'derniere-note', className: 'md:col-span-4 md:row-span-2', hoverShot: 1 },
  { id: 'one-piece', className: 'md:col-span-2 md:row-span-2', imgClass: 'object-[50%_30%]' },
  { id: 'natsukashii', className: 'md:col-span-3' },
  { id: 'overwatch-nexus', className: 'md:col-span-3' },
]

function PassionTile({ tile, project }: { tile: Tile; project: Project }) {
  const open = useOpenProject()
  const t = useT()
  const main = project.shots[0]
  const alt = tile.hoverShot !== undefined ? project.shots[tile.hoverShot] : undefined

  return (
    <button
      type="button"
      data-tile
      onClick={() => open(project)}
      aria-label={t.ai.open(project.title)}
      className={cn('group relative min-h-[320px] overflow-hidden rounded-[20px] bg-graphite text-left', tile.className)}
    >
      <div data-parallax className="absolute -inset-y-[8%] inset-x-0">
        <img
          src={main.src}
          alt=""
          loading="lazy"
          decoding="async"
          className={cn(
            'size-full object-cover transition-[opacity,scale] duration-700 ease-[var(--ease-expo)] group-hover:scale-[1.04]',
            alt && 'group-hover:opacity-0',
            tile.imgClass,
          )}
        />
        {alt && (
          <img src={alt.src} alt="" loading="lazy" decoding="async" className="absolute inset-0 size-full object-cover opacity-0 transition-opacity duration-700 group-hover:opacity-100" />
        )}
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" aria-hidden="true" />
      <div className="relative flex h-full flex-col justify-end gap-1 p-6 md:p-8">
        <h3 className="text-2xl tracking-[-0.03em] md:text-4xl">{project.title}</h3>
        <p className="max-w-md text-white/75">{project.tagline}</p>
      </div>
      <span className="absolute top-5 right-5 grid size-10 place-items-center rounded-full bg-white text-ink opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
        <ArrowUpRight className="size-4" aria-hidden="true" />
      </span>
    </button>
  )
}

export function Passions() {
  const root = useRef<HTMLElement>(null)
  const t = useT()
  const { byId } = useProjects()
  const WORDS = t.passions.words

  useGSAP(
    () => {
      if (prefersReducedMotion()) return
      gsap.to('[data-marquee]', {
        xPercent: -30,
        ease: 'none',
        scrollTrigger: { trigger: root.current, start: 'top bottom', end: 'bottom top', scrub: true },
      })
      gsap.from('[data-tile]', {
        y: 60,
        opacity: 0,
        duration: 1.1,
        ease: 'expo.out',
        stagger: 0.1,
        scrollTrigger: { trigger: '[data-bento]', start: 'top 80%', once: true },
      })
      gsap.utils.toArray<HTMLElement>('[data-parallax]').forEach((el) => {
        gsap.fromTo(el, { yPercent: -5 }, { yPercent: 5, ease: 'none', scrollTrigger: { trigger: el.parentElement, scrub: true } })
      })
    },
    { scope: root },
  )

  return (
    <section ref={root} id="passions" className="relative overflow-hidden py-32 md:py-48">
      <div className="px-[var(--gutter)]">
        <SectionHeading
          index="06"
          label={t.passions.label}
          title={<TitleParts parts={t.passions.title} />}
          intro={t.passions.intro}
        />
      </div>

      <div className="mb-20 overflow-hidden whitespace-nowrap select-none" aria-hidden="true">
        <div data-marquee className="display inline-flex gap-[0.35em] text-[length:var(--text-hero)]">
          {[...WORDS, ...WORDS].map((w, i) => (
            <span key={i} className="inline-flex items-center gap-[0.35em]">
              {i % 2 ? <em className="text-mist">{w}</em> : w}
              <span className="inline-block size-[0.12em] rounded-full bg-signal" />
            </span>
          ))}
        </div>
      </div>

      <div data-bento className="grid auto-rows-[minmax(320px,auto)] gap-4 px-[var(--gutter)] md:grid-cols-6">
        {TILES.map((tile) => {
          const p = byId(tile.id)
          return p ? <PassionTile key={tile.id} tile={tile} project={p} /> : null
        })}
      </div>
    </section>
  )
}
