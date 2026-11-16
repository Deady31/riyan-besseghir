/**
 * Les easter eggs : des petits personnages cachés dans les sections. Pour en ajouter un, ajouter une entrée ici.
 *
 * - `kind: '2d'`  : un sprite (PNG ou WebP, fond transparent) qui dépasse du bord de la section ; on le touche, il sort,
 *                   dit sa phrase et des particules jaillissent. `pos` est la position CSS dans la section,
 *                   `from` le côté d'où il se glisse. Le pixel art s'affiche net (pas de lissage).
 * - `kind: '3d'`  : un modèle GLB dans `public/media/3d/user/` (passé par `npm run models`). Il est jouable comme les
 *                   autres objets (on l'attrape, on le lance) et compte comme trouvé à la première prise.
 *                   `className` place l'objet (classes Tailwind : position et largeur en vw).
 *
 * `section` est l'identifiant d'une section de l'accueil : top, morph, deck, impact, hauts-faits, studio, ia, lab, about,
 * passions, contact.
 */
export type Egg = {
  id: string
  section: string
  kind: '2d' | '3d'
  src: string
  title: { fr: string; en: string }
  /** Phrase dite à la découverte (2D). */
  line?: { fr: string; en: string }
  /** 2D : taille en px et position CSS dans la section. */
  size?: number
  pos?: { top?: string; right?: string; bottom?: string; left?: string }
  from?: 'left' | 'right'
  /** 3D : classes de placement. */
  className?: string
}

export const EGGS: Egg[] = [
  {
    id: 'afk-skater',
    section: 'about',
    kind: '2d',
    src: '/media/afk/tap-0.png',
    size: 104,
    pos: { right: '1.2%', bottom: '5%' },
    from: 'right',
    title: { fr: 'Le skater AFK', en: 'The AFK skater' },
    line: { fr: 'Tu me cherchais ? Je tapais du pied en attendant le prochain projet.', en: 'Looking for me? I was tapping my foot, waiting for the next project.' },
  },
]
