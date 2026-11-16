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
  useGSAP(
    () => {
      if (prefersReducedMotion()) return
      const name = SplitText.create('[data-name]', { type: 'chars', mask: 'chars' })
      const lines = SplitText.create('[data-statement]', { type: 'lines', mask: 'lines', aria: 'none' })
      const tl = gsap.timeline({ delay: 0.2 })
      tl.from('[data-slab]', { clipPath: 'inset(0 0 100% 0)', duration: 1.1, ease: 'expo.out' })
        .from(name.chars, { yPercent: 105, duration: 1.2, ease: 'expo.out', stagger: 0.03 }, 0.2)
        .from(lines.lines, { yPercent: 110, duration: 1, ease: 'expo.out', stagger: 0.08 }, 0.55)
        .from('[data-meta]', { opacity: 0, y: 12, duration: 0.8, ease: 'power2.out', stagger: 0.07 }, 0.8)

      gsap.to('[data-name-wrap]', {
        yPercent: -14,
        ease: 'none',
        scrollTrigger: { trigger: root.current, start: 'top top', end: 'bottom top', scrub: true },
      })
      gsap.to('[data-slab]', {
        yPercent: -10,
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
    <section ref={root} id="top" className="relative h-[100svh] min-h-[680px] overflow-hidden" aria-label={t.hero.aria}>
      <h1 className="sr-only">
        {PROFILE.name}, {PROFILE.role}
      </h1>

      {/* Aplat signature, et par-dessus le portrait en estampe (HeroPortrait). */}
      <div data-slab className="absolute top-[4.75rem] right-[7%] h-[calc(78%-4.75rem)] w-[34%] rounded-[56px] bg-signal max-md:top-36 max-md:right-3 max-md:left-[16%] max-md:h-[36%] max-md:w-auto max-md:rounded-[40px]" aria-hidden="true" />

      <HeroPortrait />

      {/* Couche 1 : le nom. */}
      <div data-name-wrap className="absolute inset-x-0 bottom-0 z-10 px-[var(--gutter)] pb-[clamp(5.5rem,11vh,7.5rem)] max-md:pb-[5.25rem]">
        <p data-statement className="max-w-[28rem] text-[clamp(1.05rem,0.9rem+0.7vw,1.5rem)] leading-[1.25] font-medium tracking-[-0.01em] text-paper">
          {t.hero.statement}
        </p>
        <p
          data-name
          aria-hidden="true"
          className="display brand-name mt-6 text-[clamp(2.4rem,13.4vw,4rem)] md:mt-8 md:text-[clamp(3.6rem,1rem+12.2vw,14rem)]"
        >
          Riyan
          <br />
          Besseghir
        </p>
      </div>

      {/* Points d'accroche des formes 3D du fond (voir SiteScene) : la sculpture se pose sur l'aplat cobalt. */}
      <Anchor kind="robot" className="bottom-[4%] left-[50%] w-[10vw] max-md:hidden" par={0.3} tilt={0.6} />
      <Anchor kind="vinyl" className="bottom-[3%] right-[1.5%] w-[11vw] max-md:hidden" par={0.3} tilt={0.7} />
      <Anchor kind="robot" className="top-[55%] left-[5%] w-[18vw] md:hidden" par={0.3} tilt={0.6} />

      {/* Couche 3 : informations et boutons, toujours lisibles. */}
      <div className="absolute inset-x-0 top-0 z-30 px-[var(--gutter)] pt-24 md:pt-28">
        <div className="label flex flex-wrap items-center gap-x-6 gap-y-2 text-mist">
          <p data-meta className="flex items-center gap-2 text-paper">
            <span className="size-2 rounded-full bg-vermilion" aria-hidden="true" />
            {PROFILE.availability}
          </p>
          <p data-meta>
            Toulouse <LiveClock className="ml-1 text-paper tabular-nums" />
          </p>
        </div>
      </div>

        <div data-meta className="absolute left-[var(--gutter)] z-30 flex flex-wrap gap-3 max-md:right-[var(--gutter)] max-md:bottom-6 max-md:grid max-md:grid-cols-2 md:top-[11.25rem]">
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

      <p data-meta className="label absolute right-[var(--gutter)] bottom-8 z-30 text-paper max-md:hidden">
        {t.hero.scroll}
      </p>
    </section>
  )
}
