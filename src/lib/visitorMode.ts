import { useSyncExternalStore } from 'react'

/**
 * Le choix du visiteur à son arrivée : « recruteur » (version courte, /recruteur) ou « full » (portfolio complet).
 * Mémorisé dans le navigateur (localStorage) ; `null` tant qu'il n'a pas choisi, ce qui affiche l'écran de choix.
 */
export type Mode = 'recruiter' | 'full'
const KEY = 'riyan-mode'
const listeners = new Set<() => void>()
let memo: Mode | null | undefined

function read(): Mode | null {
  try {
    const v = localStorage.getItem(KEY)
    return v === 'recruiter' || v === 'full' ? v : null
  } catch {
    return null
  }
}

export const getMode = (): Mode | null => (memo === undefined ? (memo = read()) : memo)

export function setMode(mode: Mode) {
  memo = mode
  try {
    localStorage.setItem(KEY, mode)
  } catch {
    /* navigation privée : le choix vaut pour cette session seulement */
  }
  listeners.forEach((l) => l())
}

export const useMode = () =>
  useSyncExternalStore(
    (l) => {
      listeners.add(l)
      return () => listeners.delete(l)
    },
    getMode,
    () => null,
  )
