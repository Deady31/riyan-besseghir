import { useEffect, useState } from 'react'
import { CHAPTERS } from '../data/chapters'

/** Index du chapitre sous le milieu de l'écran (0 tant que la page n'a pas ses sections). */
export function useActiveChapter(enabled = true) {
  const [active, setActive] = useState(0)

  useEffect(() => {
    if (!enabled) return
    let raf = 0
    const read = () => {
      raf = 0
      const mid = window.innerHeight * 0.5
      let found = 0
      CHAPTERS.forEach((c, i) => {
        const el = document.getElementById(c.id)
        if (el && el.getBoundingClientRect().top <= mid) found = i
      })
      setActive((prev) => (prev === found ? prev : found))
    }
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(read)
    }
    read()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    // Les sections du bas arrivent après le premier affichage : on relit quand la page grandit.
    const timer = window.setInterval(read, 1500)
    return () => {
      cancelAnimationFrame(raf)
      window.clearInterval(timer)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [enabled])

  return active
}
