import { useRef } from 'react'
import { ArrowDown, ArrowUpRight } from 'lucide-react'
import { motion } from 'motion/react'
import { ShimmerButton } from '../vendor/magicui/shimmer-button'
import { gsap, SplitText, useGSAP, prefersReducedMotion } from '../../lib/motion'
import { scrollToId, useLenis } from '../../lib/SmoothScroll'
import { useContent } from '../../data/profile'
import { useT } from '../../i18n/useT'
import { LiveClock } from '../ui/LiveClock'
import { Anchor } from '../three/Anchor'
import { HeroPortrait } from './HeroPortrait'

export function Hero() {
  const root = useRef<HTMLElement>(null)
  const lenis = useLenis()
  const t = useT()
  const PROFILE = useContent().profile
  // « AI Product Manager. Je fais passer… » : le rôle passe en grand, la suite reste en texte courant.
  const [heroRole, ...heroTail] = t.hero.statement.split('. ')
  const heroRest = heroTail.join('. ')
  useGSAP(
    () => {
      if (prefersReducedMotion()) return
      // Pas de masque par lettre : il couperait le contour et l'ombre décalée.
      const name = SplitText.create('[data-name]', { type: 'chars' })
      // Les lignes sont recoupées quand la police arrive (autoSplit) : sinon la coupure est calculée avec la police de
      // secours et un mot se retrouve seul sur sa ligne.
      const lines = SplitText.create('[data-statement]', {
        type: 'lines',
        mask: 'lines',
        aria: 'none',
        autoSplit: true,
        onSplit: (self) => gsap.from(self.lines, { yPercent: 110, duration: 1, ease: 'expo.out', stagger: 0.08, delay: 0.75 }),
      })
      const tl = gsap.timeline({ delay: 0.2 })
      tl.from('[data-slab]', { clipPath: 'inset(0 0 100% 0)', duration: 1.1, ease: 'expo.out' })
        .from(name.chars, { yPercent: 60, opacity: 0, duration: 1, ease: 'expo.out', stagger: 0.03 }, 0.2)
        .from('[data-meta]', { opacity: 0, y: 12, duration: 0.8, ease: 'power2.out', stagger: 0.07 }, 0.8)

      // Sortie épurée : le bloc et le portrait remontent doucement.
      gsap.to('[data-slab]', {
        yPercent: -10,
        ease: 'none',
        scrollTrigger: { trigger: root.current, start: 'top top', end: 'bottom top', scrub: true },
      })
      gsap.to('[data-name-wrap]', {
        yPercent: -14,
        ease: 'none',
        scrollTrigger: { trigger: root.current, start: 'top top', end: 'bottom top', scrub: true },
      })
      return () => {
        name.revert()
        lines.revert()
      }
    },
    { scope: root },
  )

  const go = (id: string) => (e: React.MouseEvent) => {
    e.preventDefault()
    scrollToId(lenis, id)
  }

  return (
    <section ref={root} id="top" className="relative isolate z-[25] h-[100svh] min-h-[680px] overflow-hidden" aria-label={t.hero.aria}>
      <h1 className="sr-only">
        {PROFILE.name}, {PROFILE.role}
      </h1>


      <HeroPortrait />

      {/* Couche 1 : le nom. */}
      <div data-name-wrap data-hero-fade className="absolute inset-x-0 bottom-0 z-10 px-[var(--gutter)] pb-[clamp(5.5rem,11vh,7.5rem)] max-md:pb-[5.25rem]">
        <p data-statement className="max-w-[36rem] text-[clamp(1.05rem,0.9rem+0.7vw,1.5rem)] leading-[1.25] font-medium tracking-[-0.01em] text-paper">
          <span className="block text-[clamp(1.9rem,1.1rem+2.8vw,3.6rem)] leading-[1.02] font-bold tracking-[-0.035em]">{heroRole}</span>
          <span className="mt-2 block">{heroRest}</span>
        </p>
        <p
          data-name
          data-solid
          aria-hidden="true"
          className="display brand-name mt-6 text-[clamp(2.4rem,13.4vw,4rem)] md:mt-8 md:text-[clamp(3.6rem,1rem+12.2vw,14rem)]"
        >
          Riyan
          <br />
          <span className="text-signal">Besseghir</span>
        </p>
      </div>

      {/* Points d'accroche des formes 3D du fond (voir SiteScene) : la sculpture se pose sur l'aplat cobalt. */}
      <Anchor kind="robot" className="bottom-[4%] left-[50%] w-[10vw] max-md:hidden" par={0.3} tilt={0.6} />
      <Anchor kind="robot" className="top-[55%] left-[5%] w-[14vw] md:hidden" par={0.3} tilt={0.6} />

      {/* Couche 3 : informations et boutons, toujours lisibles. */}
      <div data-hero-fade className="absolute inset-x-0 top-0 z-30 px-[var(--gutter)] pt-24 md:pt-28">
        <div className="label flex flex-wrap items-center gap-x-6 gap-y-2 text-mist">
          <p data-meta className="flex items-center gap-2.5 !text-[clamp(0.95rem,0.85rem+0.4vw,1.2rem)] font-semibold !tracking-normal !normal-case text-paper">
            <span className="size-2.5 rounded-full bg-vermilion" aria-hidden="true" />
            {PROFILE.availability}
          </p>
          <p data-meta>
            Toulouse <LiveClock className="ml-1 text-paper tabular-nums" />
          </p>
        </div>
      </div>

        <div data-meta data-hero-fade className="absolute left-[var(--gutter)] z-30 flex flex-wrap gap-3 max-md:right-[var(--gutter)] max-md:bottom-6 max-md:grid max-md:grid-cols-2 md:top-[11.25rem]">
          <ShimmerButton
            onClick={go('lab')}
            background="#2B0F3A"
            shimmerColor="#FFD83D"
            shimmerDuration="3.2s"
            className="gap-2 px-7 py-3.5 text-sm font-semibold text-ink max-md:px-3 max-md:text-[13px]"
          >
            {t.hero.cta.work}
            <ArrowDown className="size-4 transition-transform group-hover:translate-y-0.5" aria-hidden="true" />
          </ShimmerButton>
          <motion.a
            href={PROFILE.links.cv}
            target="_blank"
            rel="noreferrer"
            whileHover={{ y: -3 }}
            whileTap={{ scale: 0.94 }}
            transition={{ type: 'spring', stiffness: 420, damping: 18 }}
            className="group inline-flex items-center justify-center gap-2 rounded-full border border-paper px-7 py-3.5 text-sm font-semibold text-paper transition-colors duration-300 hover:bg-paper hover:text-ink max-md:px-3 max-md:text-[13px]"
          >
            {t.hero.cta.cv}
            <ArrowUpRight className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" aria-hidden="true" />
            <span className="sr-only">{t.links.newTab}</span>
          </motion.a>
        </div>

      <p data-meta data-hero-fade className="label absolute right-[var(--gutter)] bottom-8 z-30 text-paper max-md:hidden">
        {t.hero.scroll}
      </p>
    </section>
  )
}
