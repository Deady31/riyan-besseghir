import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'motion/react'
import { EGGS, type Egg } from '../../data/eggs'
import { useLang } from '../../i18n/LangProvider'
import { burst } from '../../lib/burst'
import { markFound } from '../../lib/eggs'
import { useReducedMotion } from '../../lib/motion'
import { Anchor } from '../three/Anchor'

/**
 * Easter eggs (voir data/eggs.ts) : chaque œuf est posé dans sa section par un portail, pour suivre la mise en page.
 * Les œufs 2D se glissent depuis le bord quand leur section est à l'écran ; les œufs 3D sont des objets jouables
 * qui comptent comme trouvés à la première prise. Un petit message annonce chaque découverte.
 */
const t = {
  fr: { found: 'Easter egg trouvé', of: 'sur', label: 'Easter egg :' },
  en: { found: 'Easter egg found', of: 'of', label: 'Easter egg:' },
}

function Egg2D({ egg, host, total }: { egg: Egg; host: HTMLElement; total: number }) {
  const { lang } = useLang()
  const reduced = useReducedMotion()
  const [inView, setInView] = useState(false)
  const [bubble, setBubble] = useState(false)
  const btn = useRef<HTMLButtonElement>(null)
  const side = egg.from === 'left' ? -1 : 1

  useEffect(() => {
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting), { threshold: 0.35 })
    io.observe(host)
    return () => io.disconnect()
  }, [host])

  useEffect(() => {
    if (!bubble) return
    const id = window.setTimeout(() => setBubble(false), 4200)
    return () => window.clearTimeout(id)
  }, [bubble])

  const onClick = () => {
    const r = btn.current?.getBoundingClientRect()
    if (r) burst(r.left + r.width / 2, r.top + r.height / 2, { count: 24 })
    markFound(egg.id, total)
    setBubble(true)
  }

  const hidden = { x: `${side * 85}%`, opacity: 0 }
  const peek = { x: `${side * 24}%`, opacity: 1 }
  return createPortal(
    <motion.button
      ref={btn}
      type="button"
      onClick={onClick}
      data-cursor="point"
      aria-label={`${t[lang === 'en' ? 'en' : 'fr'].label} ${egg.title[lang === 'en' ? 'en' : 'fr']}`}
      className="absolute z-30 cursor-pointer"
      style={{ ...egg.pos, width: egg.size, height: egg.size }}
      initial={reduced ? peek : hidden}
      animate={inView || reduced ? peek : hidden}
      whileHover={reduced ? undefined : { x: 0, rotate: side * -6 }}
      whileTap={{ scale: 0.88 }}
      transition={{ type: 'spring', stiffness: 160, damping: 14, delay: inView ? 0.5 : 0 }}
    >
      <img src={egg.src} alt="" width={egg.size} height={egg.size} draggable={false} className="size-full object-contain" style={{ imageRendering: 'pixelated' }} />
      <AnimatePresence>
        {bubble && egg.line && (
          <motion.span
            initial={{ opacity: 0, scale: 0.6, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ type: 'spring', stiffness: 300, damping: 18 }}
            className="pointer-events-none absolute right-[10%] bottom-full mb-3 w-[min(70vw,17rem)] rounded-3xl border-2 border-paper bg-paper px-4 py-3 text-left text-sm leading-snug font-semibold text-ink"
          >
            {egg.line[lang === 'en' ? 'en' : 'fr']}
          </motion.span>
        )}
      </AnimatePresence>
    </motion.button>,
    host,
  )
}

export function EggLayer() {
  const { lang } = useLang()
  const [hosts, setHosts] = useState<Record<string, HTMLElement>>({})
  const [toast, setToast] = useState<{ count: number; total: number } | null>(null)
  const total = EGGS.length

  // Les sections sont recréées au changement de langue : on les retrouve après chaque rendu de l'accueil.
  useEffect(() => {
    const find = () => {
      const next: Record<string, HTMLElement> = {}
      for (const egg of EGGS) {
        const el = document.getElementById(egg.section)
        if (el) next[egg.section] = el
      }
      setHosts((prev) => (Object.keys(next).length === Object.keys(prev).length && Object.keys(next).every((k) => next[k] === prev[k]) ? prev : next))
    }
    find()
    const id = window.setInterval(find, 1500)
    return () => window.clearInterval(id)
  }, [lang])

  useEffect(() => {
    let timer = 0
    const show = (count: number) => {
      setToast({ count, total })
      window.clearTimeout(timer)
      timer = window.setTimeout(() => setToast(null), 3200)
    }
    const onFound = (e: Event) => show((e as CustomEvent<{ count: number }>).detail.count)
    // Un œuf 3D est trouvé à la première prise : la scène nous prévient avec son identifiant.
    const onGrab = (e: Event) => {
      const id = (e as CustomEvent<string>).detail
      if (EGGS.some((g) => g.id === id)) markFound(id, total)
    }
    window.addEventListener('egg-found', onFound)
    window.addEventListener('egg-grab', onGrab)
    return () => {
      window.removeEventListener('egg-found', onFound)
      window.removeEventListener('egg-grab', onGrab)
      window.clearTimeout(timer)
    }
  }, [total])

  const L = t[lang === 'en' ? 'en' : 'fr']
  return (
    <>
      {EGGS.map((egg) => {
        const host = hosts[egg.section]
        if (!host) return null
        return egg.kind === '2d' ? (
          <Egg2D key={egg.id} egg={egg} host={host} total={total} />
        ) : (
          createPortal(<Anchor key={egg.id} kind="model" model={egg.src} eggId={egg.id} className={egg.className} par={0.2} />, host)
        )
      })}
      <AnimatePresence>
        {toast && (
          <motion.p
            role="status"
            initial={{ opacity: 0, y: 24, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12 }}
            transition={{ type: 'spring', stiffness: 260, damping: 18 }}
            className="sticker pointer-events-none fixed bottom-6 left-1/2 z-[60] -translate-x-1/2 bg-lemon px-5 py-2.5 text-sm text-paper"
          >
            {L.found} · {toast.count} {L.of} {toast.total}
          </motion.p>
        )}
      </AnimatePresence>
    </>
  )
}
