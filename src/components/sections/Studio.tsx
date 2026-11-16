import { Link } from 'react-router'
import { ArrowUpRight } from 'lucide-react'
import { motion } from 'motion/react'
import { STORIES } from '../../data/stories'
import { useContent } from '../../data/profile'
import { useProjects } from '../../i18n/useProjects'
import { TitleParts, useT } from '../../i18n/useT'
import { scrollToId, useLenis } from '../../lib/SmoothScroll'
import { SectionHeading } from '../ui/SectionHeading'
import { BigTile } from '../ui/BigTile'
import { Counter } from '../ui/Counter'
import { Anchor } from '../three/Anchor'
import { GithubIcon, LinkedinIcon } from '../ui/BrandIcons'

const rise = {
  initial: { opacity: 0, y: 48 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-10% 0px' },
  transition: { type: 'spring' as const, stiffness: 90, damping: 18 },
}

/**
 * Personal branding : « je construis, donc je le raconte ». Tous les chiffres sont comptés dans les données du site
 * (projets, fiches, liens, dépôts) : rien n'est saisi à la main, rien n'est inventé.
 */
export function Studio() {
  const t = useT()
  const s = t.studio
  const lenis = useLenis()
  const { projects } = useProjects()
  const { profile } = useContent()

  const total = projects.length
  const sheets = Object.keys(STORIES).length
  const withLink = projects.filter((p) => p.link).length
  const withRepo = projects.filter((p) => p.repo).length
  const latest = projects.filter((p) => p.highlight === 'Nouveau' || p.highlight === 'New').slice(0, 6)
  const log = [...latest, ...projects.filter((p) => !latest.includes(p))].slice(0, 6)

  return (
    <section id="studio" className="relative px-[var(--gutter)] py-32 md:py-48" aria-labelledby="studio-title">
      <Anchor kind="star-cobalt" className="top-[3%] right-[4%] w-[12vw] max-md:w-[24vw]" par={0.2} tilt={0.8} />
      <Anchor kind="capsule" className="bottom-[2%] left-[46%] w-[8vw] max-md:hidden" par={0.25} />
      <SectionHeading index="03" label={s.label} title={<TitleParts parts={s.title} />} intro={s.intro} />
      <h2 id="studio-title" className="sr-only">
        {s.label}
      </h2>

      <motion.ul {...rise} className="grid gap-4 md:grid-cols-3 md:gap-6">
        <li>
          <BigTile tone="cobalt" inner="flex min-h-64 flex-col justify-between gap-10 md:!p-10">
            <span className="label opacity-80">{s.pillars.build.tag}</span>
            <span>
              <Counter value={total} className="display block text-[clamp(3.5rem,2rem+5vw,6.5rem)] !text-current" />
              <span className="display mt-1 block text-[clamp(1.4rem,1rem+1.2vw,2.2rem)] !text-current">{s.pillars.build.title(total).replace(/^\d+\s*/, '')}</span>
              <span className="mt-4 block text-lg leading-snug">{s.pillars.build.text}</span>
            </span>
          </BigTile>
        </li>
        <li>
          <BigTile tone="vermilion" inner="flex min-h-64 flex-col justify-between gap-10 md:!p-10">
            <span className="label opacity-80">{s.pillars.document.tag}</span>
            <span>
              <Counter value={sheets} className="display block text-[clamp(3.5rem,2rem+5vw,6.5rem)] !text-current" />
              <span className="display mt-1 block text-[clamp(1.4rem,1rem+1.2vw,2.2rem)] !text-current">{s.pillars.document.title(sheets).replace(/^\d+\s*/, '')}</span>
              <span className="mt-4 block text-lg leading-snug">{s.pillars.document.text}</span>
            </span>
          </BigTile>
        </li>
        <li>
          <BigTile tone="acid" inner="flex min-h-64 flex-col justify-between gap-10 md:!p-10">
            <span className="label opacity-80">{s.pillars.share.tag}</span>
            <span>
              <span className="display block text-[clamp(2.6rem,1.6rem+3vw,4.6rem)] !text-current">{s.pillars.share.title}</span>
              <span className="mt-4 block text-lg leading-snug">{s.pillars.share.text}</span>
              <span className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm font-semibold">
                <span>
                  <Counter value={withLink} className="display text-2xl" /> {s.stats.live}
                </span>
                <span>
                  <Counter value={withRepo} className="display text-2xl" /> {s.stats.code}
                </span>
              </span>
            </span>
          </BigTile>
        </li>
      </motion.ul>

      <div className="mt-6 grid gap-4 md:mt-8 md:gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
        <motion.div {...rise}>
          <BigTile tone="ink" inner="flex h-full flex-col gap-8 md:!p-10">
            <span className="label opacity-80">{s.ambition.tag}</span>
            <p className="display text-[clamp(2.2rem,1.4rem+2.6vw,4rem)] !text-current">{s.ambition.title}</p>
            <ul className="grid gap-3 text-lg leading-snug">
              {s.ambition.lines.map((l) => (
                <li key={l} className="flex gap-4">
                  <span className="mt-2.5 size-2.5 shrink-0 rounded-full bg-lemon" aria-hidden="true" />
                  {l}
                </li>
              ))}
            </ul>
            <div className="mt-auto flex flex-wrap gap-3 pt-2">
              <a href={profile.links.linkedin} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-full bg-lemon px-6 py-3 text-sm font-bold text-paper">
                <LinkedinIcon className="size-4" />
                {s.cta.follow}
                <span className="sr-only">{t.links.newTab}</span>
              </a>
              <a href={profile.links.github} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-full border border-current px-6 py-3 text-sm font-semibold">
                <GithubIcon className="size-4" />
                {s.cta.code}
                <span className="sr-only">{t.links.newTab}</span>
              </a>
              <a
                href="#contact"
                onClick={(e) => {
                  e.preventDefault()
                  scrollToId(lenis, 'contact')
                }}
                className="inline-flex items-center gap-2 rounded-full border border-current px-6 py-3 text-sm font-semibold"
              >
                {s.cta.talk}
              </a>
            </div>
          </BigTile>
        </motion.div>

        <motion.div {...rise}>
          <h3 className="label mb-4 text-mist">{s.logTitle}</h3>
          <ol className="grid gap-3">
            {log.map((p, i) => (
              <li key={p.id}>
                <Link
                  to={`/projets/${p.id}`}
                  className="group flex items-center gap-5 rounded-[32px] bg-graphite px-6 py-4 transition-[background-color,transform] duration-300 hover:-translate-y-0.5 hover:bg-graphite-2 active:scale-[0.99] md:px-8 md:py-5"
                >
                  <span className="label text-mist">{String(i + 1).padStart(2, '0')}</span>
                  <span className="min-w-0 flex-1">
                    <span className="display block truncate text-[clamp(1.4rem,1rem+1.2vw,2.2rem)]">{p.title}</span>
                    <span className="mt-1 block truncate text-sm text-mist">{p.tagline}</span>
                  </span>
                  <span className="sticker hidden border-current sm:inline-block">{p.status}</span>
                  <ArrowUpRight className="size-5 shrink-0 transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1" aria-hidden="true" />
                </Link>
              </li>
            ))}
          </ol>
        </motion.div>
      </div>
    </section>
  )
}
