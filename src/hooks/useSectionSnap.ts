import { useEffect } from 'react'
import type Lenis from 'lenis'
import { prefersReducedMotion } from '../lib/motion'
import { phoneStage } from '../lib/phoneStage'

/** Chapitres qui se recentrent (les sections épinglées ou en scène, comme le 39 et l'IA, sont laissées tranquilles). */
const SNAP_IDS = ['deck', 'impact', 'hauts-faits', 'studio', 'demo', 'lab', 'about', 'passions']
const NAV = 72

/**
 * Quand on descend et qu'on s'arrête juste avant un chapitre (son haut entre un peu au-dessus et 30 % de l'écran sous le bord),
 * la page le recentre doucement sur son titre. Jamais quand on remonte, ni pendant qu'on tient encore la molette, ni sur tactile
 * ni en mouvement réduit : on ne prend jamais la main de quelqu'un qui lit.
 */
export function useSectionSnap(lenis: Lenis | null, enabled: boolean) {
  useEffect(() => {
    if (!enabled || !lenis || prefersReducedMotion()) return
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return
    let timer = 0
    let lastInput = 0
    let lastY = window.scrollY
    let down = true

    const settle = () => {
      if (performance.now() - lastInput < 220) {
        timer = window.setTimeout(settle, 140)
        return
      }
      if (!down || phoneStage.state.open) return
      const vh = window.innerHeight
      let best: HTMLElement | null = null
      let bestD = Infinity
      for (const id of SNAP_IDS) {
        const el = document.getElementById(id)
        if (!el) continue
        const top = el.getBoundingClientRect().top - NAV
        if (top > -0.12 * vh && top < 0.3 * vh && Math.abs(top) < bestD) {
          best = el
          bestD = Math.abs(top)
        }
      }
      if (best && bestD > 6) lenis.scrollTo(best, { offset: -NAV, duration: 0.9 })
    }
    const onScroll = () => {
      const y = window.scrollY
      if (Math.abs(y - lastY) > 0.5) down = y > lastY
      lastY = y
      window.clearTimeout(timer)
      timer = window.setTimeout(settle, 180)
    }
    const stamp = () => {
      lastInput = performance.now()
    }
    window.addEventListener('wheel', stamp, { passive: true })
    window.addEventListener('keydown', stamp)
    window.addEventListener('pointerdown', stamp, { passive: true })
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.clearTimeout(timer)
      window.removeEventListener('wheel', stamp)
      window.removeEventListener('keydown', stamp)
      window.removeEventListener('pointerdown', stamp)
      window.removeEventListener('scroll', onScroll)
    }
  }, [lenis, enabled])
}
