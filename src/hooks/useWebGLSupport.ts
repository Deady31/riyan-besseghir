import { useEffect, useState } from 'react'

/** Détecte WebGL sans garder de contexte : le site doit rester complet quand il est indisponible. */
export function useWebGLSupport() {
  const [ok, setOk] = useState<boolean | null>(null)
  useEffect(() => {
    try {
      const c = document.createElement('canvas')
      const gl = c.getContext('webgl2') ?? c.getContext('webgl')
      setOk(Boolean(gl))
      gl?.getExtension('WEBGL_lose_context')?.loseContext()
    } catch {
      setOk(false)
    }
  }, [])
  return ok
}
