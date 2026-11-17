/**
 * Planche d'états de la main : gant de dessin animé, formes très rondes, double contour, reflets brillants, ombre dure.
 * Chaque état est un groupe `g[data-s]` ; le CSS (index.css) n'affiche que celui qui correspond à `data-state`.
 * Contour par superposition : les formes sont dessinées une fois en encre épaisse, une fois en ivoire, ce qui fait un
 * contour unique autour de l'ensemble (les doigts fusionnent avec la paume).
 */
const INK = '#2B0F3A'
const IVORY = '#FFF6E5'
const COBALT = '#6C2BFF'
const VERMILION = '#FF7EC8'

function Outlined({ id, fill = IVORY }: { id: string; fill?: string }) {
  return (
    <>
      <use href={`#${id}`} fill={INK} stroke={INK} strokeWidth={11} strokeLinejoin="round" />
      <use href={`#${id}`} fill={fill} />
    </>
  )
}

/** Halo ivoire (effet autocollant, visible sur fond sombre) puis ombre dure d'encre décalée. */
function Lift({ id }: { id: string }) {
  return (
    <>
      <use href={`#${id}`} fill={IVORY} stroke={IVORY} strokeWidth={19} strokeLinejoin="round" />
      <g transform="translate(3 3.5)">
        <use href={`#${id}`} fill={IVORY} stroke={IVORY} strokeWidth={19} strokeLinejoin="round" />
        <use href={`#${id}`} fill={INK} stroke={INK} strokeWidth={11} strokeLinejoin="round" />
      </g>
    </>
  )
}

function Sparkle({ x, y, s = 1, rot = 0 }: { x: number; y: number; s?: number; rot?: number }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`} className="hand-spark">
      <path d="M0 -9 C1.5 -3 3 -1.5 9 0 C3 1.5 1.5 3 0 9 C-1.5 3 -3 1.5 -9 0 C-3 -1.5 -1.5 -3 0 -9 Z" fill="#FFD83D" stroke={INK} strokeWidth="2.6" strokeLinejoin="round" />
    </g>
  )
}

function Cuff() {
  return (
    <g>
      <rect x="25" y="77" width="44" height="19" rx="9.5" fill={INK} stroke={INK} strokeWidth="10" strokeLinejoin="round" />
      <rect x="25" y="77" width="44" height="19" rx="9.5" fill={COBALT} />
      <ellipse cx="36" cy="82" rx="6" ry="2.6" fill="#fff" opacity=".6" />
      <circle cx="58" cy="88" r="2" fill="#fff" opacity=".85" />
      <circle cx="49" cy="90" r="1.5" fill="#fff" opacity=".7" />
    </g>
  )
}

function Gloss({ x = 36, y = 58 }: { x?: number; y?: number }) {
  return (
    <g>
      <ellipse cx={x} cy={y} rx="5.4" ry="9" fill="#fff" opacity=".85" transform={`rotate(-18 ${x} ${y})`} />
      <circle cx={x + 3} cy={y - 14} r="2.1" fill="#fff" opacity=".9" />
    </g>
  )
}

export function HandSprites() {
  return (
    <svg viewBox="0 0 100 100" width="100%" height="100%" aria-hidden="true" focusable="false" overflow="visible">
      <defs>
        <g id="h-open">
          <ellipse cx="47" cy="61" rx="25" ry="21" />
          <rect x="26" y="26" width="12" height="36" rx="6" transform="rotate(-11 32 58)" />
          <rect x="39" y="17" width="12.5" height="42" rx="6.2" transform="rotate(-3 45 58)" />
          <rect x="52" y="21" width="12" height="38" rx="6" transform="rotate(5 58 58)" />
          <rect x="64" y="31" width="11" height="30" rx="5.5" transform="rotate(13 69 58)" />
          <rect x="11" y="49" width="12" height="29" rx="6" transform="rotate(-48 17 66)" />
        </g>
        <g id="h-claw">
          <ellipse cx="47" cy="62" rx="25" ry="20" />
          <rect x="27" y="35" width="12" height="28" rx="6" transform="rotate(-20 33 58)" />
          <rect x="39" y="29" width="12.5" height="32" rx="6.2" transform="rotate(-7 45 58)" />
          <rect x="52" y="31" width="12" height="30" rx="6" transform="rotate(8 58 58)" />
          <rect x="63" y="38" width="11" height="24" rx="5.5" transform="rotate(20 68 58)" />
          <rect x="11" y="52" width="12" height="26" rx="6" transform="rotate(-62 17 68)" />
        </g>
        <g id="h-point">
          <rect x="21" y="44" width="54" height="36" rx="18" />
          <rect x="35" y="6" width="13.5" height="54" rx="6.7" transform="rotate(-2 41 58)" />
          <circle cx="60" cy="50" r="9" />
          <circle cx="69" cy="57" r="8.4" />
        </g>
        <g id="h-fist">
          <rect x="18" y="35" width="60" height="44" rx="21" />
          <circle cx="30" cy="38" r="9.6" />
          <circle cx="42" cy="35" r="9.8" />
          <circle cx="54" cy="35" r="9.8" />
          <circle cx="66" cy="38" r="9.2" />
        </g>
        <g id="h-thumb-point">
          <ellipse cx="32" cy="64" rx="12" ry="7.2" transform="rotate(-24 32 64)" />
        </g>
        <g id="h-thumb-fist">
          <rect x="24" y="57" width="36" height="15" rx="7.5" transform="rotate(-9 42 64)" />
        </g>
      </defs>

      <g data-s="idle">
        <Lift id="h-open" />
        <Outlined id="h-open" />
        <Cuff />
        <Gloss />
        <circle cx="47" cy="70" r="3.6" fill={VERMILION} />
        <Sparkle x={86} y={12} s={0.9} rot={10} />
        <Sparkle x={8} y={22} s={0.55} />
      </g>

      <g data-s="grab">
        <Lift id="h-claw" />
        <Outlined id="h-claw" />
        <Cuff />
        <Gloss y={60} />
        <circle cx="47" cy="71" r="3.6" fill={VERMILION} />
        <Sparkle x={84} y={20} s={0.8} rot={-8} />
      </g>

      <g data-s="point">
        <Lift id="h-point" />
        {/* Le pouce est replié DERRIÈRE la paume : on le dessine d'abord, la paume le recouvre. */}
        <Outlined id="h-thumb-point" />
        <Outlined id="h-point" />
        <Cuff />
        <ellipse cx="41.5" cy="20" rx="2.8" ry="7" fill="#fff" opacity=".9" transform="rotate(-2 41 20)" />
      </g>

      <g data-s="fist">
        <Lift id="h-fist" />
        <Outlined id="h-fist" />
        <Outlined id="h-thumb-fist" />
        <Cuff />
        <ellipse cx="36" cy="49" rx="9" ry="3.6" fill="#fff" opacity=".8" />
        <circle cx="48" cy="44" r="2.2" fill="#fff" opacity=".9" />
      </g>

      <g data-s="tap">
        <circle className="hand-ring" cx="41.5" cy="8" r="9" fill="none" stroke={COBALT} strokeWidth="3" />
        <circle className="hand-ring hand-ring-2" cx="41.5" cy="8" r="9" fill="none" stroke={VERMILION} strokeWidth="3" />
        <Lift id="h-point" />
        <Outlined id="h-thumb-point" />
        <Outlined id="h-point" />
        <Cuff />
        <ellipse cx="41.5" cy="20" rx="2.8" ry="7" fill="#fff" opacity=".9" transform="rotate(-2 41 20)" />
      </g>
    </svg>
  )
}
