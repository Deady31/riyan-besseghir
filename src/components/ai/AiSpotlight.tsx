import { useRef } from 'react'
import { gsap, useGSAP, prefersReducedMotion } from '../../lib/motion'
import { useProjects } from '../../i18n/useProjects'
import { TitleParts, useT } from '../../i18n/useT'
import { SectionHeading } from '../ui/SectionHeading'
import { Tags } from '../ui/Tags'
import { ProjectLinks } from '../ui/ProjectLinks'
import { ChatDemo } from './ChatDemo'
import { Anchor } from '../three/Anchor'

export function AiSpotlight() {
  const root = useRef<HTMLElement>(null)
  const t = useT()
  const { byId } = useProjects()
  const chat = byId('chatbot-cv')!

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
    <section ref={root} id="ia" className="theme-dark relative isolate pt-32 pb-16 md:pt-48 md:pb-20">
      <Anchor kind="robot" className="top-[30%] right-[1.5%] w-[10vw] max-md:hidden" par={0.25} tilt={0.7} />
      <div className="px-[var(--gutter)]">
        <SectionHeading
          index="04"
          align="right"
          label={t.ai.label}
          title={<TitleParts parts={t.ai.title} />}
          intro={t.ai.intro}
        />
      </div>

      <div data-chat-pin className="relative flex min-h-[100svh] items-center px-[var(--gutter)] py-16">
        <div className="w-full">
          <div className="grid items-center gap-16 lg:grid-cols-[auto_minmax(0,1fr)] lg:gap-24">
            <div className="lg:order-2">
              <p className="mb-6"><span className="sticker rotate-1 bg-signal text-ink">{t.ai.featured}</span></p>
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

    </section>
  )
}
