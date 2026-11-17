import { useSyncExternalStore } from 'react'

/**
 * Le téléphone 3D passe de sa place dans la page à la scène plein écran où l'appli devient utilisable.
 * `open` est l'intention (bouton Essayer / fermer) ; `t` va de 0 à 1 et est écrit à chaque image par la scène 3D,
 * ce qui permet à l'écran HTML de n'apparaître que lorsque le téléphone est vraiment en place.
 */
type Stage = { open: boolean; t: number; hover: boolean; rendered: boolean }
const state: Stage = { open: false, t: 0, hover: false, rendered: false }
const listeners = new Set<() => void>()
const emit = () => listeners.forEach((l) => l())

export const phoneStage = {
  state,
  setOpen(open: boolean) {
    if (state.open === open) return
    state.open = open
    emit()
  },
  /** La scène 3D dit si son téléphone existe vraiment à l'écran (faux si WebGL est absent, perdu ou trop lent). */
  setRendered(rendered: boolean) {
    if (state.rendered === rendered) return
    state.rendered = rendered
    emit()
  },
  /** Survol du téléphone dans la page : lu à chaque image par la scène 3D (pas de rendu React). */
  setHover(hover: boolean) {
    state.hover = hover
  },
  subscribe(l: () => void) {
    listeners.add(l)
    return () => listeners.delete(l)
  },
}

export const usePhoneRendered = () => useSyncExternalStore(phoneStage.subscribe, () => state.rendered, () => false)
export const usePhoneOpen = () => useSyncExternalStore(phoneStage.subscribe, () => state.open, () => false)
