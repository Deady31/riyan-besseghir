import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { Link, useNavigate } from 'react-router'
import { AnimatePresence, motion } from 'motion/react'
import { ArrowUpRight, BriefcaseBusiness, ChevronDown, Download, FolderOpen, Hash, Mail, MessageCircle, UserRound, X } from 'lucide-react'
import { useContent } from '../data/profile'
import { useT } from '../i18n/useT'
import { useProjects } from '../i18n/useProjects'
import { setMode } from '../lib/visitorMode'
import { usePageMeta } from '../hooks/usePageMeta'
import { LangSwitch } from '../components/ui/LangSwitch'

const CHATBOT_URL = 'https://riyan-cv-chatbot.vercel.app'
/** Sélection « à la une » : l'agent, l'app la plus aboutie, un agent en production et des cas de PM livrés. */
const FEATURED = ['chatbot-cv', 'fooder', 'lio', 'departs', 'qg-hermes', 'spotify', 'tiktok-shop', 'trainer-pm']

type PanelId = 'path' | 'numbers' | 'projects' | 'skills' | 'contact' | 'agent'

const h2 = 'display text-[clamp(1.6rem,1.2rem+1.4vw,2.4rem)]'
const cardCls = 'rounded-[24px] border-[2.5px] border-[#2B0F3A] bg-ink p-5 shadow-[var(--shadow-card)]'

