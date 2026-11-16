import { useEffect, useRef } from 'react'
import { cursorBus } from '../../lib/cursorBus'
import { prefersReducedMotion } from '../../lib/motion'
import { HandSprites } from './HandSprites'

/**
 * Curseur main 2D, DA bubbly : suit la souris avec un ressort, s'incline selon la vitesse, s'écrase quand on appuie.
 * États : idle (main ouverte), point (lien, bouton), grab (objet 3D attrapable), fist (appui ou objet tenu),
 * tap (téléphone), hidden (dans une iframe ou un champ de texte, où le curseur natif reprend).
 * Uniquement avec une vraie souris : le tactile garde son comportement. Le curseur natif n'est masqué que si la main est active.
 */
export type HandState = 'idle' | 'point' | 'grab' | 'fist' | 'tap' | 'hidden'

const FINE = '(hover: hover) and (pointer: fine)'
const SIZE = 64

function kindOf(t: Element | null): HandState {
  if (!t) return 'idle'
  if (t.tagName === 'IFRAME' || t.closest('input,textarea,select,[contenteditable="true"]')) return 'hidden'
  if (t.closest('[data-cursor="tap"]')) return 'tap'
  if (t.closest('a,button,[role="button"],summary,label[for],[data-cursor="point"]')) return 'point'
  return 'idle'
}

export function HandCursor() {
  const root = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = root.current
    if (!el || !window.matchMedia(FINE).matches) return
    const reduced = prefersReducedMotion()
    const html = document.documentElement
    html.classList.add('hand-cursor')

    let x = -200
    let y = -200
    let tx = -200
    let ty = -200
    let rot = 0
    let pop = 0
    let scale = 1
    let pressed = false
    let seen = false
    let target: Element | null = null
    let current: HandState = 'idle'
    let raf = 0

    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return
      tx = e.clientX
      ty = e.clientY
      target = e.target as Element | null
      kick()
      if (!seen) {
        seen = true
        x = tx
        y = ty
        el.style.opacity = '1'
      }
    }
    const onDown = (e: PointerEvent) => {
      if (e.pointerType === 'mouse') pressed = true
      kick()
    }
    const onUp = () => {
      pressed = false
      kick()
    }
    const onLeave = () => {
      el.style.opacity = '0'
      seen = false
    }
    const onScroll = () => {
      if (seen) {
        target = document.elementFromPoint(tx, ty)
        kick()
      }
    }

    const frame = () => {
      raf = 0
      const k = reduced ? 1 : 0.3
      const dx = tx - x
      x += dx * k
      y += (ty - y) * k
      const wantRot = reduced ? 0 : Math.max(-16, Math.min(16, dx * 0.55))
      rot += (wantRot - rot) * 0.22

      let next: HandState = kindOf(target)
      if (next !== 'hidden') {
        if (cursorBus.dragging || (pressed && cursorBus.overGrab)) next = 'fist'
        else if (cursorBus.overGrab) next = 'grab'
        else if (pressed) next = 'fist'
      }
      if (next !== current) {
        current = next
        el.dataset.state = next
        pop = 1
      }
      pop *= 0.86
      const squash = pressed || cursorBus.dragging ? 0.9 : 1
      scale += (squash - scale) * 0.3
      const s = scale * (1 + pop * 0.16)
      el.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0) rotate(${rot.toFixed(1)}deg) scale(${s.toFixed(3)})`
      // Tout est posé : on arrête la boucle jusqu'au prochain mouvement (aucune image inutile).
      const settled = Math.abs(tx - x) < 0.1 && Math.abs(ty - y) < 0.1 && Math.abs(rot) < 0.1 && pop < 0.01 && Math.abs(scale - squash) < 0.003
      if (!settled) raf = requestAnimationFrame(frame)
    }
    const kick = () => {
      if (!raf) raf = requestAnimationFrame(frame)
    }
    kick()

    window.addEventListener('pointermove', onMove, { passive: true })
    window.addEventListener('pointerdown', onDown, { passive: true })
    window.addEventListener('pointerup', onUp, { passive: true })
    window.addEventListener('scroll', onScroll, { passive: true })
    document.documentElement.addEventListener('pointerleave', onLeave)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerdown', onDown)
      window.removeEventListener('pointerup', onUp)
      window.removeEventListener('scroll', onScroll)
      document.documentElement.removeEventListener('pointerleave', onLeave)
      html.classList.remove('hand-cursor')
    }
  }, [])

  return (
    <div
      ref={root}
      data-state="idle"
      aria-hidden="true"
      className="hand pointer-events-none fixed top-0 left-0 z-[9999] opacity-0 transition-opacity duration-200"
      style={{ width: SIZE, height: SIZE }}
    >
      <HandSprites />
    </div>
  )
}

/** Planche des états, pour la mise au point du dessin (route de développement `/hand-preview`). */
export function HandPreview() {
  const states: HandState[] = ['idle', 'point', 'grab', 'fist', 'tap']
  return (
    <main className="grid min-h-svh place-items-center gap-10 p-10">
      {[ 'bg-ink', 'bg-[#08090e]' ].map((bg) => (
        <div key={bg} className={`${bg} flex flex-wrap items-center justify-center gap-10 rounded-[40px] p-10`}>
          {states.map((s) => (
            <div key={s} className="grid justify-items-center gap-3">
              <div className="hand-static relative h-[180px] w-[180px]" data-state={s}>
                <HandSprites />
              </div>
              <p className="label text-mist">{s}</p>
            </div>
          ))}
        </div>
      ))}
    </main>
  )
}
