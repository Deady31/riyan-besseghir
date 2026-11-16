/**
 * Fond de repli (sans WebGL, ou avant que le fond animé n'arrive) : crème uni et grain léger.
 */
const GRAIN =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/%3E%3CfeColorMatrix values='0 0 0 0 0.125 0 0 0 0 0.13 0 0 0 0 0.12 0 0 0 0.55 0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")"

export function PaperBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 bg-ink" aria-hidden="true">
      <div className="absolute inset-0 opacity-[0.06]" style={{ backgroundImage: GRAIN }} />
    </div>
  )
}
