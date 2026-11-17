import { belowFold } from './belowFold'
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import Lenis from 'lenis'
import { gsap, ScrollTrigger, prefersReducedMotion } from './motion'

const LenisContext = createContext<Lenis | null>(null)

export const useLenis = () => useContext(LenisContext)

export function SmoothScroll({ children }: { children: ReactNode }) {
  const [lenis, setLenis] = useState<Lenis | null>(null)

  useEffect(() => {
    if (prefersReducedMotion()) return
    const instance = new Lenis({ lerp: 0.09, wheelMultiplier: 0.9 })
    instance.on('scroll', ScrollTrigger.update)
    const tick = (time: number) => instance.raf(time * 1000)
    gsap.ticker.add(tick)
    gsap.ticker.lagSmoothing(0)
    setLenis(instance)
    return () => {
      gsap.ticker.remove(tick)
      instance.destroy()
      setLenis(null)
    }
  }, [])

  return <LenisContext.Provider value={lenis}>{children}</LenisContext.Provider>
}

export function scrollToId(lenis: Lenis | null, id: string) {
  const go = (el: HTMLElement) => {
    // Lenis garde la hauteur de page qu'il a mesurée : après l'arrivée du bas, on la lui fait relire avant de défiler.
    if (lenis) {
      lenis.resize()
      lenis.scrollTo(el, { duration: 1.4, offset: 0 })
    } else el.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth' })
  }
  const el = document.getElementById(id)
  if (el) return go(el)
  // Section du bas pas encore arrivée : on demande son chargement puis on attend qu'elle existe (4 s au plus).
  belowFold.request()
  let tries = 0
  const poll = () => {
    const late = document.getElementById(id)
    if (late) return void requestAnimationFrame(() => go(late))
    if (++tries < 240) requestAnimationFrame(poll)
  }
  poll()
}