/** Fenêtre qui s'ouvre au clic : feuille depuis le bas sur mobile, fenêtre centrée sur ordinateur. Échap, clic dehors et bouton ferment. */
function Sheet({ title, onClose, closeLabel, children }: { title: string; onClose: () => void; closeLabel: string; children: ReactNode }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [onClose])
  return (
    <motion.div
      className="fixed inset-0 z-[60] flex items-end justify-center bg-[#2B0F3A]/55 md:items-center md:p-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.18 }}
      onClick={onClose}
    >
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="flex max-h-[88svh] w-full max-w-3xl flex-col rounded-t-[32px] border-[3px] border-[#2B0F3A] bg-ink shadow-[var(--shadow-card)] md:rounded-[32px]"
        initial={{ y: 48, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 48, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 320, damping: 32 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-4 border-b border-paper/15 px-5 py-4 md:px-7">
          <h2 className={h2}>{title}</h2>
          <button type="button" onClick={onClose} aria-label={closeLabel} className="grid size-11 shrink-0 place-items-center rounded-full border-2 border-paper">
            <X className="size-5" aria-hidden="true" />
          </button>
        </div>
        <div className="overflow-y-auto overscroll-contain px-5 py-5 md:px-7 md:py-6">{children}</div>
      </motion.div>
    </motion.div>
  )
}

/**
 * Version recruteur : un seul écran avec des entrées claires. Chaque tuile ouvre une fenêtre (projets, parcours, chiffres…),
 * rien à scroller. Tout vient des données du portfolio : aucun contenu écrit à part.
 */
export default function Recruiter() {
  const t = useT()
  const r = t.recruiter
  const { profile, impact, feats } = useContent()
  const { projects, categories } = useProjects()
  const navigate = useNavigate()
  const [panel, setPanel] = useState<PanelId | null>(null)
  const [chat, setChat] = useState(false)
  const [toast, setToast] = useState(false)
  const [filter, setFilter] = useState<string>('featured')
  const [openProject, setOpenProject] = useState<string | null>(null)
  const [openXp, setOpenXp] = useState<'hack' | 'ship' | null>('ship')
  usePageMeta(r.eyebrow, `${profile.name}, ${profile.role}. ${profile.availability}.`)

  const [role, ...tail] = t.hero.statement.split('. ')
  const summary = tail.join('. ')
  const h = feats.hackathon
  const facts = t.about.facts.filter(([k]) => !/^(Âge|Age)$/.test(k))
  const close = () => setPanel(null)

  const list = useMemo(() => {
    if (filter === 'featured') return FEATURED.map((id) => projects.find((p) => p.id === id)).filter((p): p is NonNullable<typeof p> => Boolean(p))
    return projects.filter((p) => p.category === filter)
  }, [filter, projects])

  const toFull = () => {
    setMode('full')
    navigate('/')
  }
  const copyQuestion = (q: string) => {
    navigator.clipboard?.writeText(q).catch(() => undefined)
    setChat(true)
    setToast(true)
    window.setTimeout(() => setToast(false), 2600)
  }
  const period = impact.product.facts.find(([k]) => /^(Période|Period)$/.test(k))?.[1]

  const tiles: { id: PanelId; icon: ReactNode; title: string; hint: string }[] = [
    { id: 'path', icon: <BriefcaseBusiness className="size-6" aria-hidden="true" />, ...r.tiles.path },
    { id: 'numbers', icon: <Hash className="size-6" aria-hidden="true" />, ...r.tiles.numbers },
    { id: 'projects', icon: <FolderOpen className="size-6" aria-hidden="true" />, ...r.tiles.projects },
    { id: 'skills', icon: <UserRound className="size-6" aria-hidden="true" />, ...r.tiles.skills },
    { id: 'contact', icon: <Mail className="size-6" aria-hidden="true" />, ...r.tiles.contact },
  ]

  return (
    <div className="min-h-svh bg-ink pb-28 text-paper md:pb-0">
      <header className="sticky top-0 z-40 border-b border-paper/15 bg-ink/90 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-[var(--gutter)] py-3">
          <span className="flex items-center gap-2 text-sm font-semibold">
            <span className="grid size-9 place-items-center rounded-full border border-paper font-bold" aria-hidden="true">
              R
            </span>
            <span className="hidden sm:inline">riyan.world</span>
            <span className="label ml-2 hidden text-mist md:inline">{r.eyebrow}</span>
          </span>
          <div className="flex items-center gap-3">
            <LangSwitch />
            <button type="button" onClick={toFull} className="pop min-h-11 bg-paper px-4 text-sm font-semibold whitespace-nowrap text-ink">
              {r.full} →
            </button>
          </div>
        </div>
      </header>

      <main className="relative z-0 mx-auto max-w-5xl px-[var(--gutter)] pt-8 pb-10 md:pt-14">
        <p className="label text-mist">{r.eyebrow}</p>
        <h1 className="display mt-2 text-[clamp(2.6rem,1.4rem+5vw,5.2rem)]">{profile.name}</h1>
        <p className="display text-[clamp(1.5rem,1rem+2vw,2.6rem)] !text-signal">{role}</p>
        <p className="mt-4 max-w-2xl text-[clamp(1.05rem,1rem+0.4vw,1.3rem)] leading-snug">{summary}</p>
        <p className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-base font-semibold">
          <span className="inline-flex items-center gap-2.5">
            <span className="size-2.5 rounded-full bg-vermilion" aria-hidden="true" />
            {profile.availability}
          </span>
          <span className="font-normal text-mist">{profile.location}</span>
        </p>

        <div className="mt-6 flex flex-wrap gap-3">
          <button type="button" onClick={() => setPanel('projects')} className="pop min-h-12 bg-signal px-6 text-sm font-bold text-ink">
            {r.seeProjects} →
          </button>
          <button type="button" onClick={() => setPanel('agent')} className="pop inline-flex min-h-12 items-center gap-2 bg-[#EADFFF] px-6 text-sm font-bold text-paper max-md:hidden">
            <MessageCircle className="size-4" aria-hidden="true" />
            {r.askAgent}
          </button>
          <a href={profile.links.cv} download className="pop inline-flex min-h-12 items-center gap-2 bg-paper px-6 text-sm font-bold text-ink max-md:hidden">
            <Download className="size-4" aria-hidden="true" />
            {r.cv}
          </a>
        </div>

        <h2 className="display mt-10 text-[clamp(1.3rem,1rem+1vw,1.8rem)]">{r.ask}</h2>
        <ul className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-5">
          {tiles.map((x) => (
            <li key={x.id}>
              <button
                type="button"
                onClick={() => setPanel(x.id)}
                className="group flex h-full min-h-[8.5rem] w-full flex-col justify-between rounded-[24px] border-[2.5px] border-[#2B0F3A] bg-[#EADFFF] p-4 text-left shadow-[var(--shadow-card)] transition-transform duration-200 hover:-translate-y-1 focus-visible:-translate-y-1"
              >
                <span className="text-signal">{x.icon}</span>
                <span>
                  <span className="display block text-[1.25rem]">{x.title}</span>
                  <span className="mt-0.5 block text-[13px] leading-tight text-mist">{x.hint}</span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      </main>

      {/* Barre d'actions fixe sur mobile : les trois choses qu'un recruteur cherche, toujours sous le pouce. */}
      <nav aria-label={r.eyebrow} className="fixed inset-x-0 bottom-0 z-50 grid grid-cols-3 gap-2 border-t border-paper/15 bg-ink/95 px-3 py-2.5 backdrop-blur md:hidden">
        <a href={profile.links.cv} download className="flex min-h-12 flex-col items-center justify-center gap-0.5 text-[12px] font-semibold">
          <Download className="size-5" aria-hidden="true" />
          CV
        </a>
        <button type="button" onClick={() => setPanel('agent')} className="flex min-h-12 flex-col items-center justify-center gap-0.5 text-[12px] font-semibold">
          <MessageCircle className="size-5" aria-hidden="true" />
          Agent
        </button>
        <a href={`mailto:${profile.email}`} className="flex min-h-12 flex-col items-center justify-center gap-0.5 rounded-2xl bg-signal text-[12px] font-bold text-ink">
          <Mail className="size-5" aria-hidden="true" />
          Contact
        </a>
      </nav>

      <AnimatePresence>
        {panel === 'path' && (
          <Sheet key="path" title={r.pathTitle} onClose={close} closeLabel={r.close}>
            <div className="space-y-4">
              {([
                { id: 'ship' as const, date: period, title: impact.company, sub: impact.context, role: impact.role },
                { id: 'hack' as const, date: `${h.date} · ${h.duration}`, title: t.feats.label, sub: h.event, role: h.role },
              ]).map((x) => (
                <article key={x.id} className={cardCls}>
                  <button type="button" onClick={() => setOpenXp(openXp === x.id ? null : x.id)} aria-expanded={openXp === x.id} className="flex w-full items-start justify-between gap-4 text-left">
                    <span>
                      <span className="label text-mist">{x.date}</span>
                      <span className="display mt-1 block text-[1.5rem]">{x.title}</span>
                      <span className="block text-sm text-mist">{x.sub}</span>
                      <span className="mt-2 block font-semibold">{x.role}</span>
                    </span>
                    <ChevronDown className={`mt-2 size-5 shrink-0 transition-transform ${openXp === x.id ? 'rotate-180' : ''}`} aria-hidden="true" />
                  </button>
                  {openXp === x.id && x.id === 'ship' && (
                    <div className="mt-4 space-y-3 border-t border-paper/15 pt-4">
                      {impact.features.map((f) => (
                        <p key={f.name} className="leading-snug">
                          <span className="font-semibold">{f.name}.</span> {f.text}
                        </p>
                      ))}
                      <p className="text-sm">
                        <span className="font-semibold">{impact.roadmap.title}</span> · {impact.roadmap.badge}
                        <span className="text-mist"> : {impact.roadmap.items.map((i) => i.name).join(', ')}.</span>
                      </p>
                    </div>
                  )}
                  {openXp === x.id && x.id === 'hack' && (
                    <div className="mt-4 space-y-3 border-t border-paper/15 pt-4">
                      <p className="leading-snug">{h.brief}</p>
                      <ul className="space-y-2">
                        {h.delivered.map((d) => (
                          <li key={d} className="flex gap-3 leading-snug">
                            <span className="mt-2 size-2 shrink-0 rounded-full bg-signal" aria-hidden="true" />
                            {d}
                          </li>
                        ))}
                      </ul>
                      <p className="text-sm text-mist">{h.outcome}</p>
                    </div>
                  )}
                </article>
              ))}
            </div>
          </Sheet>
        )}

        {panel === 'numbers' && (
          <Sheet key="numbers" title={`${r.numbersTitle} · ${impact.company}`} onClose={close} closeLabel={r.close}>
            <ul className="grid grid-cols-2 gap-3">
              {impact.stats.map((s) => (
                <li key={s.label}>
                  <button
                    type="button"
                    onClick={() => {
                      setOpenXp('ship')
                      setPanel('path')
                    }}
                    className={`${cardCls} h-full w-full text-left transition-transform hover:-translate-y-1`}
                  >
                    <span className="display block text-[clamp(2rem,1.4rem+2vw,3rem)] !text-signal tabular-nums">
                      {s.prefix}
                      {s.value}
                      {s.suffix}
                    </span>
                    <span className="mt-1 block font-semibold leading-tight">{s.label}</span>
                    <span className="mt-1 block text-sm leading-snug text-mist">{s.note}</span>
                  </button>
                </li>
              ))}
            </ul>
            <p className="mt-4 text-sm text-mist">{r.numbersMore} ↑</p>
          </Sheet>
        )}

        {panel === 'projects' && (
          <Sheet key="projects" title={r.projectsTitle} onClose={close} closeLabel={r.close}>
            <div role="tablist" aria-label={r.projectsTitle} className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-3">
              {[{ id: 'featured', label: r.featured }, ...categories.map((c) => ({ id: c.id as string, label: c.label }))].map((c) => (
                <button
                  key={c.id}
                  type="button"
                  role="tab"
                  aria-selected={filter === c.id}
                  onClick={() => {
                    setFilter(c.id)
                    setOpenProject(null)
                  }}
                  className={`min-h-11 shrink-0 rounded-full border-2 border-[#2B0F3A] px-4 text-sm font-semibold ${filter === c.id ? 'bg-signal text-ink' : 'bg-ink'}`}
                >
                  {c.label}
                </button>
              ))}
            </div>
            <ul className="space-y-3">
              {list.map((p) => (
                <li key={p.id} className={cardCls}>
                  <button type="button" onClick={() => setOpenProject(openProject === p.id ? null : p.id)} aria-expanded={openProject === p.id} className="flex w-full items-start justify-between gap-3 text-left">
                    <span>
                      <span className="sticker bg-lemon text-paper">{p.status}</span>
                      <span className="display mt-2 block text-[1.35rem]">{p.title}</span>
                      <span className="mt-0.5 block text-sm leading-snug">{p.tagline}</span>
                    </span>
                    <ChevronDown className={`mt-2 size-5 shrink-0 transition-transform ${openProject === p.id ? 'rotate-180' : ''}`} aria-hidden="true" />
                  </button>
                  {openProject === p.id && (
                    <div className="mt-3 space-y-3 border-t border-paper/15 pt-3">
                      <p className="leading-snug">{p.description}</p>
                      <p className="text-sm text-mist">{p.stack.join(' · ')}</p>
                      <p className="flex flex-wrap gap-3 text-sm font-semibold">
                        {p.link && (
                          <a href={p.link} target="_blank" rel="noreferrer" className="pop inline-flex min-h-11 items-center gap-1.5 bg-signal px-4 text-ink">
                            {r.live}
                            <ArrowUpRight className="size-4" aria-hidden="true" />
                          </a>
                        )}
                        <Link to={`/projets/${p.id}`} className="inline-flex min-h-11 items-center underline underline-offset-4">
                          {r.fiche}
                        </Link>
                        {p.repo && (
                          <a href={p.repo} target="_blank" rel="noreferrer" className="inline-flex min-h-11 items-center underline underline-offset-4">
                            {r.repo}
                          </a>
                        )}
                      </p>
                    </div>
                  )}
                </li>
              ))}
            </ul>
            <p className="mt-5">
              <button type="button" onClick={toFull} className="text-sm font-semibold underline underline-offset-4">
                {r.projectsAll(projects.length)} →
              </button>
            </p>
          </Sheet>
        )}

        {panel === 'skills' && (
          <Sheet key="skills" title={r.skillsTitle} onClose={close} closeLabel={r.close}>
            <dl className="grid gap-x-8 gap-y-4 sm:grid-cols-[9rem_1fr]">
              {facts.map(([k, v]) => (
                <div key={k} className="contents">
                  <dt className="label text-mist">{k}</dt>
                  <dd className="font-semibold">{v}</dd>
                </div>
              ))}
            </dl>
          </Sheet>
        )}

        {panel === 'contact' && (
          <Sheet key="contact" title={r.contactTitle} onClose={close} closeLabel={r.close}>
            <p className="mb-5 flex items-center gap-2.5 font-semibold">
              <span className="size-2.5 rounded-full bg-vermilion" aria-hidden="true" />
              {profile.availability} <span className="font-normal text-mist">· {profile.location}</span>
            </p>
            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <a href={`mailto:${profile.email}`} className="pop inline-flex min-h-12 items-center justify-center gap-2 bg-signal px-6 text-sm font-bold text-ink">
                <Mail className="size-4" aria-hidden="true" />
                {profile.email}
              </a>
              <a href={profile.links.linkedin} target="_blank" rel="noreferrer" className="pop inline-flex min-h-12 items-center justify-center bg-paper px-6 text-sm font-bold text-ink">
                LinkedIn
              </a>
              <a href={profile.links.github} target="_blank" rel="noreferrer" className="pop inline-flex min-h-12 items-center justify-center bg-paper px-6 text-sm font-bold text-ink">
                GitHub
              </a>
              <a href={profile.links.cv} download className="pop inline-flex min-h-12 items-center justify-center gap-2 bg-[#EADFFF] px-6 text-sm font-bold text-paper">
                <Download className="size-4" aria-hidden="true" />
                {r.cv}
              </a>
            </div>
          </Sheet>
        )}

        {panel === 'agent' && (
          <Sheet key="agent" title={r.agentTitle} onClose={close} closeLabel={r.close}>
            <p className="max-w-2xl leading-snug">{r.agentText}</p>
            <ul className="mt-4 flex flex-wrap gap-2">
              {r.agentQuestions.map((q) => (
                <li key={q}>
                  <button type="button" onClick={() => copyQuestion(q)} className="min-h-11 rounded-2xl border-2 border-[#2B0F3A] bg-[#EADFFF] px-4 py-2 text-left text-sm font-semibold">
                    {q}
                  </button>
                </li>
              ))}
            </ul>
            {toast && (
              <p role="status" className="mt-3 text-sm font-semibold text-signal">
                {r.agentCopied}
              </p>
            )}
            {chat ? (
              <iframe src={CHATBOT_URL} title="Méca-Riyan" allow="clipboard-read; clipboard-write" className="mt-4 h-[26rem] w-full rounded-2xl border-2 border-[#2B0F3A] bg-white" />
            ) : (
              <button type="button" onClick={() => setChat(true)} className="pop mt-5 min-h-12 bg-signal px-6 text-sm font-bold text-ink">
                {r.agentStart}
              </button>
            )}
            <p className="mt-4">
              <a href={CHATBOT_URL} target="_blank" rel="noreferrer" className="inline-flex min-h-11 items-center gap-1.5 text-sm font-semibold underline underline-offset-4">
                {r.agentOpen}
                <ArrowUpRight className="size-4" aria-hidden="true" />
              </a>
            </p>
          </Sheet>
        )}
      </AnimatePresence>
    </div>
  )
}
