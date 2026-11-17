import { useCallback, useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router'
import { AnimatePresence, motion } from 'motion/react'
import { X } from 'lucide-react'
import { scrollToId, useLenis } from '../../lib/SmoothScroll'
import { cn } from '../../lib/cn'
import { useT } from '../../i18n/useT'
import { useLang } from '../../i18n/LangProvider'
import { CHAPTERS } from '../../data/chapters'
import { useActiveChapter } from '../../hooks/useActiveChapter'
import { LangSwitch } from '../ui/LangSwitch'

/**
 * Barre du haut épurée : le logo, un seul bouton « Menu » qui affiche le chapitre en cours, la langue et le contact.
 * Le menu ouvre l'index complet des chapitres en grand, avec leur numéro : une seule liste, la même que le rail de gauche,
 * qui ne casse plus en deux lignes quand l'écran se resserre.
 */
export function Nav() {
  const lenis = useLenis()
  const t = useT()
  const { lang } = useLang()
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const home = pathname === '/'
  const active = useActiveChapter(home)
  const closeRef = useRef<HTMLButtonElement>(null)
  const opener = useRef<HTMLButtonElement>(null)
  const label = (c: (typeof CHAPTERS)[number]) => (lang === 'en' ? c.en : c.fr)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const go = useCallback(
    (id: string) => {
      if (!home) {
        sessionStorage.setItem('scrollTo', id)
        navigate('/')
        return
      }
      scrollToId(lenis, id)
    },
    [home, lenis, navigate],
  )

  // Menu ouvert : la page ne défile plus, Échap ferme, le focus va sur « Fermer » puis revient au bouton.
  useEffect(() => {
    if (!open) return
    lenis?.stop()
    closeRef.current?.focus()
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    window.addEventListener('keydown', onKey)
    const back = opener.current
    return () => {
      lenis?.start()
      window.removeEventListener('keydown', onKey)
      back?.focus()
    }
  }, [open, lenis])

  const pick = (id: string) => {
    setOpen(false)
    window.setTimeout(() => go(id), 60)
  }

  const current = home ? CHAPTERS[active] : null

  return (
    <>
      <header
        className={cn(
          'theme-follow fixed inset-x-0 top-0 z-50 transition-[background-color,backdrop-filter,border-color] duration-500',
          scrolled ? 'border-b border-paper/15 bg-ink/90 backdrop-blur' : 'border-b border-transparent',
        )}
      >
        <nav aria-label={t.nav.aria} className="flex items-center gap-2 px-[var(--gutter)] py-3 sm:gap-3">
          <a
            href="#top"
            onClick={(e) => {
              e.preventDefault()
              go('top')
            }}
            className="group flex items-center gap-2 text-sm text-paper"
          >
            <span className="grid size-9 place-items-center rounded-full border border-paper font-semibold transition-colors group-hover:bg-paper group-hover:text-ink">
              R
            </span>
            <span className="hidden sm:inline">riyan.world</span>
            <span className="size-1.5 rounded-full bg-vermilion max-sm:hidden" aria-hidden="true" />
          </a>

          <button
            ref={opener}
            type="button"
            onClick={() => setOpen(true)}
            aria-haspopup="dialog"
            aria-expanded={open}
            aria-label="Menu"
            className="ml-1 inline-flex shrink-0 items-center gap-3 rounded-full border border-paper/25 py-2.5 pr-3.5 pl-3.5 text-xs sm:ml-2 sm:py-2 sm:pr-4 font-semibold tracking-[0.08em] text-paper uppercase transition-colors hover:bg-paper hover:text-ink"
          >
            <span className="grid gap-[3px]" aria-hidden="true">
              <span className="block h-[2px] w-4 rounded bg-current" />
              <span className="block h-[2px] w-2.5 rounded bg-current" />
            </span>
            <span className="max-sm:sr-only">Menu</span>
            {current && (
              <span className="hidden border-l border-current/25 pl-3 tabular-nums opacity-70 md:inline">
                {String(active + 1).padStart(2, '0')} · {label(current)}
              </span>
            )}
          </button>

          <div className="ml-auto flex shrink-0 items-center gap-2 sm:gap-3 md:gap-4">
            <LangSwitch />
            <a
              href="#contact"
              onClick={(e) => {
                e.preventDefault()
                go('contact')
              }}
              className="rounded-full bg-paper px-5 py-2.5 text-sm font-semibold whitespace-nowrap text-ink transition-[background-color,transform] duration-300 hover:bg-signal active:scale-95"
            >
              {t.nav.contact}
            </a>
          </div>
        </nav>
      </header>

      <AnimatePresence>
        {open && (
          <motion.div
            key="menu"
            role="dialog"
            aria-modal="true"
            aria-label={lang === 'en' ? 'Chapters' : 'Chapitres'}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="theme-light fixed inset-0 z-[70] overflow-y-auto bg-ink px-[var(--gutter)] pt-5 pb-12"
          >
            <div className="flex items-center justify-between">
              <span className="label text-mist">{lang === 'en' ? 'All chapters' : 'Tous les chapitres'}</span>
              <button
                ref={closeRef}
                type="button"
                onClick={() => setOpen(false)}
                className="inline-flex items-center gap-2 rounded-full border border-paper px-4 py-2 text-xs font-semibold tracking-[0.08em] text-paper uppercase transition-colors hover:bg-paper hover:text-ink"
              >
                <X className="size-4" aria-hidden="true" />
                {lang === 'en' ? 'Close' : 'Fermer'}
              </button>
            </div>

            <ol className="mx-auto mt-10 grid max-w-6xl gap-x-16 md:grid-cols-2">
              {CHAPTERS.map((c, i) => (
                <li key={c.id} className="border-b border-paper/15">
                  <button
                    type="button"
                    onClick={() => pick(c.id)}
                    aria-current={home && i === active ? 'true' : undefined}
                    className={cn(
                      'group flex w-full items-baseline gap-5 py-4 text-left transition-colors md:py-5',
                      home && i === active ? 'text-signal' : 'text-paper hover:text-signal',
                    )}
                  >
                    <span className="label w-8 shrink-0 tabular-nums text-mist">{String(i + 1).padStart(2, '0')}</span>
                    <span className="display text-[clamp(1.8rem,1.1rem+2.4vw,3.2rem)] transition-transform duration-300 group-hover:translate-x-1.5">
                      {label(c)}
                    </span>
                  </button>
                </li>
              ))}
            </ol>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
