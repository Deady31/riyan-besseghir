import { RevealText } from './RevealText'
import { cn } from '../../lib/cn'

type Props = {
  index: string
  label: string
  title: React.ReactNode
  intro?: string
  className?: string
  /** Alterner gauche / droite d'une section à l'autre casse la colonne vide et donne du rythme. */
  align?: 'left' | 'right'
}

export function SectionHeading({ index, label, title, intro, className, align = 'left' }: Props) {
  const right = align === 'right'
  return (
    <header data-drift className={cn('mb-16 flex flex-col gap-6 md:mb-24', right && 'md:items-end md:text-right', className)}>
      <p className={cn('flex items-center gap-3', right && 'md:flex-row-reverse')}>
        <span className="sticker -rotate-2 bg-lemon">{label}</span>
        <span className="label text-mist">({index})</span>
      </p>
      <RevealText as="h2" className="display title-outline max-w-6xl text-[length:var(--text-title)] text-balance">
        {title}
      </RevealText>
      {intro && (
        <p data-light className={cn('max-w-xl text-lg leading-relaxed text-paper', right ? 'md:mr-[8%]' : 'md:ml-[30%]')}>
          {intro}
        </p>
      )}
    </header>
  )
}
