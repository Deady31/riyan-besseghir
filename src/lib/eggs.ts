/** Easter eggs trouvés, gardés dans le navigateur de la personne (aucun envoi nulle part). */
const KEY = 'eggs-found'

export function eggsFound(): string[] {
  try {
    const raw = localStorage.getItem(KEY)
    const list = raw ? (JSON.parse(raw) as unknown) : []
    return Array.isArray(list) ? list.filter((x): x is string => typeof x === 'string') : []
  } catch {
    return []
  }
}

/** Marque un œuf comme trouvé ; retourne true si c'est la première fois. L'événement `egg-found` sert au petit message. */
export function markFound(id: string, total: number): boolean {
  const found = eggsFound()
  if (found.includes(id)) return false
  try {
    localStorage.setItem(KEY, JSON.stringify([...found, id]))
  } catch {
    /* stockage indisponible : le message s'affiche quand même cette fois-ci */
  }
  window.dispatchEvent(new CustomEvent('egg-found', { detail: { count: found.length + 1, total } }))
  return true
}
