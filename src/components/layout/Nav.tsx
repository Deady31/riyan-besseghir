import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router'
import { scrollToId, useLenis } from '../../lib/SmoothScroll'
import { cn } from '../../lib/cn'
import { useT } from '../../i18n/useT'
import { LangSwitch } from '../ui/LangSwitch'

const IDS = ['impact', 'hauts-faits', 'studio', 'ia', 'lab', 'about', 'passions'] as const

export function Nav() {
  const lenis = useLenis()
  const t = useT()
  const [scrolled, setScrolled] = useState(false)
  const navigate = useNavigate()
  const { pathname } = useLocation()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const go = (id: string) => (e: React.MouseEvent) => {
    e.preventDefault()
    if (pathname !== '/') {
      sessionStorage.setItem('scrollTo', id)
      navigate('/')
      return
    }
    scrollToId(lenis, id)
  }

  return (
    <header
      className={cn(
        'theme-follow fixed inset-x-0 top-0 z-50 transition-[background-color,backdrop-filter,border-color] duration-500',
        scrolled ? 'border-b border-paper/15 bg-ink/90 backdrop-blur' : 'border-b border-transparent',
      )}
    >
      <nav aria-label={t.nav.aria} className="flex items-center justify-between gap-4 px-[var(--gutter)] py-3">
        <a href="#top" onClick={go('top')} className="group flex items-center gap-2 text-sm text-paper">
          <span className="grid size-9 place-items-center rounded-full border border-paper font-semibold transition-colors group-hover:bg-paper group-hover:text-ink">
            R
          </span>
          <span className="hidden sm:inline">riyan.world</span>
          <span className="size-1.5 rounded-full bg-vermilion" aria-hidden="true" />
        </a>

        <ul className="hidden items-center gap-1 lg:flex">
          {IDS.map((id) => (
            <li key={id}>
              <a
                href={`#${id}`}
                onClick={go(id)}
                className="rounded-full px-3.5 py-2 text-xs font-semibold tracking-[0.08em] text-mist uppercase transition-colors hover:bg-graphite-2 hover:text-paper"
              >
                {t.nav.links[id]}
              </a>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-3 md:gap-4">
          <LangSwitch />
          <a
            href="#contact"
            onClick={go('contact')}
            className="rounded-full bg-paper px-5 py-2.5 text-sm font-semibold whitespace-nowrap text-ink transition-[background-color,transform] duration-300 hover:bg-signal active:scale-95"
          >
            {t.nav.contact}
          </a>
        </div>
      </nav>
    </header>
  )
}
