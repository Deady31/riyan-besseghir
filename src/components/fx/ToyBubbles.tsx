import { useEffect } from 'react'
import { useLang } from '../../i18n/LangProvider'
import { onToyEvent, type Body } from '../../lib/toys'
import { pickLine } from '../../data/toyLines'

/**
 * Les bulles de dialogue des objets : quand on en saisit, tape ou lance un, une petite bulle apparaît COLLÉE à lui (elle
 * suit sa position à chaque image, y compris pendant qu'il vole), dit une blague propre à l'objet, puis disparaît.
 * Hors React pour le suivi : un élément DOM par bulle, repositionné dans une seule boucle d'animation.
 */

const LIFE_MS = 1900
const FADE_MS = 260
const GRAB_COOLDOWN = 450

type Bubble = { el: HTMLDivElement; until: number; last: string; at: number }

export function ToyBubbles() {
  const { lang } = useLang()

  useEffect(() => {
    const layer = document.createElement('div')
    layer.setAttribute('aria-hidden', 'true')
    layer.className = 'pointer-events-none fixed inset-0 z-[44] overflow-hidden'
    document.body.appendChild(layer)
    const bubbles = new Map<Body, Bubble>()
    let raf = 0

    const place = (b: Body, bub: Bubble) => {
      const w = bub.el.offsetWidth
      const h = bub.el.offsetHeight
      const x = Math.max(8 + w / 2, Math.min(window.innerWidth - 8 - w / 2, b.x))
      const y = Math.max(h + 12, b.y - b.r * 0.85)
      bub.el.style.transform = `translate3d(${Math.round(x - w / 2)}px, ${Math.round(y - h - 10)}px, 0)`
      // La queue de la bulle reste pointée vers l'objet même quand la bulle est calée au bord de l'écran.
      bub.el.style.setProperty('--tail', `${Math.round(Math.max(14, Math.min(w - 14, b.x - (x - w / 2))))}px`)
    }

    const tick = () => {
      raf = 0
      const now = performance.now()
      for (const [b, bub] of bubbles) {
        if (now > bub.until + FADE_MS || !b.visible) {
          bub.el.remove()
          bubbles.delete(b)
          continue
        }
        if (now > bub.until) bub.el.classList.add('toy-say-out')
        place(b, bub)
      }
      if (bubbles.size) raf = requestAnimationFrame(tick)
    }

    const off = onToyEvent((b, ev) => {
      const now = performance.now()
      const cur = bubbles.get(b)
      // Une prise suivie tout de suite d'un tap ne doit pas faire clignoter deux bulles.
      if (cur && ev === 'grab' && now - cur.at < GRAB_COOLDOWN) return
      const text = pickLine(b.kind, ev, lang === 'en' ? 'en' : 'fr', cur?.last)
      if (cur) {
        cur.el.textContent = text
        cur.el.classList.remove('toy-say-out')
        // relance l'animation d'apparition
        cur.el.style.animation = 'none'
        void cur.el.offsetWidth
        cur.el.style.animation = ''
        cur.until = now + LIFE_MS
        cur.last = text
        cur.at = now
      } else {
        const el = document.createElement('div')
        el.className = 'toy-say'
        el.textContent = text
        layer.appendChild(el)
        const bub: Bubble = { el, until: now + LIFE_MS, last: text, at: now }
        bubbles.set(b, bub)
        place(b, bub)
      }
      if (!raf) raf = requestAnimationFrame(tick)
    })

    return () => {
      off()
      cancelAnimationFrame(raf)
      layer.remove()
    }
  }, [lang])

  return null
}
