import { useEffect, useState } from 'react'
import { useReducedMotion } from '../../lib/motion'
import { AFK_CLIPS, AFK_FPS } from './afk-frames'

/**
 * Le skater en pixel art qui s'impatiente quand le paquet est fini, comme un perso de jeu laissé AFK :
 * il tape du pied quelques fois, puis se gratte le menton, et recommence.
 */
const SEQUENCE: (keyof typeof AFK_CLIPS)[] = ['tap', 'tap', 'scratch']

const FRAMES = SEQUENCE.flatMap((name) => AFK_CLIPS[name])

export function AfkSkater({ bubble }: { bubble: string }) {
  const reduced = useReducedMotion()
  const [tick, setTick] = useState(0)

  useEffect(() => {
    if (reduced) return
    const id = window.setInterval(() => setTick((t) => (t + 1) % FRAMES.length), 1000 / AFK_FPS)
    return () => window.clearInterval(id)
  }, [reduced])

  // Précharge toutes les images pour éviter un clignotement au premier passage.
  useEffect(() => {
    Object.values(AFK_CLIPS)
      .flat()
      .forEach((src) => {
        const img = new Image()
        img.src = src
      })
  }, [])

  return (
    <div className="relative mx-auto w-fit">
      <span className="sticker absolute -top-3 left-[62%] z-10 -rotate-3 bg-graphite text-xs whitespace-nowrap">{bubble}</span>
      <img
        src={FRAMES[reduced ? 0 : tick]}
        alt=""
        width={88}
        height={88}
        className="size-44 [image-rendering:pixelated] md:size-52"
        draggable={false}
      />
    </div>
  )
}
