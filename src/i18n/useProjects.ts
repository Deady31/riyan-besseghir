import { useMemo } from 'react'
import { CATEGORIES, PROJECTS, type Category, type Project } from '../data/projects'
import { useLang } from './LangProvider'
import { CATEGORIES_EN, PROJECTS_EN, STATUS_EN } from './projects-en'

const EN_PROJECTS: Project[] = PROJECTS.map((p) => {
  const o = PROJECTS_EN[p.id]
  return {
    ...p,
    title: o?.title ?? p.title,
    tagline: o?.tagline ?? p.tagline,
    description: o?.description ?? p.description,
    status: STATUS_EN[p.status] ?? p.status,
    highlight: p.highlight === 'Projet à la une' ? 'Featured' : p.highlight === 'Jeu' ? 'Game' : p.highlight === 'Rétro-ingénierie' ? 'Reverse engineering' : p.highlight,
  }
})

const EN_CATEGORIES = CATEGORIES.map((c) => ({ ...c, ...CATEGORIES_EN[c.id as Category] }))

export function useProjects() {
  const { lang } = useLang()
  return useMemo(() => {
    const projects = lang === 'en' ? EN_PROJECTS : PROJECTS
    const categories = lang === 'en' ? EN_CATEGORIES : CATEGORIES
    return {
      projects,
      categories,
      byId: (id: string) => projects.find((p) => p.id === id),
    }
  }, [lang])
}
