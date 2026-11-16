/**
 * Le portrait de Riyan en estampe de trame (tools/portrait/build_portrait.py) : trois plaques superposées, comme à
 * l'impression. À l'arrivée elles s'impriment l'une après l'autre (ivoire, vermillon, encre), chacune légèrement
 * décalée avant de se caler ; ensuite la plaque vermillon garde un très léger défaut de repérage qui respire.
 * Rien ne dépend du curseur. Mouvement réduit : image fixe.
 */
const LAYERS = [
  { src: '/media/portrait/fill.webp', cls: 'print-fill' },
  { src: '/media/portrait/dots.webp', cls: 'print-dots' },
  { src: '/media/portrait/ink.webp', cls: 'print-ink' },
] as const

export function HeroPortrait() {
  return (
    <div
      data-slab
      aria-hidden="true"
      className="pointer-events-none absolute top-[4.75rem] right-[7%] z-[5] h-[calc(78%-4.75rem)] w-[34%] max-md:top-36 max-md:right-3 max-md:left-[16%] max-md:h-[36%] max-md:w-auto"
    >
      <div
        className="absolute top-0 left-1/2 aspect-[900/1059] h-[91%] -translate-x-1/2"
        style={{ maskImage: 'linear-gradient(to bottom, #000 80%, transparent 100%)', WebkitMaskImage: 'linear-gradient(to bottom, #000 80%, transparent 100%)' }}
      >
        {LAYERS.map((l, i) => (
          <img
            key={l.src}
            src={l.src}
            alt=""
            width={900}
            height={1059}
            decoding="async"
            fetchPriority={i === 0 ? 'high' : 'auto'}
            draggable={false}
            className={`absolute inset-0 size-full select-none ${l.cls}`}
          />
        ))}
      </div>
    </div>
  )
}
