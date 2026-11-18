import { Link } from 'react-router'
import { ArrowUpRight, Download, MessageCircle } from 'lucide-react'
import { useContent } from '../../data/profile'
import { useT } from '../../i18n/useT'
import { usePageMeta } from '../../hooks/usePageMeta'

/** Accueil recruteur : une promesse en gros, trois chiffres, puis un sommaire de lignes vers les pages. */
export default function RecruiterHome() {
  const t = useT()
  const r = t.recruiter
  const { profile, impact } = useContent()
  usePageMeta(r.eyebrow, `${profile.name}, ${profile.role}. ${profile.availability}.`)
  const [role, ...tail] = t.hero.statement.split('. ')
  const summary = tail.join('. ')

  const rows = [
    { to: '/recruteur/parcours', ...r.tiles.path },
    { to: '/recruteur/projets', ...r.tiles.projects },
    { to: '/recruteur/competences', ...r.tiles.skills },
    { to: '/recruteur/agent', title: r.agentRow, hint: r.agentRowHint },
    { to: '/recruteur/contact', ...r.tiles.contact },
  ]

  return (
    <main className="relative z-0 mx-auto max-w-5xl px-[var(--gutter)] pt-10 pb-12 md:pt-20">
      <h1 className="display text-[clamp(2.8rem,1.2rem+7vw,6.4rem)] leading-[0.95] text-balance">{role}</h1>
      <p className="display mt-3 text-[clamp(1.4rem,1rem+1.8vw,2.4rem)] !text-signal">{profile.name}</p>
      <p className="mt-6 max-w-xl text-[clamp(1.05rem,1rem+0.4vw,1.3rem)] leading-snug text-mist">{summary}</p>
      <p className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-1 text-base font-semibold">
        <span className="inline-flex items-center gap-2.5">
          <span className="size-2.5 rounded-full bg-vermilion" aria-hidden="true" />
          {profile.availability}
        </span>
        <span className="font-normal text-mist">{profile.location}</span>
      </p>

      <div className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-3">
        <Link to="/recruteur/projets" className="pop inline-flex min-h-12 items-center bg-signal px-7 text-sm font-bold text-ink">
          {r.seeProjects} →
        </Link>
        <Link to="/recruteur/agent" className="hidden min-h-12 items-center gap-2 text-sm font-bold underline underline-offset-4 md:inline-flex">
          <MessageCircle className="size-4" aria-hidden="true" />
          {r.askAgent}
        </Link>
        <a href={profile.links.cv} download className="hidden min-h-12 items-center gap-2 text-sm font-bold underline underline-offset-4 md:inline-flex">
          <Download className="size-4" aria-hidden="true" />
          {r.cv}
        </a>
      </div>

      <ul className="mt-12 grid grid-cols-3 gap-4 border-y border-paper/20 py-6 md:mt-16">
        {impact.stats.slice(0, 3).map((s) => (
          <li key={s.label}>
            <span className="display block text-[clamp(1.8rem,1.2rem+3vw,3.6rem)] !text-signal tabular-nums">
              {s.prefix}
              {s.value}
              {s.suffix}
            </span>
            <span className="mt-1 block text-[13px] leading-tight text-mist md:text-sm">{s.label}</span>
          </li>
        ))}
      </ul>

      <ul>
        {rows.map((x) => (
          <li key={x.to} className="border-b border-paper/20">
            <Link to={x.to} className="group flex min-h-[4.5rem] items-center justify-between gap-4 py-4">
              <span className="display text-[clamp(1.6rem,1.1rem+2.4vw,3rem)] transition-transform duration-200 group-hover:translate-x-2">{x.title}</span>
              <span className="flex items-center gap-3 text-sm text-mist">
                <span className="hidden sm:inline">{x.hint}</span>
                <ArrowUpRight className="size-5 text-signal" aria-hidden="true" />
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  )
}
