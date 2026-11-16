import { useEffect, useState } from 'react'
import { X } from 'lucide-react'
import { phoneStage, usePhoneOpen } from '../../lib/phoneStage'
import { useLenis } from '../../lib/SmoothScroll'
import { cn } from '../../lib/cn'

/**
 * Scène plein écran du téléphone : le modèle 3D (calque avant) se centre et grandit, puis l'appli réelle
 * apparaît dans son écran. Les proportions de l'écran viennent du modèle Blender (écran 0,915 × 1,965 pour un téléphone de 1,0 × 2,05).
 */
const SCREEN_W = 0.915 / 2.05
const SCREEN_H = 1.965 / 2.05
const SCREEN_RADIUS = 0.115 / 2.05

export function PhoneStage({ url, title, closeLabel }: { url: string; title: string; closeLabel: string }) {
  const open = usePhoneOpen()
  const lenis = useLenis()
  const [ready, setReady] = useState(false)

  useEffect(() => {
    if (!open) {
      setReady(false)
      return
    }
    lenis?.stop()
    let raf = 0
    const poll = () => {
      if (phoneStage.state.t > 0.97) setReady(true)
      else raf = requestAnimationFrame(poll)
    }
    poll()
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && phoneStage.setOpen(false)
    window.addEventListener('keydown', onKey)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('keydown', onKey)
      lenis?.start()
    }
  }, [open, lenis])

  // Si on quitte la page avec le téléphone ouvert, on le referme.
  useEffect(() => () => phoneStage.setOpen(false), [])

  const side = 'min(84svh, 180vw)'
  return (
    <>
      <div
        onClick={() => phoneStage.setOpen(false)}
        className={cn('fixed inset-0 z-[38] bg-ink/90 transition-opacity duration-500', open ? 'opacity-100' : 'pointer-events-none opacity-0')}
        aria-hidden="true"
      />
      {/* Cible du téléphone 3D : un carré centré dont le côté est la hauteur du téléphone. */}
      <div
        id="phone-stage"
        aria-hidden="true"
        className="pointer-events-none fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
        style={{ width: side, height: side }}
      />
      {open && (
        <button
          type="button"
          onClick={() => phoneStage.setOpen(false)}
          className="pop fixed top-[4.9rem] right-5 z-[60] grid size-12 place-items-center bg-paper text-ink max-md:top-auto max-md:right-1/2 max-md:bottom-3 max-md:translate-x-1/2"
          aria-label={closeLabel}
        >
          <X className="size-5" aria-hidden="true" />
        </button>
      )}
      {open && ready && (
        <div
          className="fixed top-1/2 left-1/2 z-[50] -translate-x-1/2 -translate-y-1/2 overflow-hidden bg-white"
          style={{
            width: `calc(${side} * ${SCREEN_W})`,
            height: `calc(${side} * ${SCREEN_H})`,
            borderRadius: `calc(${side} * ${SCREEN_RADIUS})`,
          }}
        >
          <iframe src={url} title={title} allow="geolocation" referrerPolicy="strict-origin-when-cross-origin" className="size-full border-0" />
        </div>
      )}
    </>
  )
}
