import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react'
import { X } from 'lucide-react'
import type { Project } from '../../data/projects'
import { useLenis } from '../../lib/SmoothScroll'
import { useT } from '../../i18n/useT'
import { Tags } from '../ui/Tags'
import { ProjectLinks } from '../ui/ProjectLinks'
import { ShotFrame } from '../ui/ShotFrame'

const OpenProject = createContext<(p: Project) => void>(() => {})

export const useOpenProject = () => useContext(OpenProject)

export function ProjectDialogProvider({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDialogElement>(null)
  const [project, setProject] = useState<Project | null>(null)
  const lenis = useLenis()
  const t = useT()

  const open = useCallback((p: Project) => setProject(p), [])

  useEffect(() => {
    const d = ref.current
    if (!d) return
    if (project && !d.open) {
      d.showModal()
      lenis?.stop()
    }
  }, [project, lenis])

  const close = () => {
    ref.current?.close()
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
        className="m-auto max-h-[90svh] w-[min(980px,calc(100vw-2rem))] overflow-y-auto overscroll-contain rounded-2xl border border-line bg-ink p-0 text-paper backdrop:bg-ink/80 backdrop:backdrop-blur-sm open:animate-[dialog-in_.45s_var(--ease-expo)]"
        data-lenis-prevent
      >
        {project && (
          <div className="p-6 md:p-10">
            <div className="flex items-start justify-between gap-6">
              <div>
                <p className="font-mono text-xs tracking-[0.18em] text-signal-soft uppercase">{project.status}</p>
                <h3 id="project-dialog-title" className="mt-3 text-4xl font-medium tracking-[-0.03em] md:text-5xl">
                  {project.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={close}
                className="grid size-11 shrink-0 place-items-center rounded-full border border-line transition-colors hover:border-paper"
                aria-label={t.dialog.close}
              >
                <X className="size-5" aria-hidden="true" />
              </button>
            </div>
            <p className="mt-6 max-w-2xl text-2xl leading-snug tracking-tight text-balance">{project.tagline}</p>
            <p className="mt-4 max-w-2xl leading-relaxed text-mist">{project.description}</p>
            <div className="mt-8 flex flex-wrap items-center justify-between gap-6">
              <Tags items={project.stack} />
              <ProjectLinks project={project} />
            </div>
            {project.shots.length > 0 && (
              <div
                className={
                  project.shots[0].frame === 'mobile'
                    ? 'mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3'
                    : 'mt-10 grid gap-4 md:grid-cols-2'
                }
              >
                {project.shots.map((s, i) => (
                  <ShotFrame key={s.src} shot={s} eager={i === 0} />
                ))}
              </div>
            )}
          </div>
        )}
      </dialog>
    </OpenProject.Provider>
  )
}
