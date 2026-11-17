/** Les chapitres de l'accueil, dans l'ordre de la page : une seule liste pour le menu et le rail de gauche. */
export const CHAPTERS = [
  { id: 'top', fr: 'Intro', en: 'Intro' },
  { id: 'morph', fr: 'Trente-neuf', en: 'Thirty-nine' },
  { id: 'deck', fr: 'Le deck', en: 'The deck' },
  { id: 'impact', fr: 'Impact', en: 'Impact' },
  { id: 'hauts-faits', fr: 'Hauts faits', en: 'Highlights' },
  { id: 'studio', fr: 'Builder', en: 'Builder' },
  { id: 'demo', fr: 'Démo FOODER', en: 'FOODER demo' },
  { id: 'ia', fr: 'Agents IA', en: 'AI agents' },
  { id: 'lab', fr: 'Index des projets', en: 'Project index' },
  { id: 'about', fr: 'À propos', en: 'About' },
  { id: 'passions', fr: 'Passions', en: 'Passions' },
  { id: 'contact', fr: 'Contact', en: 'Contact' },
] as const

export type ChapterId = (typeof CHAPTERS)[number]['id']
