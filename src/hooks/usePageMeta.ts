import { useEffect } from 'react'

const DEFAULT_TITLE = 'Riyan Besseghir · AI Product Manager'

function setMeta(selector: string, attr: 'name' | 'property', key: string, content: string) {
  let el = document.head.querySelector<HTMLMetaElement>(selector)
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute(attr, key)
    document.head.appendChild(el)
  }
  el.content = content
}

/** Titre, description et Open Graph de la page courante (une URL par projet, indexable). */
export function usePageMeta(title: string | null, description: string | null) {
  useEffect(() => {
    const t = title ? `${title} · Riyan Besseghir` : DEFAULT_TITLE
    document.title = t
    setMeta('meta[property="og:title"]', 'property', 'og:title', t)
    if (description) {
      setMeta('meta[name="description"]', 'name', 'description', description)
      setMeta('meta[property="og:description"]', 'property', 'og:description', description)
    }
  }, [title, description])
}
