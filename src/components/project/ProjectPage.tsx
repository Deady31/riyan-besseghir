import { useEffect } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import { ArrowLeft, ArrowRight, ArrowUpRight } from 'lucide-react'
import { GithubIcon } from '../ui/BrandIcons'
import { motion } from 'motion/react'
import { STORIES } from '../../data/stories'
import { useProjects } from '../../i18n/useProjects'
import { useLang } from '../../i18n/LangProvider'
import { useT } from '../../i18n/useT'
import { useLenis } from '../../lib/SmoothScroll'
import { usePageMeta } from '../../hooks/usePageMeta'
import { BigTile, type Tone } from '../ui/BigTile'
import { ShimmerButton } from '../vendor/magicui/shimmer-button'
import { CATEGORY_TINT } from '../lab/ProjectCard'
import { ShotFrame } from '../ui/ShotFrame'
import { cn } from '../../lib/cn'
import { Anchor } from '../three/Anchor'
import { PhoneStage } from './PhoneStage'
import { phoneStage } from '../../lib/phoneStage'

// Projets dont l'appli réelle s'ouvre dans le téléphone 3D (l'appli doit autoriser l'affichage depuis ce site).
const LIVE: Record<string, { url: string; screen: string }> = {
  // `/demo` : entrée sans inscription (profil invité local, aucun compte, cloud coupé).
  fooder: { url: `${import.meta.env.VITE_FOODER_URL ?? 'https://fooder-tawny.vercel.app'}/demo`, screen: '/media/projets/fooder-v2-swipe-mobile.webp' },
}

const CAT_TONE: Record<string, Tone> = { consumer: 'vermilion', ia: 'cobalt', outils: 'chrome', jeux: 'acid', pm: 'ink', clients: 'chrome' }
const STEP_TONES: Tone[] = ['paper', 'chrome', 'paper', 'chrome']

