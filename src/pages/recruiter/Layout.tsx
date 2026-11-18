import { useEffect } from 'react'
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router'
import { Download, Mail, MessageCircle } from 'lucide-react'
import { useContent } from '../../data/profile'
import { useT } from '../../i18n/useT'
import { setMode } from '../../lib/visitorMode'
import { LangSwitch } from '../../components/ui/LangSwitch'

/** Cadre commun des pages recruteur : menu texte en haut, barre d'actions fixe sur mobile, retour au haut à chaque changement de page. */
export default function RecruiterLayout() {
  const t = useT()
  const r = t.recruiter
  const { profile } = useContent()
  const navigate = useNavigate()
  const { pathname } = useLocation()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  const links = [
    { to: '/recruteur/parcours', label: r.tiles.path.title },
    { to: '/recruteur/projets', label: r.tiles.projects.title },
    { to: '/recruteur/competences', label: r.tiles.skills.title },
    { to: '/recruteur/contact', label: r.tiles.contact.title },
  ]

  return (
    <div className="min-h-svh bg-ink pb-28 text-paper md:pb-0">
      <header className="sticky top-0 z-40 bg-ink/90 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-[var(--gutter)] py-4">
          <Link to="/recruteur" className="text-[15px] font-semibold tracking-[-0.01em] whitespace-nowrap">
            {profile.name}
          </Link>
          <nav aria-label={r.eyebrow} className="flex items-center gap-5 text-[15px] font-medium">
            <span className="hidden items-center gap-5 md:flex">
              {links.map((l) => (
                <NavLink key={l.to} to={l.to} className={({ isActive }) => `underline-offset-4 hover:underline ${isActive ? 'text-signal underline' : ''}`}>
                  {l.label}
                </NavLink>
              ))}
            </span>
            <LangSwitch />
            <button
              type="button"
              onClick={() => {
                setMode('full')
                navigate('/')
              }}
              className="whitespace-nowrap underline underline-offset-4"
            >
              {r.full} →
            </button>
          </nav>
        </div>
      </header>

      <Outlet />

      <nav aria-label="Actions" className="fixed inset-x-0 bottom-0 z-50 grid grid-cols-3 gap-2 border-t border-paper/15 bg-ink/95 px-3 py-2.5 backdrop-blur md:hidden">
        <a href={profile.links.cv} download className="flex min-h-12 flex-col items-center justify-center gap-0.5 text-[12px] font-semibold">
          <Download className="size-5" aria-hidden="true" />
          CV
        </a>
        <Link to="/recruteur/agent" className="flex min-h-12 flex-col items-center justify-center gap-0.5 text-[12px] font-semibold">
          <MessageCircle className="size-5" aria-hidden="true" />
          Agent
        </Link>
        <a href={`mailto:${profile.email}`} className="flex min-h-12 flex-col items-center justify-center gap-0.5 rounded-2xl bg-signal text-[12px] font-bold text-ink">
          <Mail className="size-5" aria-hidden="true" />
          Contact
        </a>
      </nav>
    </div>
  )
}
