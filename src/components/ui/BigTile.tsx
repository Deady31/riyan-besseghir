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
  paper: { bg: '#FFFBF3', fg: 'text-paper', glow: 'rgb(108 43 255 / 0.12)', from: '#6C2BFF', to: '#FF7EC8' },
  cobalt: { bg: '#6C2BFF', fg: 'text-ink', glow: 'rgb(255 255 255 / 0.22)', from: '#FF7EC8', to: '#FFF6E5' },
  vermilion: { bg: '#FF7EC8', fg: 'text-paper', glow: 'rgb(255 255 255 / 0.28)', from: '#FFF6E5', to: '#6C2BFF' },
  // « acid » : nom historique, désormais lilas (le citron est réservé aux petits éléments, illisible en grand aplat)
  acid: { bg: '#EADFFF', fg: 'text-paper', glow: 'rgb(255 255 255 / 0.5)', from: '#6C2BFF', to: '#FF7EC8' },
  ink: { bg: '#2B0F3A', fg: 'text-ink', glow: 'rgb(255 255 255 / 0.12)', from: '#6C2BFF', to: '#FF7EC8' },
  chrome: { bg: '#EADFFF', fg: 'text-paper', glow: 'rgb(255 255 255 / 0.6)', from: '#6C2BFF', to: '#FF7EC8' },
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
        className="theme-light h-full rounded-[44px] border-[3px] border-[#2B0F3A] shadow-[var(--shadow-card)]"
        style={{ '--color-background': t.bg } as CSSProperties}
      >
        <MagicCard className="h-full rounded-[44px]" gradientFrom={t.from} gradientTo={t.to} gradientColor={t.glow} gradientSize={300}>
          <div className={cn('h-full p-7 md:p-9', t.fg, inner)}>{children}</div>
        </MagicCard>
      </motion.div>
    </div>
  )
}
