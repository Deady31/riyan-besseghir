import { cn } from '../../lib/cn'

/**
 * Point d'accroche d'une forme 3D du fond. L'élément ne sert qu'à mesurer : position et largeur donnent
 * l'emplacement et la taille de la forme (voir SiteScene). Les classes responsives décident où elle vit.
 * `par` : décalage de parallaxe (plus c'est grand, plus la forme défile lentement), `tilt` : amplitude de rotation au scroll.
 */
export function Anchor({ kind, className, par, tilt }: { kind: string; className?: string; par?: number; tilt?: number }) {
  return (
    <span
      data-anchor={kind}
      data-par={par}
      data-tilt={tilt}
      aria-hidden="true"
      className={cn('pointer-events-none absolute block aspect-square', className)}
    />
  )
}
