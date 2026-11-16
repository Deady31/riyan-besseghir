import { lazy, Suspense, useEffect } from 'react'
import { Navigate, Outlet, Route, Routes, useLocation } from 'react-router'
import { SmoothScroll, scrollToId, useLenis } from './lib/SmoothScroll'
import { ScrollTrigger } from './lib/motion'
import { LangProvider, useLang } from './i18n/LangProvider'
import { useT } from './i18n/useT'
import { usePageMeta } from './hooks/usePageMeta'
import { Nav } from './components/layout/Nav'
import { Hero } from './components/hero/Hero'
import { SwipeDeck } from './components/deck/SwipeDeck'
import { Impact } from './components/sections/Impact'
import { MorphMoment } from './components/sections/MorphMoment'
import { Feats } from './components/sections/Feats'
import { Studio } from './components/sections/Studio'
import { AiSpotlight } from './components/ai/AiSpotlight'
import { ProjectIndex } from './components/lab/ProjectIndex'
import { Passions } from './components/sections/Passions'
import { About } from './components/sections/About'
import { Contact } from './components/sections/Contact'
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

/** Page d'accueil : au retour d'une carte projet, on retrouve la position quittée ou l'ancre demandée. */
function Home() {
  const { lang } = useLang()
  const lenis = useLenis()
  usePageMeta(null, null)

  useEffect(() => {
    const id = requestAnimationFrame(() => ScrollTrigger.refresh())
    return () => cancelAnimationFrame(id)
  }, [lang])

  useEffect(() => {
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
  }, [lenis])

  return (
    <>
    <Chapters />
    <main key={lang} className="[overflow-x:clip]">
      <Hero />
      <MorphMoment />
      <SwipeDeck />
      <Impact />
      <Feats />
      <Studio />
      <AiSpotlight />
      <ProjectIndex />
      <About />
      <Passions />
      <Contact />
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
      <ScrollFx deps={`${lang}${pathname}`} />
      <Nav />
      <ClickSpark
        sparkColor={['#254dff', '#f05235', '#d9f05a', '#20211f']}
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
