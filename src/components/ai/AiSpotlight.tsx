import { useRef } from 'react'
import { gsap, useGSAP, prefersReducedMotion } from '../../lib/motion'
import type { Project } from '../../data/projects'
import { useProjects } from '../../i18n/useProjects'
import { TitleParts, useT } from '../../i18n/useT'
import { SectionHeading } from '../ui/SectionHeading'
import { Tags } from '../ui/Tags'
import { ProjectLinks } from '../ui/ProjectLinks'
import { ShotFrame } from '../ui/ShotFrame'
import { useOpenProject } from '../lab/ProjectDialog'
import { ChatDemo } from './ChatDemo'
import { cn } from '../../lib/cn'

function FeatureCard({ project, index, wide }: { project: Project; index: number; wide?: boolean }) {
  const open = useOpenProject()
  const t = useT()
  const shot = project.shots[0]
  return (
    <article data-feat className={cn('group', wide && 'md:col-span-2')}>
      <button
        type="button"
        onClick={() => open(project)}
        aria-label={t.ai.open(project.title)}
        className="relative block w-full overflow-hidden rounded-[20px] bg-graphite"
      >
        <div className={cn('grid place-items-center overflow-hidden', wide ? 'aspect-[16/9] p-[6%]' : 'aspect-[4/5] p-[10%]')}>
          <div
            className={cn(
              'transition-transform duration-[900ms] ease-[var(--ease-expo)] group-hover:scale-[1.03]',
              shot.frame === 'mobile' ? 'w-[52%]' : 'w-full',
            )}
          >
            <ShotFrame shot={shot} />
          </div>
        </div>
      </button>
      <div className="mt-6 grid gap-x-8 gap-y-3 md:grid-cols-[auto_minmax(0,1fr)]">
        <p className="label pt-2 text-mist">({String(index).padStart(2, '0')})</p>
        <div>
          <h3 className="text-3xl tracking-[-0.03em]">
            {project.title} <span className="text-mist">— {project.status}</span>
          </h3>
          <p className="mt-2 max-w-lg leading-relaxed text-mist">{project.tagline}</p>
          <div className="mt-5 flex flex-wrap items-center gap-4">
            <ProjectLinks project={project} />
          </div>
        </div>
      </div>
    </article>
  )
}

export function AiSpotlight() {
  const root = useRef<HTMLElement>(null)
  const t = useT()
  const { byId } = useProjects()
  const get = (id: string) => byId(id) as Project
  const chat = get('chatbot-cv')

  useGSAP(
    () => {
      if (prefersReducedMotion()) return
      const mm = gsap.matchMedia()
      mm.add('(min-width: 900px)', () => {
        const msgs = gsap.utils.toArray<HTMLElement>('[data-msg]')
        const list = root.current!.querySelector<HTMLElement>('[data-chat-list]')!
        const viewport = root.current!.querySelector<HTMLElement>('[data-chat-viewport]')!
        gsap.set(msgs, { opacity: 0, y: 14 })
        const tl = gsap.timeline({
          scrollTrigger: { trigger: '[data-chat-pin]', start: 'top top', end: '+=240%', scrub: 0.6, pin: true, invalidateOnRefresh: true },
        })
        msgs.forEach((m, i) => {
          tl.to(m, { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' }, i)
          tl.to(list, { y: () => Math.min(0, viewport.clientHeight - (m.offsetTop + m.offsetHeight + 18)), duration: 0.6, ease: 'power2.out' }, i)
        })
        tl.to({}, { duration: 0.8 })
      })
      gsap.from('[data-feat]', {
        y: 60,
        opacity: 0,
        duration: 1.2,
        ease: 'expo.out',
        stagger: 0.12,
        scrollTrigger: { trigger: '[data-feats]', start: 'top 80%', once: true },
      })
    },
    { scope: root },
  )

  return (
    <section ref={root} id="ia" className="relative py-32 md:py-48">
      <div className="px-[var(--gutter)]">
        <SectionHeading
          index="03"
          label={t.ai.label}
          title={<TitleParts parts={t.ai.title} />}
          intro={t.ai.intro}
        />
      </div>

      <div data-chat-pin className="relative flex min-h-[100svh] items-center px-[var(--gutter)] py-16">
        <div className="grid w-full items-center gap-16 lg:grid-cols-[minmax(0,1fr)_minmax(0,3fr)]">
          <p className="label hidden text-mist lg:block">{t.ai.featured}</p>
          <div className="grid items-center gap-16 lg:grid-cols-[minmax(0,1.1fr)_auto]">
            <div>
              <h3 className="display text-[length:var(--text-mega)]">
                Méca-<em>Riyan</em>
              </h3>
              <p className="mt-8 max-w-md text-[clamp(1.25rem,1rem+0.6vw,1.6rem)] leading-snug tracking-[-0.02em]">{chat.tagline}</p>
              <p className="mt-5 max-w-md leading-relaxed text-mist">{chat.description}</p>
              <div className="mt-8 space-y-6">
                <Tags items={chat.stack} />
                <ProjectLinks project={chat} />
              </div>
            </div>
            <ChatDemo />
          </div>
        </div>
      </div>

      <div data-feats className="mt-24 grid gap-x-6 gap-y-20 px-[var(--gutter)] md:grid-cols-2">
        <FeatureCard project={get('lifeos')} index={2} wide />
        <FeatureCard project={get('departs')} index={3} />
        <FeatureCard project={get('lio')} index={4} />
      </div>
    </section>
  )
}
