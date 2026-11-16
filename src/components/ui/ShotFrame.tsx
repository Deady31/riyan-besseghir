import type { Shot } from '../../data/projects'
import { cn } from '../../lib/cn'

export function ShotFrame({ shot, className, eager = false }: { shot: Shot; className?: string; eager?: boolean }) {
  if (shot.frame === 'mobile') {
    return (
      <div className={cn('overflow-hidden rounded-[26px] border-2 border-line bg-graphite p-1.5 shadow-[var(--shadow-card)]', className)}>
        <img
          src={shot.src}
          alt={shot.alt}
          width={430}
          height={932}
          loading={eager ? 'eager' : 'lazy'}
          decoding="async"
          className="aspect-[430/932] w-full rounded-[20px] object-cover object-top"
        />
      </div>
    )
  }
  return (
    <div className={cn('overflow-hidden rounded-xl border-2 border-line bg-graphite shadow-[var(--shadow-card)]', className)}>
      <div className="flex items-center gap-1.5 border-b-2 border-line bg-graphite-2 px-3 py-2" aria-hidden="true">
        <span className="size-2.5 rounded-full border border-line bg-bubblegum" />
        <span className="size-2.5 rounded-full border border-line bg-lemon" />
        <span className="size-2.5 rounded-full border border-line bg-mint" />
      </div>
      <img
        src={shot.src}
        alt={shot.alt}
        width={1440}
        height={900}
        loading={eager ? 'eager' : 'lazy'}
        decoding="async"
        className="aspect-[16/10] w-full object-cover object-top"
      />
    </div>
  )
}
