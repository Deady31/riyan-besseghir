import { useEffect, useRef } from 'react'
import { useLang } from '../../i18n/LangProvider'
import { prefersReducedMotion } from '../../lib/motion'
import { bodies, canGrabNow, gestureCount, type Body } from '../../lib/toys'

/**
 * Une petite bulle « Attrape-moi » au-dessus d'UN seul objet 3D à la fois, 5 secondes, très rarement :
 * la première fois après environ 18 s, puis toutes les 50 à 80 s, trois fois au maximum par visite, et plus jamais
 * dès que la personne a attrapé ou poussé un objet (elle a compris). Seul un objet visible, libre et réellement attrapable
 * est choisi. La bulle suit l'objet pendant ses 5 secondes ; elle disparaît si on le touche.
 */
const MAX_HINTS = 3
const SHOW_MS = 5000
const KEY = 'toy-hints'

const readCount = () => {
  try {
    return Number(sessionStorage.getItem(KEY) ?? 0)
  } catch {
    return 0
  }
}

export function ToyHint() {
  const { lang } = useLang()
  const el = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const node = el.current
    if (!node || prefersReducedMotion()) return
    let timer = 0
    let raf = 0
    let shownAt = 0
    let target: Body | null = null

    const hide = () => {
      node.style.opacity = '0'
      target = null
      cancelAnimationFrame(raf)
    }
    const follow = (now: number) => {
      const b = target
      if (!b || now - shownAt > SHOW_MS || b.held || !b.visible || gestureCount() > 0) {
        hide()
        if (readCount() < MAX_HINTS && gestureCount() === 0) schedule(50000 + Math.random() * 30000)
        return
      }
      const x = Math.max(70, Math.min(window.innerWidth - 70, b.x))
      const y = Math.max(96, b.y - b.r * 0.85 - 10)
      node.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0) translate(-50%, -100%)`
      raf = requestAnimationFrame(follow)
    }
    const attempt = () => {
      if (document.hidden || gestureCount() > 0 || readCount() >= MAX_HINTS) return
      const vw = window.innerWidth
      const vh = window.innerHeight
      const ok = [...bodies].filter((b) => b.visible && !b.held && b.r >= 30 && b.x > 60 && b.x < vw - 60 && b.y > 130 && b.y < vh - 20 && canGrabNow(b))
      if (ok.length === 0) {
        schedule(9000)
        return
      }
      target = ok[Math.floor(Math.random() * ok.length)]
      shownAt = performance.now()
      try {
        sessionStorage.setItem(KEY, String(readCount() + 1))
      } catch {
        /* stockage indisponible : la limite par visite ne sera pas retenue */
      }
      node.style.opacity = '1'
      raf = requestAnimationFrame(follow)
    }
    const schedule = (ms: number) => {
      window.clearTimeout(timer)
      timer = window.setTimeout(attempt, ms)
    }
    schedule(18000)
    return () => {
      window.clearTimeout(timer)
      cancelAnimationFrame(raf)
    }
  }, [lang])

  return (
    <div
      ref={el}
      aria-hidden="true"
      className="pointer-events-none fixed top-0 left-0 z-[44] opacity-0 transition-opacity duration-300"
      style={{ transform: 'translate3d(-200px,-200px,0)' }}
    >
      <span className="toy-hint relative block rounded-full border-2 border-paper bg-[#FFF6E5] px-3.5 py-1.5 text-[13px] leading-none font-bold whitespace-nowrap text-paper shadow-[0_3px_0_rgb(32_33_31/0.9)]">
        {lang === 'en' ? 'Catch me' : 'Attrape-moi'}
      </span>
    </div>
  )
}
