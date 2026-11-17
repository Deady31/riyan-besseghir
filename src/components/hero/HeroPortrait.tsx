/**
 * Le portrait de Riyan : sa photo détourée, en couleurs naturelles légèrement relevées, posée comme un autocollant
 * (bord crème, contour prune) sur le bloc violet du hero (tools/portrait/build_portrait_v2.py).
 * Il arrive une seule fois en se collant (petite montée et rotation qui se pose), puis ne bouge plus.
 * Le bas du buste se fond dans le bloc pour laisser le nom lisible. Mouvement réduit : image fixe.
 */
export function HeroPortrait() {
  return (
    <div
      data-slab
      aria-hidden="true"
      className="pointer-events-none absolute top-[4.75rem] right-[7%] z-[5] h-[calc(78%-4.75rem)] w-[34%] max-md:top-36 max-md:right-3 max-md:left-[16%] max-md:h-[36%] max-md:w-auto"
    >
      <div
        className="sticker-in absolute top-[2%] left-1/2 aspect-[900/1059] h-[92%] -translate-x-1/2"
        style={{ maskImage: 'linear-gradient(to bottom, #000 82%, transparent 100%)', WebkitMaskImage: 'linear-gradient(to bottom, #000 82%, transparent 100%)' }}
      >
        <img
          src="/media/portrait/naturel.webp"
          alt=""
          width={900}
          height={1059}
          decoding="async"
          fetchPriority="high"
          draggable={false}
          className="size-full select-none"
        />
      </div>
    </div>
  )
}
