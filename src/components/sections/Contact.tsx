import { lazy, Suspense, useState } from 'react'
import { ArrowUpRight, Check, Copy } from 'lucide-react'
import { motion } from 'motion/react'
import { useContent } from '../../data/profile'
import { TitleParts, useT } from '../../i18n/useT'
import { useWebGLSupport } from '../../hooks/useWebGLSupport'
import { RevealText } from '../ui/RevealText'
import { LiveClock } from '../ui/LiveClock'
import { ShimmerButton } from '../vendor/magicui/shimmer-button'
import { Anchor } from '../three/Anchor'

const ChromeFlow = lazy(() => import('../three/ChromeFlow'))

export function Contact() {
  const t = useT()
  const PROFILE = useContent().profile
  const webgl = useWebGLSupport()
  const [copied, setCopied] = useState(false)

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(PROFILE.email)
      setCopied(true)
      setTimeout(() => setCopied(false), 2200)
    } catch {
      window.location.href = `mailto:${PROFILE.email}`
    }
  }

  const links = [
    { href: PROFILE.links.linkedin, label: 'LinkedIn', external: true },
    { href: PROFILE.links.github, label: 'GitHub', external: true },
    { href: PROFILE.links.cv, label: t.contact.cv, external: false },
  ]

  return (
    <section id="contact" className="relative px-[var(--gutter)] pt-32 pb-6 md:pt-44">
      <Anchor kind="knot" className="top-[1.5%] right-[5%] w-[22vw] max-md:right-[4%] max-md:w-[36vw]" par={0.1} tilt={0.7} />
      <Anchor kind="orb" className="top-[8%] left-[7%] w-[11vw] max-md:hidden" par={0.25} />
      <Anchor kind="star-cobalt" className="top-[3%] left-[32%] w-[9.5vw] max-md:hidden" par={0.25} tilt={0.9} />
      <Anchor kind="torus" className="top-[9%] right-[30%] w-[7.5vw] max-md:hidden" par={0.25} />
      {/* Grand panneau cobalt arrondi : le seul aplat coloré plein du site, pour marquer la fin. */}
      <div className="relative isolate overflow-hidden rounded-[clamp(36px,5vw,72px)] bg-signal px-[clamp(1.5rem,5vw,5rem)] py-[clamp(3rem,8vw,7rem)] text-ink">
        {webgl && (
          <Suspense fallback={null}>
            <ChromeFlow className="absolute inset-0 -z-10 opacity-90" />
          </Suspense>
        )}

        <p className="flex items-center gap-3">
          <span className="sticker bg-lemon text-paper">{t.contact.label}</span>
          <span className="label text-ink/80">(07)</span>
        </p>

        <RevealText as="h2" className="display mt-8 max-w-5xl !text-ink text-[length:var(--text-title)] [&_em]:!text-lemon">
          <TitleParts parts={t.contact.title} />
        </RevealText>
        <p className="mt-6 max-w-xl text-lg text-ink/85">
          {PROFILE.availability}. {PROFILE.location}.
        </p>

        <a
          href={`mailto:${PROFILE.email}`}
          className="group display mt-14 flex items-center justify-between gap-6 !text-ink text-[clamp(1.5rem,0.4rem+4.3vw,6rem)] break-all"
        >
          <span className="transition-transform duration-500 group-hover:translate-x-2">{PROFILE.email}</span>
          <ArrowUpRight className="size-[0.6em] shrink-0 transition-transform duration-500 group-hover:translate-x-2 group-hover:-translate-y-2" aria-hidden="true" />
        </a>

        <div className="mt-10 flex flex-wrap items-center gap-3">
          <ShimmerButton onClick={copy} background="#20211f" shimmerColor="#d9f05a" className="gap-2 px-7 py-3.5 text-sm font-semibold text-ink">
            {copied ? <Check className="size-4" aria-hidden="true" /> : <Copy className="size-4" aria-hidden="true" />}
            <span aria-live="polite">{copied ? t.contact.copied : t.contact.copy}</span>
          </ShimmerButton>
          {links.map((l) => (
            <motion.a
              key={l.label}
              href={l.href}
              target={l.external ? '_blank' : undefined}
              rel={l.external ? 'noreferrer' : undefined}
              download={l.external ? undefined : true}
              whileHover={{ y: -3 }}
              whileTap={{ scale: 0.93 }}
              transition={{ type: 'spring', stiffness: 420, damping: 18 }}
              className="group inline-flex items-center gap-2 rounded-full border border-ink/70 px-6 py-3.5 text-sm font-semibold text-ink transition-colors duration-300 hover:bg-ink hover:text-paper"
            >
              {l.label}
              <ArrowUpRight className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" aria-hidden="true" />
            </motion.a>
          ))}
        </div>
      </div>

      <footer className="label mt-10 flex flex-wrap items-end justify-between gap-6 text-mist">
        <p>© 2026 {PROFILE.name}</p>
        <p>
          Toulouse <LiveClock className="ml-2 text-paper tabular-nums" />
        </p>
        <p>{t.contact.built}</p>
      </footer>
    </section>
  )
}
