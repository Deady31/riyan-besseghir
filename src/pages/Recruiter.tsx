import { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { ArrowUpRight, Download, Mail } from 'lucide-react'
import { useContent } from '../data/profile'
import { useT } from '../i18n/useT'
import { useProjects } from '../i18n/useProjects'
import { setMode } from '../lib/visitorMode'
import { usePageMeta } from '../hooks/usePageMeta'
import { LangSwitch } from '../components/ui/LangSwitch'

const CHATBOT_URL = 'https://riyan-cv-chatbot.vercel.app'
/** Projets montrés ici : le chatbot, l'appli la plus aboutie et un agent en production. Le reste est dans le portfolio complet. */
const PROJECT_IDS = ['chatbot-cv', 'fooder', 'lio'] as const

const card = 'rounded-[28px] border-[2.5px] border-[#2B0F3A] bg-ink p-6 shadow-[var(--shadow-card)] md:p-8'
const h2 = 'display text-[clamp(1.6rem,1.2rem+1.4vw,2.4rem)]'

/**
 * Version recruteur : une page, du plus important au moins important, sans 3D ni animation lourde, imprimable.
 * Tout vient des données du portfolio (profil, expériences, projets) : rien n'est écrit à part.
 */
export default function Recruiter() {
  const t = useT()
  const r = t.recruiter
  const { profile, impact, feats } = useContent()
  const { byId, projects } = useProjects()
  const navigate = useNavigate()
  const [chat, setChat] = useState(false)
  usePageMeta(r.eyebrow, `${profile.name}, ${profile.role}. ${profile.availability}.`)

  const [role, ...tail] = t.hero.statement.split('. ')
  const summary = tail.join('. ')
  const h = feats.hackathon
  const shown = PROJECT_IDS.map((id) => byId(id)).filter((p): p is NonNullable<typeof p> => Boolean(p))
  const facts = t.about.facts.filter(([k]) => !/^(Âge|Age)$/.test(k))

  const toFull = () => {
    setMode('full')
    navigate('/')
  }

  return (
    <div className="min-h-svh bg-ink text-paper print:bg-white">
      <header className="no-print sticky top-0 z-20 border-b border-paper/15 bg-ink/90 backdrop-blur">
        <div className="mx-auto flex max-w-4xl items-center justify-between gap-3 px-[var(--gutter)] py-3">
          <span className="flex items-center gap-2 text-sm font-semibold">
            <span className="grid size-9 place-items-center rounded-full border border-paper font-bold" aria-hidden="true">
              R
            </span>
            <span className="hidden sm:inline">riyan.world</span>
            <span className="label ml-2 hidden text-mist md:inline">{r.eyebrow}</span>
          </span>
          <div className="flex items-center gap-3">
            <LangSwitch />
            <button type="button" onClick={toFull} className="pop bg-paper px-4 py-2 text-sm font-semibold whitespace-nowrap text-ink">
              {r.full} →
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl space-y-14 px-[var(--gutter)] pt-10 pb-20 md:space-y-20 md:pt-16">
        <section aria-labelledby="top">
          <p className="label text-mist">{r.eyebrow}</p>
          <h1 id="top" className="display mt-3 text-[clamp(2.6rem,1.4rem+5vw,5.2rem)]">
            {profile.name}
          </h1>
          <p className="display mt-2 text-[clamp(1.5rem,1rem+2vw,2.6rem)] !text-signal">{role}</p>
          <p className="mt-5 max-w-2xl text-[clamp(1.1rem,1rem+0.5vw,1.4rem)] leading-snug">{summary}</p>
          <p className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 text-lg font-semibold">
            <span className="inline-flex items-center gap-2.5">
              <span className="size-2.5 rounded-full bg-vermilion" aria-hidden="true" />
              {profile.availability}
            </span>
            <span className="font-normal text-mist">{profile.location}</span>
          </p>
          <p className="no-print mt-7 flex flex-wrap gap-3">
            <a href={`mailto:${profile.email}`} className="pop inline-flex items-center gap-2 bg-signal px-6 py-3 text-sm font-bold text-ink">
              <Mail className="size-4" aria-hidden="true" />
              {profile.email}
            </a>
            <a href={profile.links.cv} download className="pop inline-flex items-center gap-2 bg-paper px-6 py-3 text-sm font-bold text-ink">
              <Download className="size-4" aria-hidden="true" />
              {r.cv}
            </a>
          </p>
        </section>

        <section aria-labelledby="ask" className="no-print">
          <div className={`${card} !bg-[#EADFFF]`}>
            <p className="label text-mist">{r.askEyebrow}</p>
            <h2 id="ask" className={`${h2} mt-2`}>
              {r.askTitle}
            </h2>
            <p className="mt-3 max-w-2xl text-lg leading-snug">{r.askText}</p>
            {chat ? (
              <iframe
                src={CHATBOT_URL}
                title="Méca-Riyan"
                allow="clipboard-write"
                className="mt-6 h-[34rem] w-full rounded-2xl border-2 border-[#2B0F3A] bg-white"
              />
            ) : (
              <button type="button" onClick={() => setChat(true)} className="pop mt-6 bg-signal px-6 py-3 text-sm font-bold text-ink">
                {r.askCta}
              </button>
            )}
            <p className="mt-4">
              <a href={CHATBOT_URL} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-sm font-semibold underline underline-offset-4">
                {r.askOpen}
                <ArrowUpRight className="size-4" aria-hidden="true" />
              </a>
            </p>
          </div>
        </section>

        <section aria-labelledby="numbers">
          <h2 id="numbers" className={h2}>
            {r.numbers} <span className="text-mist">· {impact.company}</span>
          </h2>
          <ul className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">
            {impact.stats.map((s) => (
              <li key={s.label} className={`${card} !p-5`}>
                <span className="display block text-[clamp(2rem,1.4rem+2vw,3rem)] !text-signal tabular-nums">
                  {s.prefix}
                  {s.value}
                  {s.suffix}
                </span>
                <span className="mt-1 block font-semibold leading-tight">{s.label}</span>
                <span className="mt-1 block text-sm leading-snug text-mist">{s.note}</span>
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="xp" className="space-y-6">
          <h2 id="xp" className={h2}>
            {r.experience}
          </h2>

          <article className={card}>
            <p className="label text-mist">
              {h.date} · {h.duration}
            </p>
            <h3 className="display mt-2 text-[clamp(1.3rem,1.1rem+0.8vw,1.8rem)]">{t.feats.label}</h3>
            <p className="mt-1 text-sm text-mist">{h.event}</p>
            <p className="mt-4 font-semibold">{h.role}</p>
            <p className="mt-2 max-w-2xl leading-snug">{h.brief}</p>
            <ul className="mt-4 space-y-2">
              {h.delivered.map((d) => (
                <li key={d} className="flex gap-3 leading-snug">
                  <span className="mt-2 size-2 shrink-0 rounded-full bg-signal" aria-hidden="true" />
                  {d}
                </li>
              ))}
            </ul>
            <p className="mt-4 text-sm text-mist">{h.outcome}</p>
          </article>

          <article className={card}>
            <p className="label text-mist">{impact.product.facts.find(([k]) => /^(Période|Period)$/.test(k))?.[1]}</p>
            <h3 className="display mt-2 text-[clamp(1.3rem,1.1rem+0.8vw,1.8rem)]">{impact.company}</h3>
            <p className="mt-1 text-sm text-mist">{impact.context}</p>
            <p className="mt-4 font-semibold">{impact.role}</p>
            <ul className="mt-4 space-y-3">
              {impact.features.map((f) => (
                <li key={f.name} className="leading-snug">
                  <span className="font-semibold">{f.name}.</span> {f.text}
                </li>
              ))}
            </ul>
            <p className="mt-5 text-sm">
              <span className="font-semibold">{impact.roadmap.title}</span> · {impact.roadmap.badge}
              <span className="text-mist"> : {impact.roadmap.items.map((i) => i.name).join(', ')}.</span>
            </p>
          </article>
        </section>

        <section aria-labelledby="projects">
          <h2 id="projects" className={h2}>
            {r.projects}
          </h2>
          <ul className="mt-6 grid gap-4 md:grid-cols-3">
            {shown.map((p) => (
              <li key={p.id} className={`${card} flex flex-col !p-5`}>
                <span className="sticker self-start bg-lemon text-paper">{p.status}</span>
                <h3 className="display mt-3 text-[1.5rem]">{p.title}</h3>
                <p className="mt-1 flex-1 text-sm leading-snug">{p.tagline}</p>
                <p className="no-print mt-4 flex flex-wrap gap-x-4 gap-y-1 text-sm font-semibold">
                  <Link to={`/projets/${p.id}`} className="underline underline-offset-4">
                    {r.fiche}
                  </Link>
                  {p.link && (
                    <a href={p.link} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 underline underline-offset-4">
                      {r.live}
                      <ArrowUpRight className="size-3.5" aria-hidden="true" />
                    </a>
                  )}
                </p>
              </li>
            ))}
          </ul>
          <p className="no-print mt-5">
            <button type="button" onClick={toFull} className="text-sm font-semibold underline underline-offset-4">
              {r.projectsAll(projects.length)} →
            </button>
          </p>
        </section>

        <section aria-labelledby="tools">
          <h2 id="tools" className={h2}>
            {r.profile}
          </h2>
          <dl className="mt-5 grid gap-x-8 gap-y-3 sm:grid-cols-[10rem_1fr]">
            {facts.map(([k, v]) => (
              <div key={k} className="contents">
                <dt className="label text-mist">{k}</dt>
                <dd className="font-semibold">{v}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section aria-labelledby="contact" className="border-t border-paper/20 pt-10">
          <h2 id="contact" className={h2}>
            {r.contact}
          </h2>
          <p className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-lg font-semibold">
            <a href={`mailto:${profile.email}`} className="underline underline-offset-4">
              {profile.email}
            </a>
            <a href={profile.links.linkedin} target="_blank" rel="noreferrer" className="underline underline-offset-4">
              LinkedIn
            </a>
            <a href={profile.links.github} target="_blank" rel="noreferrer" className="underline underline-offset-4">
              GitHub
            </a>
            <a href={profile.links.cv} download className="no-print underline underline-offset-4">
              {r.cv}
            </a>
          </p>
        </section>
      </main>
    </div>
  )
}
