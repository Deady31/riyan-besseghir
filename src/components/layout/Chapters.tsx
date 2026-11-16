import { useEffect, useState } from 'react'
import { useLang } from '../../i18n/LangProvider'
import { scrollToId, useLenis } from '../../lib/SmoothScroll'
import { cn } from '../../lib/cn'

/**
 * Deux éléments qui donnent au défilement un fil de magazine (inspiré des « Editions » de Shopify) :
 *  - le mot du chapitre en grand, en serif italique contour, derrière le contenu : il change à chaque section ;
 *  - un index de chapitres collé à gauche (numéro + nom au survol), qui sert aussi de navigation.
 * Les deux lisent la section sous le milieu de l'écran ; ils n'existent que sur l'accueil.
 */

const CHAPTERS = [
  { id: 'top', fr: 'Intro', en: 'Intro' },
  { id: 'morph', fr: 'Trente-neuf', en: 'Thirty-nine' },
  { id: 'deck', fr: 'Le deck', en: 'The deck' },
  { id: 'impact', fr: 'Impact', en: 'Impact' },
  { id: 'hauts-faits', fr: 'Hauts faits', en: 'Highlights' },
  { id: 'studio', fr: 'Builder', en: 'Builder' },
  { id: 'ia', fr: 'Agents', en: 'Agents' },
  { id: 'lab', fr: 'Index', en: 'Index' },
  { id: 'about', fr: 'À propos', en: 'About' },
  { id: 'passions', fr: 'Passions', en: 'Passions' },
  { id: 'contact', fr: 'Contact', en: 'Contact' },
] as const

export function Chapters() {
  const { lang } = useLang()
  const lenis = useLenis()
  const [active, setActive] = useState(0)

  useEffect(() => {
    let raf = 0
    const read = () => {
      raf = 0
      const mid = window.innerHeight * 0.5
      let found = 0
      CHAPTERS.forEach((c, i) => {
        const el = document.getElementById(c.id)
        if (!el) return
        const r = el.getBoundingClientRect()
        if (r.top <= mid) found = i
      })
      setActive((prev) => (prev === found ? prev : found))
    }
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(read)
    }
    read()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [])

  return (
    <>
      {/* Mot du chapitre : sous les sections (z-20) et la 3D (z-15), au-dessus du fond. */}
      <div className="theme-follow pointer-events-none fixed inset-0 z-[10] overflow-hidden" aria-hidden="true">
        {CHAPTERS.map((c, i) => (
          <p
            key={c.id}
            className={cn(
              'editorial absolute bottom-[-0.12em] left-[-0.04em] text-[clamp(5rem,15vw,19rem)] leading-none whitespace-nowrap transition-[opacity,transform] duration-[900ms] ease-[var(--ease-expo)] motion-reduce:transition-none',
              i === active ? 'translate-y-0 opacity-100' : i < active ? '-translate-y-[18%] opacity-0' : 'translate-y-[18%] opacity-0',
            )}
          >
            {lang === 'en' ? c.en : c.fr}
          </p>
        ))}
      </div>

      <nav
        aria-label={lang === 'en' ? 'Chapters' : 'Chapitres'}
        className="theme-follow fixed top-1/2 left-3 z-[45] hidden -translate-y-1/2 flex-col gap-0.5 xl:flex"
      >
        {CHAPTERS.map((c, i) => (
          <button
            key={c.id}
            type="button"
            onClick={() => scrollToId(lenis, c.id)}
            aria-current={i === active ? 'true' : undefined}
            className="group flex items-center gap-2 py-[3px] text-left"
          >
            <span
              className={cn(
                'tabular-nums text-[10px] font-semibold tracking-[0.06em] transition-[opacity,transform] duration-300',
                i === active ? 'translate-x-0.5 text-paper opacity-100' : 'text-mist opacity-70 group-hover:opacity-100',
              )}
            >
              {String(i + 1).padStart(2, '0')}
            </span>
            <span
              className={cn(
                'rounded-full bg-paper px-2.5 py-1 text-[11px] font-semibold whitespace-nowrap text-ink transition-[opacity,transform] duration-300',
                i === active ? 'translate-x-0 opacity-100' : '-translate-x-1 opacity-0 group-hover:translate-x-0 group-hover:opacity-100',
              )}
            >
              {lang === 'en' ? c.en : c.fr}
            </span>
          </button>
        ))}
      </nav>
    </>
  )
}
