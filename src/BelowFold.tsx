import { useEffect } from 'react'
import { ScrollTrigger } from './lib/motion'
import { useLenis } from './lib/SmoothScroll'
import { SwipeDeck } from './components/deck/SwipeDeck'
import { Impact } from './components/sections/Impact'
import { Feats } from './components/sections/Feats'
import { Studio } from './components/sections/Studio'
import { FooderDemo } from './components/sections/FooderDemo'
import { AiSpotlight } from './components/ai/AiSpotlight'
import { ProjectIndex } from './components/lab/ProjectIndex'
import { About } from './components/sections/About'
import { Passions } from './components/sections/Passions'
import { Contact } from './components/sections/Contact'

/** Tout le bas de l'accueil, dans un seul chunk (voir lib/belowFold.ts). */
export default function BelowFold({ onMount }: { onMount: () => void }) {
  const lenis = useLenis()
  useEffect(() => {
    // Les positions de défilement doivent tenir compte des sections qui viennent d'arriver.
    const id = requestAnimationFrame(() => {
      lenis?.resize()
      ScrollTrigger.refresh()
      onMount()
    })
    return () => cancelAnimationFrame(id)
  }, [onMount, lenis])
  return (
    <>
      <SwipeDeck />
      <Impact />
      <Feats />
      <Studio />
      <FooderDemo />
      <AiSpotlight />
      <ProjectIndex />
      <About />
      <Passions />
      <Contact />
    </>
  )
}
