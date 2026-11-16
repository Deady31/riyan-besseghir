import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react'
import { X } from 'lucide-react'
import type { Project } from '../../data/projects'
import { useLenis } from '../../lib/SmoothScroll'
import { useT } from '../../i18n/useT'
import { Tags } from '../ui/Tags'
import { ProjectLinks } from '../ui/ProjectLinks'
import { ShotFrame } from '../ui/ShotFrame'
import { gsap, prefersReducedMotion } from '../../lib/motion'
import { CATEGORY_TINT } from './ProjectCard'
import { cn } from '../../lib/cn'

const OpenProject = createContext<(p: Project) => void>(() => {})

export const useOpenProject = () => useContext(OpenProject)

export function ProjectDialogProvider({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDialogElement>(null)
  const [project, setProject] = useState<Project | null>(null)
  const lenis = useLenis()
  const t = useT()

  const origin = useRef({ x: 0, y: 0 })
  const open = useCallback((p: Project) => setProject(p), [])

  // Mémorise le dernier point touché : la fiche « jaillit » de la carte cliquée.
  useEffect(() => {
    const onDown = (e: PointerEvent) => {
      origin.current = { x: e.clientX, y: e.clientY }
    }
    window.addEventListener('pointerdown', onDown, { passive: true })
    return () => window.removeEventListener('pointerdown', onDown)
  }, [])

  useEffect(() => {
    const d = ref.current
    if (!d) return
    if (project && !d.open) {
      d.showModal()
      lenis?.stop()
      if (prefersReducedMotion()) return
      const r = d.getBoundingClientRect()
      const fromX = (origin.current.x || window.innerWidth / 2) - (r.left + r.width / 2)
      const fromY = (origin.current.y || window.innerHeight / 2) - (r.top + r.height / 2)
      gsap
        .timeline()
        .fromTo(
          d,
          { x: fromX, y: fromY, scale: 0.15, rotation: -10, opacity: 0 },
          { x: 0, y: 0, scale: 1, rotation: 0, opacity: 1, duration: 0.6, ease: 'back.out(1.3)' },
        )
        .from(d.querySelectorAll('[data-dlg]'), { y: 24, opacity: 0, duration: 0.5, ease: 'power3.out', stagger: 0.05 }, 0.25)
    }
  }, [project, lenis])

  const close = () => {
    const d = ref.current
    if (!d) return
    if (prefersReducedMotion()) {
      d.close()
      return
    }
    gsap.to(d, {
      scale: 0.85,
      rotation: 4,
      opacity: 0,
      duration: 0.25,
      ease: 'power2.in',
      onComplete: () => {
        d.close()
        gsap.set(d, { clearProps: 'all' })
      },
    })
  }

  return (
    <OpenProject.Provider value={open}>
      {children}
      <dialog
        ref={ref}
        onClose={() => {
          lenis?.start()
          setProject(null)
        }}
        onClick={(e) => e.target === ref.current && close()}
        aria-labelledby="project-dialog-title"
        className="m-auto max-h-[90svh] w-[min(980px,calc(100vw-2rem))] overflow-y-auto overscroll-contain rounded-[28px] border border-line bg-ink p-0 text-paper shadow-[var(--shadow-card)] backdrop:bg-plum/55 backdrop:backdrop-blur-[3px]"
        data-lenis-prevent
      >
        {project && (
          <div>
            <div className={cn('h-4 border-b border-line', CATEGORY_TINT[project.category])} aria-hidden="true" />
            <div className="p-6 md:p-10">
              <div data-dlg className="flex items-start justify-between gap-6">
                <div>
                  <p className="sticker bg-lemon">{project.status}</p>
                  <h3 id="project-dialog-title" className="display mt-4 text-4xl md:text-5xl">
                    {project.title}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={close}
                  className="pop grid size-11 shrink-0 place-items-center rounded-full bg-graphite"
                  aria-label={t.dialog.close}
                >
                  <X className="size-5" aria-hidden="true" />
                </button>
              </div>
              <p data-dlg className="mt-6 max-w-2xl text-2xl leading-snug tracking-tight text-balance">
                {project.tagline}
              </p>
              <p data-dlg className="mt-4 max-w-2xl leading-relaxed text-mist">
                {project.description}
              </p>
              <div data-dlg className="mt-8 flex flex-wrap items-center justify-between gap-6">
                <Tags items={project.stack} />
                <ProjectLinks project={project} />
              </div>
              {project.shots.length > 0 && (
                <div
                  data-dlg
                  className={
                    project.shots[0].frame === 'mobile' ? 'mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3' : 'mt-10 grid gap-4 md:grid-cols-2'
                  }
                >
                  {project.shots.map((s, i) => (
                    <ShotFrame key={s.src} shot={s} eager={i === 0} />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </dialog>
    </OpenProject.Provider>
  )
}
