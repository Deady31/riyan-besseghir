import { useState } from 'react'
import { ArrowUpRight, Check, Copy } from 'lucide-react'
import { useContent } from '../../data/profile'
import { TitleParts, useT } from '../../i18n/useT'
import { RevealText } from '../ui/RevealText'
import { LiveClock } from '../ui/LiveClock'

export function Contact() {
  const t = useT()
  const PROFILE = useContent().profile
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
    <section id="contact" className="relative px-[var(--gutter)] pt-32 pb-8 md:pt-48">
      <div className="grid gap-8 md:grid-cols-[minmax(0,1fr)_minmax(0,3fr)]">
        <p className="label flex gap-3 pt-3 text-mist">
          <span>(07)</span>
          <span className="text-paper">{t.contact.label}</span>
        </p>
        <div>
          <RevealText as="h2" className="display text-[length:var(--text-title)]">
            <TitleParts parts={t.contact.title} />
          </RevealText>
          <p className="mt-8 max-w-xl text-lg text-mist">
            {PROFILE.availability}. {PROFILE.location}.
          </p>
        </div>
      </div>

      <div className="mt-20 border-t border-line pt-10">
        <a
          href={`mailto:${PROFILE.email}`}
          className="group display flex items-center justify-between gap-6 text-[clamp(2rem,0.8rem+5.4vw,7.5rem)] break-all transition-colors duration-500 hover:text-signal"
        >
          {PROFILE.email}
          <ArrowUpRight className="size-[0.6em] shrink-0 transition-transform duration-500 group-hover:translate-x-2 group-hover:-translate-y-2" aria-hidden="true" />
        </a>
        <button type="button" onClick={copy} className="label mt-6 inline-flex items-center gap-2 text-mist transition-colors hover:text-paper">
          {copied ? <Check className="size-3.5 text-signal" aria-hidden="true" /> : <Copy className="size-3.5" aria-hidden="true" />}
          <span aria-live="polite">{copied ? t.contact.copied : t.contact.copy}</span>
        </button>
      </div>

      <ul className="mt-20 grid border-t border-line md:grid-cols-3">
        {links.map((l) => (
          <li key={l.label} className="border-b border-line md:border-r md:border-b-0 md:last:border-r-0">
            <a
              href={l.href}
              target={l.external ? '_blank' : undefined}
              rel={l.external ? 'noreferrer' : undefined}
              download={l.external ? undefined : true}
              className="group flex items-center justify-between gap-4 py-7 text-2xl tracking-[-0.02em] transition-colors hover:text-signal md:px-8 md:first:pl-0"
            >
              {l.label}
              <ArrowUpRight className="size-5 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" aria-hidden="true" />
            </a>
          </li>
        ))}
      </ul>

      <footer className="label mt-24 flex flex-wrap items-end justify-between gap-6 text-mist">
        <p>© 2026 {PROFILE.name}</p>
        <p>
          Toulouse <LiveClock className="ml-2 text-paper tabular-nums" />
        </p>
        <p>{t.contact.built}</p>
      </footer>
    </section>
  )
}
