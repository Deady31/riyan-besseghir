import { useEffect, useState } from 'react'
import { scrollToId, useLenis } from '../../lib/SmoothScroll'
import { cn } from '../../lib/cn'
import { useT } from '../../i18n/useT'
import { LangSwitch } from '../ui/LangSwitch'

const IDS = ['impact', 'hauts-faits', 'ia', 'lab', 'about', 'passions'] as const

export function Nav() {
  const lenis = useLenis()
  const t = useT()
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const go = (id: string) => (e: React.MouseEvent) => {
    e.preventDefault()
    scrollToId(lenis, id)
  }

  return (
    <header
      className={cn(
        'fixed inset-x-0 top-0 z-50 transition-[background-color,backdrop-filter,border-color] duration-500',
        scrolled ? 'border-b border-line/70 bg-ink/70 backdrop-blur-md' : 'border-b border-transparent',
      )}
    >
      <nav aria-label={t.nav.aria} className="flex items-center justify-between gap-4 px-[var(--gutter)] py-3">
        <a href="#top" onClick={go('top')} className="group flex items-center gap-2 text-sm text-paper">
          <span className="grid size-8 place-items-center rounded-md border border-line font-medium transition-colors group-hover:border-signal">
            R
          </span>
          <span className="hidden sm:inline">riyan.world</span>
          <span className="size-1.5 rounded-full bg-signal" aria-hidden="true" />
        </a>

        <ul className="hidden items-center gap-1 lg:flex">
          {IDS.map((id) => (
            <li key={id}>
              <a
                href={`#${id}`}
                onClick={go(id)}
                className="rounded-full px-3 py-2 text-xs tracking-[0.08em] text-mist uppercase transition-colors hover:text-paper"
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
            className="rounded-full bg-paper px-4 py-2 text-sm font-medium whitespace-nowrap text-ink transition-[background-color,transform] duration-300 hover:-translate-y-0.5 hover:bg-signal hover:text-paper active:translate-y-0"
          >
            {t.nav.contact}
          </a>
        </div>
      </nav>
    </header>
  )
}
