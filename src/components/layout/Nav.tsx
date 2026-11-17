import { lazy, Suspense, useCallback, useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router'
import { AnimatePresence, motion } from 'motion/react'
import { scrollToId, useLenis } from '../../lib/SmoothScroll'
import { cn } from '../../lib/cn'
import { useT } from '../../i18n/useT'
import { useLang } from '../../i18n/LangProvider'
import { CHAPTERS } from '../../data/chapters'
import { useActiveChapter } from '../../hooks/useActiveChapter'
import { useWebGLSupport } from '../../hooks/useWebGLSupport'
import { LangSwitch } from '../ui/LangSwitch'
import { setMode } from '../../lib/visitorMode'

const Logo3D = lazy(() => import('./Logo3D'))

/**
 * Barre du haut : le logo (un R chromé en 3D, qui ramène tout en haut), un menu qui se déplie dès que le curseur le touche
 * (sur tactile : au toucher), la langue et le contact. La liste des chapitres est la même que le rail de gauche.
 */
export function Nav() {
  const lenis = useLenis()
  const t = useT()
  const { lang } = useLang()
  const webgl = useWebGLSupport()
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const [logoHover, setLogoHover] = useState(false)
  const [spinKey, setSpinKey] = useState(0)
  const [logoReady, setLogoReady] = useState(false)
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const home = pathname === '/'
  const active = useActiveChapter(home)
  const wrap = useRef<HTMLDivElement>(null)
  const closeTimer = useRef(0)
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

  // Menu ouvert : Échap ou un clic ailleurs le ferme.
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    const onDown = (e: PointerEvent) => {
      if (wrap.current && !wrap.current.contains(e.target as Node)) setOpen(false)
    }
    window.addEventListener('keydown', onKey)
    window.addEventListener('pointerdown', onDown)
    return () => {
      window.removeEventListener('keydown', onKey)
      window.removeEventListener('pointerdown', onDown)
    }
  }, [open])

  // Survol à la souris : ouvre tout de suite, ferme après un court délai (pour passer du bouton à la liste sans la perdre).
  const enter = (e: React.PointerEvent) => {
    if (e.pointerType !== 'mouse') return
    window.clearTimeout(closeTimer.current)
    setOpen(true)
  }
  const leave = (e: React.PointerEvent) => {
    if (e.pointerType !== 'mouse') return
    window.clearTimeout(closeTimer.current)
    closeTimer.current = window.setTimeout(() => setOpen(false), 220)
  }

  const pick = (id: string) => {
    setOpen(false)
    go(id)
  }

  const current = home ? CHAPTERS[active] : null

  return (
    <header
      className={cn(
        'theme-follow fixed inset-x-0 top-0 z-50 transition-[background-color,backdrop-filter,border-color] duration-500',
        scrolled ? 'border-b border-paper/15 bg-ink/90 backdrop-blur' : 'border-b border-transparent',
      )}
    >
      <nav aria-label={t.nav.aria} className="flex items-center gap-2 px-[var(--gutter)] py-2 sm:gap-3">
        <a
          href="#top"
          aria-label={lang === 'en' ? 'riyan.world, back to top' : 'riyan.world, retour en haut'}
          onClick={(e) => {
            e.preventDefault()
            setSpinKey((k) => k + 1)
            go('top')
          }}
          onPointerEnter={() => setLogoHover(true)}
          onPointerLeave={() => setLogoHover(false)}
          onFocus={() => setLogoHover(true)}
          onBlur={() => setLogoHover(false)}
          className="group flex items-center gap-2 text-sm text-paper"
        >
          <span className="relative block size-[52px] shrink-0">
            {/* Repli statique tant que la 3D n'est pas là (ou sans WebGL) */}
            <span
              className={cn('absolute inset-1 grid place-items-center rounded-full border border-paper text-base font-bold transition-opacity duration-300', logoReady && 'opacity-0')}
              aria-hidden="true"
            >
              R
            </span>
            {webgl && (
              <span className="absolute inset-0">
                <Suspense fallback={null}>
                  <Logo3D active={logoHover} spinKey={spinKey} onReady={() => setLogoReady(true)} />
                </Suspense>
              </span>
            )}
          </span>
          <span className="hidden font-semibold tracking-[-0.01em] sm:inline">riyan.world</span>
        </a>

        <div ref={wrap} className="relative ml-1 sm:ml-2" onPointerEnter={enter} onPointerLeave={leave}>
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            aria-haspopup="true"
            aria-expanded={open}
            aria-controls="chapter-menu"
            aria-label="Menu"
            className={cn(
              'inline-flex shrink-0 items-center gap-3 rounded-full border border-paper/25 py-2.5 pr-3.5 pl-3.5 text-xs font-semibold tracking-[0.08em] uppercase transition-colors sm:py-2 sm:pr-4',
              open ? 'bg-paper text-ink' : 'text-paper hover:bg-paper hover:text-ink',
            )}
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

          <AnimatePresence>
            {open && (
              <motion.ul
                id="chapter-menu"
                key="menu"
                initial={{ opacity: 0, y: -8, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -6, scale: 0.98 }}
                transition={{ duration: 0.18, ease: 'easeOut' }}
                className="theme-light absolute top-full left-0 z-10 mt-2 w-[min(86vw,320px)] origin-top-left rounded-[28px] border-[2.5px] border-[#2B0F3A] bg-ink p-2 shadow-[var(--shadow-card)]"
              >
                {CHAPTERS.map((c, i) => {
                  const here = home && i === active
                  return (
                    <li key={c.id}>
                      <button
                        type="button"
                        onClick={() => pick(c.id)}
                        aria-current={here ? 'true' : undefined}
                        className={cn(
                          'group flex w-full items-center gap-3 rounded-2xl px-3 py-2 text-left text-[15px] font-semibold transition-colors',
                          here ? 'bg-signal text-ink' : 'text-paper hover:bg-[#EADFFF]',
                        )}
                      >
                        <span className={cn('w-6 shrink-0 text-[11px] tabular-nums', here ? 'text-ink/80' : 'text-mist')}>{String(i + 1).padStart(2, '0')}</span>
                        <span className="transition-transform duration-200 group-hover:translate-x-1">{label(c)}</span>
                      </button>
                    </li>
                  )
                })}
                <li className="mt-1 border-t border-paper/15 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setOpen(false)
                      setMode('recruiter')
                      navigate('/recruteur')
                    }}
                    className="group flex w-full items-center gap-3 rounded-2xl px-3 py-2 text-left text-[15px] font-semibold text-paper transition-colors hover:bg-[#EADFFF]"
                  >
                    <span className="w-6 shrink-0 text-[11px] text-mist">↗</span>
                    <span className="transition-transform duration-200 group-hover:translate-x-1">{t.nav.recruiter}</span>
                  </button>
                </li>
              </motion.ul>
            )}
          </AnimatePresence>
        </div>

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
  )
}
