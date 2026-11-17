import { useSyncExternalStore } from 'react'

/**
 * Les sections du bas de l'accueil (du deck au contact) sont dans un chunk à part, chargé après le premier affichage
 * pour que le haut de page apparaisse plus vite. Ce petit magasin permet à n'importe qui (menu, lien d'ancre, retour
 * depuis une fiche projet, premier défilement) de demander ce chargement tout de suite.
 */
let requested = false
const listeners = new Set<() => void>()

export const belowFold = {
  request() {
    if (requested) return
    requested = true
    listeners.forEach((l) => l())
  },
  isRequested: () => requested,
  subscribe(l: () => void) {
    listeners.add(l)
    return () => listeners.delete(l)
  },
}

export const useBelowFoldRequested = () => useSyncExternalStore(belowFold.subscribe, belowFold.isRequested, () => false)
