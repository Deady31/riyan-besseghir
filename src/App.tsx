import { useEffect } from 'react'
import { SmoothScroll } from './lib/SmoothScroll'
import { ScrollTrigger } from './lib/motion'
import { LangProvider, useLang } from './i18n/LangProvider'
import { useT } from './i18n/useT'
import { Nav } from './components/layout/Nav'
import { PortraitField } from './components/layout/PortraitField'
import { Hero } from './components/hero/Hero'
import { Impact } from './components/sections/Impact'
import { MorphMoment } from './components/sections/MorphMoment'
import { Feats } from './components/sections/Feats'
import { AiSpotlight } from './components/ai/AiSpotlight'
import { ProjectIndex } from './components/lab/ProjectIndex'
import { Passions } from './components/sections/Passions'
import { About } from './components/sections/About'
import { Contact } from './components/sections/Contact'
import { ProjectDialogProvider } from './components/lab/ProjectDialog'

function Site() {
  const { lang } = useLang()
  const t = useT()

  useEffect(() => {
    const id = requestAnimationFrame(() => ScrollTrigger.refresh())
    return () => cancelAnimationFrame(id)
  }, [lang])

  return (
    <ProjectDialogProvider>
      <a
        href="#impact"
        className="sr-only z-[70] rounded-md bg-paper px-4 py-2 text-ink focus:not-sr-only focus:fixed focus:top-4 focus:left-4"
      >
        {t.nav.skip}
      </a>
      <PortraitField />
      <Nav />
      <main key={lang}>
        <Hero />
        <MorphMoment />
        <Impact />
        <Feats />
        <AiSpotlight />
        <ProjectIndex />
        <About />
        <Passions />
        <Contact />
      </main>
    </ProjectDialogProvider>
  )
}

export default function App() {
  return (
    <LangProvider>
      <SmoothScroll>
        <Site />
      </SmoothScroll>
    </LangProvider>
  )
}
