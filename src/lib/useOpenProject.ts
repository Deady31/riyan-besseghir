import { useCallback } from 'react'
import { useNavigate } from 'react-router'
import type { Project } from '../data/projects'

/** Ouvre la carte d'un projet : mémorise la position dans la page d'accueil pour y revenir au retour. */
export function useOpenProject() {
  const navigate = useNavigate()
  return useCallback(
    (p: Project) => {
      sessionStorage.setItem('homeY', String(window.scrollY))
      navigate(`/projets/${p.id}`)
    },
    [navigate],
  )
}
