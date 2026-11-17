import { WaveField } from './components/backgrounds/WaveField'
import { lazy, Suspense, useCallback, useEffect, useRef, useState } from 'react'
import { Navigate, Outlet, Route, Routes, useLocation } from 'react-router'
import { SmoothScroll, scrollToId, useLenis } from './lib/SmoothScroll'
import { ScrollTrigger } from './lib/motion'
import { belowFold, useBelowFoldRequested } from './lib/belowFold'
import { LangProvider, useLang } from './i18n/LangProvider'
import { useT } from './i18n/useT'
import { usePageMeta } from './hooks/usePageMeta'
import { Nav } from './components/layout/Nav'
import { Hero } from './components/hero/Hero'
import { MorphMoment } from './components/sections/MorphMoment'
import { ProjectPage } from './components/project/ProjectPage'
import ClickSpark from './components/vendor/reactbits/ClickSpark'
import { PaperBackground } from './components/layout/PaperBackground'
import { BurnBackdrop } from './components/layout/BurnBackdrop'
import { Chapters } from './components/layout/Chapters'
import { HandCursor, HandPreview } from './components/cursor/HandCursor'
import { BurstCanvas } from './components/fx/BurstCanvas'
import { ToyHint } from './components/fx/ToyHint'
import { EggLayer } from './components/eggs/EggLayer'
const ModelPreview = lazy(() => import('./components/three/ModelPreview').then((m) => ({ default: m.ModelPreview })))
import { ScrollFx } from './components/night/ScrollFx'
import { useWebGLSupport } from './hooks/useWebGLSupport'

const SiteScene = lazy(() => import('./components/three/SiteScene'))
const BelowFold = lazy(() => import('./BelowFold'))

/** Place gardée pour le bas de l'accueil tant que son chunk n'est pas arrivé (pas de saut de page au défilement). */
const BelowFoldGap = () => <div aria-hidden="true" style={{ height: '100svh' }} />

/** Page d'accueil : au retour d'une carte projet, on retrouve la position quittée ou l'ancre demandée. */
function Home() {
  const { lang } = useLang()
  const lenis = useLenis()
  usePageMeta(null, null)
  const requested = useBelowFoldRequested()
  const [idle, setIdle] = useState(false)
  const [mounted, setMounted] = useState(false)
  const onMount = useCallback(() => setMounted(true), [])
  // Un retour de fiche projet ou un lien d'ancre a besoin du bas tout de suite.
  const pending = useRef(
    typeof window !== 'undefined' &&
      (sessionStorage.getItem('scrollTo') !== null || sessionStorage.getItem('homeY') !== null || window.location.hash.length > 1),
  )
  const wanted = requested || idle || pending.current

  useEffect(() => {
    // Le bas arrive quand le navigateur est au repos après le premier affichage, ou dès le premier défilement.
    const ric = (window as unknown as { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number }).requestIdleCallback
    const id = ric ? ric(() => setIdle(true), { timeout: 2500 }) : window.setTimeout(() => setIdle(true), 1200)
    const onScroll = () => belowFold.request()
    window.addEventListener('scroll', onScroll, { passive: true, once: true })
    return () => {
      if (!ric) window.clearTimeout(id)
      window.removeEventListener('scroll', onScroll)
    }
  }, [])

  useEffect(() => {
    const id = requestAnimationFrame(() => ScrollTrigger.refresh())
    return () => cancelAnimationFrame(id)
  }, [lang])

  useEffect(() => {
    if (!mounted && pending.current) return
    const target = sessionStorage.getItem('scrollTo')
    const y = sessionStorage.getItem('homeY')
    sessionStorage.removeItem('scrollTo')
    const timer = window.setTimeout(() => {
      ScrollTrigger.refresh()
      if (target) scrollToId(lenis, target)
      else if (y !== null) {
        if (lenis) lenis.scrollTo(Number(y), { immediate: true })
        else window.scrollTo(0, Number(y))
      }
      sessionStorage.removeItem('homeY')
    }, 350)
    return () => window.clearTimeout(timer)
  }, [lenis, mounted])

  return (
    <>
    <Chapters />
    <main key={lang} className="[overflow-x:clip]">
      <Hero />
      <MorphMoment />
      {wanted ? (
        <Suspense fallback={<BelowFoldGap />}>
          <BelowFold onMount={onMount} />
        </Suspense>
      ) : (
        <BelowFoldGap />
      )}
    </main>
    <EggLayer />
    </>
  )
}

function Shell() {
  const { lang } = useLang()
  const t = useT()
  const { pathname } = useLocation()
  const webgl = useWebGLSupport()
  return (
    <>
      <div role="navigation" aria-label={t.nav.skip}>
        <a
          href="#impact"
          className="sr-only z-[70] rounded-md bg-paper px-4 py-2 text-ink focus:not-sr-only focus:fixed focus:top-4 focus:left-4"
        >
          {t.nav.skip}
        </a>
      </div>
      <PaperBackground />
      <HandCursor />
      <BurstCanvas />
      <ToyHint />
      {webgl && <BurnBackdrop deps={`${lang}${pathname}`} />}
      {webgl && <WaveField />}
      <ScrollFx deps={`${lang}${pathname}`} />
      <Nav />
      <ClickSpark
        sparkColor={['#6C2BFF', '#FF7EC8', '#FFD83D', '#2B0F3A']}
        sparkCount={10}
        sparkSize={11}
        sparkRadius={34}
        duration={650}
        layer="front"
        className="!h-auto"
      >
        {webgl && (
          <Suspense fallback={null}>
            <SiteScene layer="back" />
            <SiteScene layer="front" />
          </Suspense>
        )}
        <Outlet />
      </ClickSpark>
    </>
  )
}

export default function App() {
  return (
    <LangProvider>
      <SmoothScroll>
        <Routes>
          <Route element={<Shell />}>
            <Route index element={<Home />} />
            <Route path="projets/:slug" element={<ProjectPage />} />
            {import.meta.env.DEV && <Route path="hand-preview" element={<HandPreview />} />}
            {import.meta.env.DEV && (
              <Route path="model-preview" element={<Suspense fallback={null}><ModelPreview /></Suspense>} />
            )}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </SmoothScroll>
    </LangProvider>
  )
}
