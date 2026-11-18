import type { ReactNode } from 'react'
import { Link } from 'react-router'
import { ArrowLeft } from 'lucide-react'
import { useT } from '../../i18n/useT'
import { usePageMeta } from '../../hooks/usePageMeta'

/** Page intérieure : bouton retour toujours visible en haut, gros titre, contenu. `back` = destination du retour. */
export function Page({ title, back = '/recruteur', children }: { title: string; back?: string; children: ReactNode }) {
  const r = useT().recruiter
  usePageMeta(`${title} · ${r.eyebrow}`, null)
  return (
    <main className="mx-auto max-w-5xl px-[var(--gutter)] pt-4 pb-16 md:pt-8">
      <Link to={back} className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold underline-offset-4 hover:underline">
        <ArrowLeft className="size-4" aria-hidden="true" />
        {r.back}
      </Link>
      <h1 className="display mt-4 text-[clamp(2.6rem,1.2rem+6vw,5.6rem)] leading-[0.95]">{title}</h1>
      <div className="mt-8 md:mt-12">{children}</div>
    </main>
  )
}

/** Ligne à la manière d'un sommaire : gros titre à gauche, détail à droite, fin trait en dessous. */
export function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="grid gap-2 border-b border-paper/20 py-5 md:grid-cols-[minmax(0,16rem)_1fr] md:gap-8 md:py-6">
      <h2 className="display text-[clamp(1.4rem,1.1rem+1.2vw,2.2rem)]">{label}</h2>
      <div>{children}</div>
    </div>
  )
}
