import { useSyncExternalStore } from 'react'
import { phoneStage } from '../../lib/phoneStage'
import { cn } from '../../lib/cn'

/**
 * Téléphone 2D de repli : toujours là, sous la 3D. Il s'efface dès que le téléphone 3D est réellement dessiné, et reste
 * si la 3D ne vient jamais (WebGL absent ou perdu, chargement lent, machine limitée) : la démo reste visible et cliquable.
 * Même proportions que le modèle 3D : hauteur = largeur du carré, largeur ≈ 0,49 de la hauteur.
 */
export function PhoneMock({ screen }: { screen: string }) {
  const rendered = useSyncExternalStore(phoneStage.subscribe, () => phoneStage.state.rendered, () => false)
  return (
    <span
      aria-hidden="true"
      data-phone-mock
      className={cn(
        'pointer-events-none absolute top-1/2 left-1/2 block aspect-[1/2.05] w-[49%] -translate-x-1/2 -translate-y-1/2 rotate-[-4deg] transition-opacity duration-500',
        rendered ? 'opacity-0' : 'opacity-100',
      )}
    >
      <span className="relative block size-full overflow-hidden rounded-[18%/8.8%] border-[5px] border-[#b9bcc4] bg-black shadow-[6px_8px_0_rgb(43_15_58/0.9)]">
        <img src={screen} alt="" className="size-full object-cover object-top" draggable={false} />
        <span className="absolute top-[2.2%] left-1/2 h-[2.4%] w-[30%] -translate-x-1/2 rounded-full bg-black" />
      </span>
    </span>
  )
}
