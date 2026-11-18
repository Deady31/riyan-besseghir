import { lazy, Suspense, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router'
import { ArrowUpRight } from 'lucide-react'
import { useProjects } from '../../i18n/useProjects'
import { useT } from '../../i18n/useT'
import { setMode } from '../../lib/visitorMode'
import { Page } from './Page'

const BankDemo = lazy(() => import('../../components/demo/BankDemo').then((m) => ({ default: m.BankDemo })))

/** Sélection « à la une » : l'agent, l'app la plus aboutie, un agent en production et des cas de PM livrés. */
const FEATURED = ['chatbot-cv', 'fooder', 'lio', 'assistant-bancaire', 'qg-hermes', 'spotify', 'tiktok-shop', 'trainer-pm']

/** Grille de cartes avec image, comme dans le portfolio complet ; filtres par famille. Un clic ouvre la fiche (page à part, avec retour). */
export function ProjectsList() {
  const t = useT()
  const r = t.recruiter
  const { projects, categories } = useProjects()
  const [filter, setFilter] = useState('featured')

  const list = useMemo(
    () =>
      filter === 'featured'
        ? FEATURED.map((id) => projects.find((p) => p.id === id)).filter((p): p is NonNullable<typeof p> => Boolean(p))
        : projects.filter((p) => p.category === filter),
    [filter, projects],
  )

  return (
    <Page title={r.projectsTitle}>
      <div role="tablist" aria-label={r.projectsTitle} className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-4">
        {[{ id: 'featured', label: r.featured }, ...categories.map((c) => ({ id: c.id as string, label: c.label }))].map((c) => (
          <button
            key={c.id}
            type="button"
            role="tab"
            aria-selected={filter === c.id}
            onClick={() => setFilter(c.id)}
            className={`min-h-11 shrink-0 rounded-full border-2 border-[#2B0F3A] px-4 text-sm font-semibold ${filter === c.id ? 'bg-signal text-ink' : 'bg-ink'}`}
          >
            {c.label}
          </button>
        ))}
      </div>
      <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {list.map((p) => (
          <li key={p.id}>
            <Link
              to={`/recruteur/projets/${p.id}`}
              className="group block h-full overflow-hidden rounded-[24px] border-[2.5px] border-[#2B0F3A] bg-ink shadow-[var(--shadow-card)] transition-transform duration-200 hover:-translate-y-1"
            >
              {p.shots[0] ? (
                <img src={p.shots[0].src} alt={p.shots[0].alt} loading="lazy" className="aspect-[4/3] w-full bg-[#EADFFF] object-cover object-top" />
              ) : (
                <div className="aspect-[4/3] w-full bg-[#EADFFF]" aria-hidden="true" />
              )}
              <div className="p-4">
                <span className="sticker bg-lemon text-paper">{p.status}</span>
                <h2 className="display mt-2 line-clamp-2 min-h-[2.04em] text-[1.3rem]" style={{ lineHeight: 1.02 }}>{p.title}</h2>
                <p className="mt-1 line-clamp-2 min-h-[2.75em] text-sm leading-snug">{p.tagline}</p>
              </div>
            </Link>
          </li>
        ))}
      </ul>
      <p className="mt-8">
        <Link to="/" onClick={() => setMode('full')} className="text-sm font-semibold underline underline-offset-4">
          {r.projectsAll(projects.length)} →
        </Link>
      </p>
    </Page>
  )
}

/** Fiche d'un projet : image, description, technos, liens. Retour vers la liste. */
export function ProjectDetail() {
  const r = useT().recruiter
  const { id } = useParams()
  const { byId } = useProjects()
  const p = id ? byId(id) : undefined
  if (!p)
    return (
      <Page title={r.projectsTitle} back="/recruteur/projets">
        <Link to="/recruteur/projets" className="underline">
          {r.back}
        </Link>
      </Page>
    )
  return (
    <Page title={p.title} back="/recruteur/projets">
      <span className="sticker bg-lemon text-paper">{p.status}</span>
      <p className="mt-4 max-w-2xl text-xl leading-snug">{p.tagline}</p>
      {p.shots[0] && (
        <img src={p.shots[0].src} alt={p.shots[0].alt} className="mt-8 max-h-[32rem] w-full rounded-[24px] border-[2.5px] border-[#2B0F3A] bg-[#EADFFF] object-cover object-top" />
      )}
      <p className="mt-8 max-w-2xl leading-relaxed">{p.description}</p>
      {p.id === 'assistant-bancaire' && (
        <div className="mt-8">
          <Suspense fallback={null}>
            <BankDemo />
          </Suspense>
        </div>
      )}
      <p className="mt-5 text-sm text-mist">{p.stack.join(' · ')}</p>
      <p className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm font-semibold">
        {p.link && (
          <a href={p.link} target="_blank" rel="noreferrer" className="pop inline-flex min-h-12 items-center gap-1.5 bg-signal px-6 font-bold text-ink">
            {r.live}
            <ArrowUpRight className="size-4" aria-hidden="true" />
          </a>
        )}
        {p.repo && (
          <a href={p.repo} target="_blank" rel="noreferrer" className="inline-flex min-h-11 items-center underline underline-offset-4">
            {r.repo}
          </a>
        )}
        <Link to={`/projets/${p.id}`} onClick={() => setMode('full')} className="inline-flex min-h-11 items-center underline underline-offset-4">
          {r.fiche}
        </Link>
      </p>
    </Page>
  )
}
