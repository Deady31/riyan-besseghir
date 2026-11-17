import { lazy, Suspense } from 'react'
import { Navigate, Route, Routes, useLocation } from 'react-router'
import { LangProvider } from './i18n/LangProvider'
import { useMode } from './lib/visitorMode'
import { ChoiceGate } from './pages/ChoiceGate'

// Le portfolio complet (3D, GSAP, Lenis…) et la version recruteur sont chargés à la demande : l'écran de choix reste léger.
const FullSite = lazy(() => import('./FullSite'))
const Recruiter = lazy(() => import('./pages/Recruiter'))

/** À la racine seulement : écran de choix tant que le visiteur n'a pas choisi, puis redirection selon son choix. */
function Gated() {
  const mode = useMode()
  const { pathname } = useLocation()
  if (pathname === '/') {
    if (mode === null) return <ChoiceGate />
    if (mode === 'recruiter') return <Navigate to="/recruteur" replace />
  }
  return <FullSite />
}

export default function App() {
  return (
    <LangProvider>
      <Suspense fallback={null}>
        <Routes>
          <Route path="recruteur" element={<Recruiter />} />
          <Route path="*" element={<Gated />} />
        </Routes>
      </Suspense>
    </LangProvider>
  )
}
