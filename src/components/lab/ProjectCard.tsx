import { motion } from 'motion/react'
import type { Category, Project } from '../../data/projects'
import { CardBody, CardContainer, CardItem } from '../vendor/aceternity/3d-card'
import { MagicCard } from '../vendor/magicui/magic-card'
import { cn } from '../../lib/cn'

/** Couleur d'aplat par catégorie : on reconnaît la famille d'un coup d'œil. */
export const CATEGORY_TINT: Record<Category, string> = {
  consumer: 'bg-vermilion text-paper',
  ia: 'bg-signal text-ink',
  outils: 'bg-chrome text-paper',
  jeux: 'bg-lemon text-paper',
  pm: 'bg-paper text-ink',
  clients: 'bg-graphite-2 text-paper',
}

/** Rareté façon carte à collectionner : un projet en ligne ou mis en avant brille. */
export function rarity(p: Project): 1 | 2 | 3 {
  if (p.highlight || p.link) return 3
  if (p.shots.length > 0 && p.status !== 'Prototype' && p.status !== 'Cadrage' && p.status !== 'Démarrage') return 2
  return 1
}

type Props = {
  project: Project
  number: number
  total: number
  categoryLabel: string
  onOpen: (p: Project) => void
}

/**
 * Carte projet : grande, très arrondie.
 * - survol : inclinaison 3D (Aceternity 3D Card) dont l'image et le titre se décollent, + halo qui suit le curseur (Magic UI Magic Card)
 * - appui : la carte s'écrase en ressort (Motion) et projette des étincelles (React Bits Click Spark, posé sur la page)
 */
export function ProjectCard({ project, number, total, categoryLabel, onOpen }: Props) {
  const shot = project.shots[0]
  const level = rarity(project)
  const mobileShot = shot?.frame === 'mobile'

  return (
    <CardContainer containerClassName="!py-0 w-full" className="w-full">
      <CardBody className="!h-auto !w-full">
        <motion.button
          type="button"
          onClick={() => onOpen(project)}
          whileHover={{ y: -8 }}
          whileTap={{ scale: 0.94, rotate: -0.6 }}
          transition={{ type: 'spring', stiffness: 380, damping: 20 }}
          className="group block w-full rounded-[44px] text-left shadow-[var(--shadow-card)] focus-visible:outline-offset-4"
          aria-label={project.title}
        >
          <MagicCard
            className="rounded-[44px]"
            gradientFrom="#254dff"
            gradientTo="#f05235"
            gradientColor="rgb(37 77 255 / 0.14)"
            gradientSize={320}
          >
            <span className="block p-3.5 md:p-4">
              <CardItem translateZ={60} className="block w-full">
                <span className={cn('relative block aspect-[5/4] overflow-hidden rounded-[32px]', CATEGORY_TINT[project.category])}>
                  {shot ? (
                    <img
                      src={shot.src}
                      alt=""
                      loading="lazy"
                      decoding="async"
                      className={cn(
                        'size-full transition-transform duration-700 ease-[var(--ease-expo)] group-hover:scale-[1.06]',
                        mobileShot ? 'object-contain object-top px-[22%] pt-5' : 'object-cover object-top',
                      )}
                    />
                  ) : (
                    <span className="display grid size-full place-items-center text-6xl opacity-60">{project.title.slice(0, 2)}</span>
                  )}
                  {project.highlight && (
                    <span className="sticker absolute top-4 left-4 bg-lemon text-paper">{project.highlight}</span>
                  )}
                </span>
              </CardItem>

              <span className="block px-2.5 pt-5 pb-3 md:px-3">
                <CardItem translateZ={34} className="flex w-full items-center justify-between gap-3">
                  <span className="label text-mist">{categoryLabel}</span>
                  <span className="label text-mist" aria-label={`${level} / 3`}>
                    {'★'.repeat(level)}
                    <span className="opacity-25">{'★'.repeat(3 - level)}</span>
                  </span>
                </CardItem>
                <CardItem translateZ={48} className="mt-3 block w-full">
                  <span className="display block text-[clamp(1.5rem,1.1rem+1vw,2.1rem)] leading-[0.98]">{project.title}</span>
                </CardItem>
                <CardItem translateZ={26} className="mt-3 block w-full">
                  <span className="line-clamp-2 block text-[15px] leading-snug text-mist">{project.tagline}</span>
                </CardItem>
                <CardItem translateZ={40} className="mt-5 flex w-full items-center justify-between gap-3">
                  <span className="sticker bg-paper text-ink">{project.status}</span>
                  <span className="label text-mist">
                    {String(number).padStart(2, '0')}/{total}
                  </span>
                </CardItem>
              </span>
            </span>
          </MagicCard>
        </motion.button>
      </CardBody>
    </CardContainer>
  )
}
