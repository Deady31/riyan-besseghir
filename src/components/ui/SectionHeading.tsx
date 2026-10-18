import { RevealText } from './RevealText'
import { cn } from '../../lib/cn'

type Props = {
  index: string
  label: string
  title: React.ReactNode
  intro?: string
  className?: string
}

export function SectionHeading({ index, label, title, intro, className }: Props) {
  return (
    <header className={cn('mb-16 grid gap-8 md:mb-24 md:grid-cols-[minmax(0,1fr)_minmax(0,3fr)]', className)}>
      <p className="label flex gap-3 pt-3 text-mist">
        <span>({index})</span>
        <span className="text-paper">{label}</span>
      </p>
      <div>
        <RevealText as="h2" className="display max-w-5xl text-[length:var(--text-title)] text-balance">
          {title}
        </RevealText>
        {intro && (
          <RevealText className="mt-8 max-w-xl text-lg leading-relaxed text-mist" delay={0.15}>
            {intro}
          </RevealText>
        )}
      </div>
    </header>
  )
}