const rise = {
  initial: { opacity: 0, y: 56 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-12% 0px' },
  transition: { type: 'spring' as const, stiffness: 90, damping: 18 },
}

/**
 * La carte d'un projet : pourquoi je l'ai créé, comment ça marche, puis ce que j'ai décidé, les preuves et les écrans.
 * Chaque bloc n'apparaît que si le fait est documenté.
 */
export function ProjectPage() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const lenis = useLenis()
  const t = useT()
  const { lang } = useLang()
  const { projects, categories, byId } = useProjects()
  const project = slug ? byId(slug) : undefined
  const story = project ? STORIES[project.id]?.[lang === 'en' ? 'en' : 'fr'] : undefined

  usePageMeta(project?.title ?? null, project ? (story?.why ?? project.tagline).slice(0, 158) : null)

  useEffect(() => {
    if (lenis) lenis.scrollTo(0, { immediate: true })
    window.scrollTo(0, 0)
  }, [slug, lenis])

  if (!project) {
    return (
      <main className="grid min-h-svh place-items-center px-[var(--gutter)]">
        <div className="text-center">
          <p className="display text-4xl">{t.project.notFound}</p>
          <Link to="/" className="pop mt-8 inline-flex bg-paper px-6 py-3 font-semibold text-ink">
            {t.project.back}
          </Link>
        </div>
      </main>
    )
  }

  const index = projects.findIndex((p) => p.id === project.id)
  const next = projects[(index + 1) % projects.length]
  const nextTone = CAT_TONE[next.category] ?? 'paper'
  const cat = categories.find((c) => c.id === project.category)?.label ?? ''
  const why = story?.why ?? project.description
  const how = story?.how ?? []
  const mobileShots = project.shots.filter((s) => s.frame === 'mobile')
  const desktopShots = project.shots.filter((s) => s.frame !== 'mobile')

  const back = () => navigate('/', { state: { restore: true } })
  const live = LIVE[project.id]
  const longest = Math.max(...project.title.split(/\s+/).map((w) => w.length))
  const titleFit = (Math.max(longest, 5) * 0.68).toFixed(2)

  return (
    <main className="relative px-[var(--gutter)] pt-24 pb-28 md:pt-28">
      {live && <PhoneStage url={live.url} title={project.title} closeLabel={t.project.closePhone} />}
      <Anchor kind="orb" className="top-[62%] right-[2%] w-[10vw] max-md:w-[22vw]" par={0.2} />
      <Anchor kind="form-cobalt" className="top-[38%] left-[1.5%] w-[9vw] max-md:hidden" par={0.15} />
      <Anchor kind="ring" className="bottom-[14%] right-[3%] w-[11vw] max-md:hidden" par={0.2} />
      <div className="mb-8 flex items-center justify-between gap-4">
        <motion.button
          type="button"
          onClick={back}
          whileHover={{ x: -4 }}
          whileTap={{ scale: 0.94 }}
          transition={{ type: 'spring', stiffness: 420, damping: 18 }}
          className="pop inline-flex items-center gap-2 bg-transparent px-5 py-2.5 text-sm font-semibold"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          {t.project.back}
        </motion.button>
        <p className="label text-mist">
          {String(index + 1).padStart(2, '0')} / {projects.length}
        </p>
      </div>

      {/* Ouverture : la carte du projet se déploie en grand bloc coloré. */}
      <motion.section
        initial={{ opacity: 0, scale: 0.94, y: 40, borderRadius: 120 }}
        animate={{ opacity: 1, scale: 1, y: 0, borderRadius: 64 }}
        transition={{ type: 'spring', stiffness: 80, damping: 17 }}
        className={cn('relative overflow-hidden px-[clamp(1.5rem,5vw,5rem)] py-[clamp(2.5rem,6vw,5.5rem)]', CATEGORY_TINT[project.category])}
        aria-labelledby="project-title"
      >
        <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]">
          <div className="@container min-w-0">
            <div className="flex flex-wrap gap-2">
              <span className="sticker bg-paper text-ink">{project.status}</span>
              <span className="sticker border-current">{cat}</span>
              {story?.period && <span className="sticker border-current">{story.period}</span>}
            </div>
            <h1
              id="project-title"
              className="display mt-8 !text-current [overflow-wrap:anywhere]"
              // Le titre tient toujours dans sa colonne : la taille suit la largeur disponible et le mot le plus long.
              style={{ fontSize: `clamp(2rem, calc(100cqi / ${titleFit}), 9rem)` }}
            >
              {project.title}
            </h1>
            <p className="mt-6 max-w-xl text-[clamp(1.15rem,0.9rem+0.9vw,1.75rem)] leading-snug font-medium">{project.tagline}</p>
            <div className="mt-9 flex flex-wrap gap-3">
              {project.link && (
                <ShimmerButton
                  onClick={() => window.open(project.link, '_blank', 'noreferrer')}
                  background="#20211f"
                  shimmerColor="#d9f05a"
                  className="gap-2 px-7 py-3.5 text-sm font-semibold text-ink"
                >
                  {t.links.try}
                  <ArrowUpRight className="size-4" aria-hidden="true" />
                  <span className="sr-only">{t.links.newTab}</span>
                </ShimmerButton>
              )}
              {live && (
                <motion.button
                  type="button"
                  onClick={() => phoneStage.setOpen(true)}
                  whileHover={{ y: -3 }}
                  whileTap={{ scale: 0.94 }}
                  transition={{ type: 'spring', stiffness: 420, damping: 18 }}
                  className="inline-flex items-center gap-2 rounded-full bg-lemon px-7 py-3.5 text-sm font-bold text-paper"
                >
                  {t.project.play}
                </motion.button>
              )}
              {project.repo && (
                <motion.a
                  href={project.repo}
                  target="_blank"
                  rel="noreferrer"
                  whileHover={{ y: -3 }}
                  whileTap={{ scale: 0.94 }}
                  transition={{ type: 'spring', stiffness: 420, damping: 18 }}
                  className="inline-flex items-center gap-2 rounded-full border border-current px-6 py-3.5 text-sm font-semibold"
                >
                  <GithubIcon className="size-4" />
                  {t.links.code}
                  <span className="sr-only">{t.links.newTab}</span>
                </motion.a>
              )}
            </div>
          </div>
          {live ? (
            <button
              type="button"
              onClick={() => phoneStage.setOpen(true)}
              onPointerEnter={() => phoneStage.setHover(true)}
              onPointerLeave={() => phoneStage.setHover(false)}
              onFocus={() => phoneStage.setHover(true)}
              onBlur={() => phoneStage.setHover(false)}
              aria-label={t.project.play}
              className="relative mx-auto block aspect-[4/5] w-full max-w-[520px] cursor-pointer rounded-[48px] lg:aspect-square"
            >
              <Anchor kind="phone" layer="front" screen={live.screen} className="inset-0 w-full" par={0} />
              <span className="sticker pointer-events-none absolute right-0 bottom-[7%] rotate-[-5deg] bg-paper text-ink lg:-right-8">{t.project.tapPhone}</span>
            </button>
          ) : (
            project.shots[0] && (
              <div className={cn('mx-auto w-full', project.shots[0].frame === 'mobile' ? 'max-w-[300px]' : 'max-w-2xl')}>
                <ShotFrame shot={project.shots[0]} eager />
              </div>
            )
          )}
        </div>
      </motion.section>

      {/* 1. Pourquoi je l'ai créé */}
      <motion.section {...rise} className="mt-16 grid gap-6 md:mt-24 lg:grid-cols-[minmax(0,0.38fr)_minmax(0,1fr)] lg:gap-10" aria-labelledby="why-title">
        <h2 id="why-title" className="display text-[clamp(2rem,1rem+3vw,4rem)]">
          {t.project.why}
        </h2>
        <BigTile tone="paper" inner="md:!p-12">
          <p data-light className="text-[clamp(1.4rem,1rem+1.4vw,2.4rem)] leading-[1.18] font-medium tracking-[-0.02em]">
            {why}
          </p>
        </BigTile>
      </motion.section>

      {/* 2. Comment ça marche */}
      {how.length > 0 && (
        <motion.section {...rise} className="mt-16 md:mt-24" aria-labelledby="how-title">
          <h2 id="how-title" className="display text-[clamp(2rem,1rem+3vw,4rem)]">
            {t.project.how}
          </h2>
          <ol className={cn('mt-10 grid gap-4 md:gap-6', how.length >= 4 ? 'md:grid-cols-2' : how.length === 3 ? 'md:grid-cols-3' : 'md:grid-cols-2')}>
            {how.map((step, i) => (
              <li key={step}>
                <BigTile tone={STEP_TONES[i % STEP_TONES.length]} inner="flex flex-col gap-8 md:!p-10">
                  <span className="display text-[clamp(3rem,2rem+3vw,5.5rem)] opacity-30">{String(i + 1).padStart(2, '0')}</span>
                  <p className="text-lg leading-relaxed md:text-xl">{step}</p>
                </BigTile>
              </li>
            ))}
          </ol>
        </motion.section>
      )}

      {/* 3. Ce que j'ai décidé */}
      {story?.decisions && story.decisions.length > 0 && (
        <motion.section {...rise} className="mt-16 md:mt-24" aria-labelledby="dec-title">
          <h2 id="dec-title" className="display text-[clamp(2rem,1rem+3vw,4rem)]">
            {t.project.decisions}
          </h2>
          <ul className="mt-10 grid gap-3 md:gap-4">
            {story.decisions.map((d) => (
              <li key={d} className="flex gap-5 rounded-[36px] bg-graphite px-7 py-5 text-lg leading-snug transition-[background-color,transform] duration-300 hover:-translate-y-0.5 hover:bg-graphite-2 active:scale-[0.99] md:px-10 md:py-6">
                <span className="mt-2.5 size-2.5 shrink-0 rounded-full bg-signal" aria-hidden="true" />
                {d}
              </li>
            ))}
          </ul>
        </motion.section>
      )}

      {/* 4. Les preuves */}
      {story?.proof && story.proof.length > 0 && (
        <motion.section {...rise} className="mt-16 md:mt-24" aria-labelledby="proof-title">
          <h2 id="proof-title" className="display text-[clamp(2rem,1rem+3vw,4rem)]">
            {t.project.proof}
          </h2>
          <ul className="mt-10 grid gap-4 md:grid-cols-3 md:gap-6">
            {story.proof.map((p, i) => (
              <li key={p.label}>
                <BigTile tone={(['cobalt', 'vermilion', 'acid'] as Tone[])[i % 3]} inner="flex min-h-48 flex-col justify-between gap-8 md:!p-9">
                  <span className="label opacity-80">{p.label}</span>
                  <span className="display block text-[clamp(1.8rem,1.2rem+2vw,3.4rem)] leading-[1.02] break-words">{p.value}</span>
                </BigTile>
              </li>
            ))}
          </ul>
        </motion.section>
      )}

      {/* 5. Les écrans */}
      {project.shots.length > 0 && (
        <motion.section {...rise} className="mt-16 md:mt-24" aria-labelledby="shots-title">
          <h2 id="shots-title" className="display text-[clamp(2rem,1rem+3vw,4rem)]">
            {t.project.screens}
          </h2>
          {desktopShots.length > 0 && (
            <div className={cn('mt-10 grid gap-5 md:gap-8', desktopShots.length > 1 && 'md:grid-cols-2')}>
              {desktopShots.map((s) => (
                <div key={s.src} className="overflow-hidden rounded-[48px] bg-graphite-2 p-3 md:p-5">
                  <ShotFrame shot={s} />
                </div>
              ))}
            </div>
          )}
          {mobileShots.length > 0 && (
            <div className={cn('grid gap-5 md:gap-8', desktopShots.length > 0 && 'mt-5 md:mt-8', mobileShots.length === 1 ? 'max-w-sm' : 'grid-cols-2 md:grid-cols-3')}>
              {mobileShots.map((s) => (
                <div key={s.src} className="rounded-[48px] bg-graphite-2 p-4 md:p-6">
                  <ShotFrame shot={s} />
                </div>
              ))}
            </div>
          )}
        </motion.section>
      )}

      {/* 6. Sous le capot */}
      <motion.section {...rise} className="mt-16 md:mt-24" aria-labelledby="stack-title">
        <h2 id="stack-title" className="display text-[clamp(2rem,1rem+3vw,4rem)]">
          {t.project.stack}
        </h2>
        <ul className="mt-8 flex flex-wrap gap-3">
          {project.stack.map((s) => (
            <li key={s} className="rounded-full border border-paper px-5 py-2.5 text-sm font-semibold">
              {s}
            </li>
          ))}
        </ul>
      </motion.section>

      {/* 7. Et ensuite */}
      {story?.next && (
        <motion.section {...rise} className="mt-16 md:mt-24" aria-labelledby="next-title">
          <BigTile tone="acid" inner="md:!p-12">
            <h2 id="next-title" className="label opacity-80">
              {t.project.next}
            </h2>
            <p className="mt-5 max-w-3xl text-[clamp(1.25rem,1rem+1vw,2rem)] leading-snug font-medium">{story.next}</p>
          </BigTile>
        </motion.section>
      )}

      {/* Projet suivant */}
      <motion.div {...rise} className="mt-20 md:mt-28">
        <Link to={`/projets/${next.id}`} className="group block" aria-label={`${t.project.nextProject} : ${next.title}`}>
          <BigTile tone={nextTone} inner="flex flex-wrap items-end justify-between gap-6 md:!p-14">
            <span>
              <span className="label block opacity-80">{t.project.nextProject}</span>
              <span className="display mt-4 block text-[clamp(2.4rem,1rem+6vw,7rem)] !text-current">{next.title}</span>
            </span>
            <ArrowRight className="size-[clamp(2.5rem,5vw,5rem)] transition-transform duration-500 group-hover:translate-x-3" aria-hidden="true" />
          </BigTile>
        </Link>
      </motion.div>
    </main>
  )
}
