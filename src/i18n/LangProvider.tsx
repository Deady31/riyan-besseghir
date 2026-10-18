import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react'

export type Lang = 'fr' | 'en'

const KEY = 'riyan-lang'

function detect(): Lang {
  try {
    const saved = localStorage.getItem(KEY)
    if (saved === 'fr' || saved === 'en') return saved
  } catch {
    /* stockage indisponible : on retombe sur la langue du navigateur */
  }
  const prefs = navigator.languages?.length ? navigator.languages : [navigator.language]
  return prefs.some((l) => l?.toLowerCase().startsWith('fr')) ? 'fr' : 'en'
}

const LangContext = createContext<{ lang: Lang; setLang: (l: Lang) => void }>({ lang: 'fr', setLang: () => {} })

export const useLang = () => useContext(LangContext)

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(detect)

  useEffect(() => {
    document.documentElement.lang = lang
    document.querySelector('meta[name="description"]')?.setAttribute(
      'content',
      lang === 'fr'
        ? 'Riyan Besseghir, AI Product Manager. Agents IA en production, prototypes livrés en hackathon, 35 projets construits.'
        : 'Riyan Besseghir, AI Product Manager. AI agents in production, hackathon prototypes shipped, 35 projects built.',
    )
  }, [lang])

  const setLang = useCallback((l: Lang) => {
    setLangState(l)
    try {
      localStorage.setItem(KEY, l)
    } catch {
      /* choix non mémorisé, sans conséquence */
    }
  }, [])

  return <LangContext.Provider value={{ lang, setLang }}>{children}</LangContext.Provider>
}
