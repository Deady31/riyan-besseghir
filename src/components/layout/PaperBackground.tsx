/**
 * Fond papier de repli (sans WebGL, ou avant que le fond animé n'arrive) : ivoire, trois lavis de couleur,
 * grille de points et grain léger, pour que les aplats et la 3D aient une matière sous eux.
 */
const GRAIN =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/%3E%3CfeColorMatrix values='0 0 0 0 0.125 0 0 0 0 0.13 0 0 0 0 0.12 0 0 0 0.55 0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")"

export function PaperBackground() {
  return (
    <div
      className="pointer-events-none fixed inset-0 -z-10 bg-ink"
      style={{
        backgroundImage:
          'radial-gradient(60vw 50vh at 12% 18%, rgb(37 77 255 / 0.14), transparent 70%), radial-gradient(55vw 45vh at 90% 70%, rgb(240 82 53 / 0.14), transparent 70%), radial-gradient(40vw 35vh at 60% 100%, rgb(217 240 90 / 0.3), transparent 70%)',
      }}
      aria-hidden="true"
    >
      <div className="absolute inset-0 opacity-[0.12]" style={{ backgroundImage: 'radial-gradient(#20211f 1px, transparent 1.2px)', backgroundSize: '26px 26px' }} />
      <div className="absolute inset-0 opacity-[0.07]" style={{ backgroundImage: GRAIN }} />
    </div>
  )
}
