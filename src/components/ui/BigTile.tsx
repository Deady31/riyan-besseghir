import type { CSSProperties, HTMLAttributes, ReactNode } from 'react'
import { motion } from 'motion/react'
import { MagicCard } from '../vendor/magicui/magic-card'
import { cn } from '../../lib/cn'

/**
 * Grand bloc très arrondi, brique de base des sections de contenu.
 * - survol : le bloc se soulève et un halo suit le curseur (Magic UI Magic Card)
 * - appui : il s'écrase en ressort (Motion)
 * Le conteneur extérieur reste libre pour GSAP (révélations au scroll) : Motion n'anime que l'intérieur.
 */
const TONES = {
  paper: { bg: '#f8f4ea', fg: 'text-paper', glow: 'rgb(37 77 255 / 0.12)', from: '#254dff', to: '#f05235' },
  cobalt: { bg: '#254dff', fg: 'text-ink', glow: 'rgb(255 255 255 / 0.22)', from: '#d9f05a', to: '#f1ebdd' },
  vermilion: { bg: '#f05235', fg: 'text-paper', glow: 'rgb(255 255 255 / 0.28)', from: '#f1ebdd', to: '#d9f05a' },
  acid: { bg: '#d9f05a', fg: 'text-paper', glow: 'rgb(255 255 255 / 0.5)', from: '#254dff', to: '#f05235' },
  ink: { bg: '#20211f', fg: 'text-ink', glow: 'rgb(255 255 255 / 0.12)', from: '#254dff', to: '#d9f05a' },
  chrome: { bg: '#d9dce0', fg: 'text-paper', glow: 'rgb(255 255 255 / 0.6)', from: '#254dff', to: '#f05235' },
} as const

export type Tone = keyof typeof TONES

type Props = Omit<HTMLAttributes<HTMLDivElement>, 'children'> & {
  tone?: Tone
  children: ReactNode
  inner?: string
}

export function BigTile({ tone = 'paper', children, className, inner, ...rest }: Props) {
  const t = TONES[tone]
  return (
    <div className={cn('h-full', className)} {...rest}>
      <motion.div
        whileHover={{ y: -8 }}
        whileTap={{ scale: 0.955 }}
        transition={{ type: 'spring', stiffness: 380, damping: 20 }}
        className="theme-light h-full rounded-[44px] shadow-[var(--shadow-card)]"
        style={{ '--color-background': t.bg } as CSSProperties}
      >
        <MagicCard className="h-full rounded-[44px]" gradientFrom={t.from} gradientTo={t.to} gradientColor={t.glow} gradientSize={300}>
          <div className={cn('h-full p-7 md:p-9', t.fg, inner)}>{children}</div>
        </MagicCard>
      </motion.div>
    </div>
  )
}
