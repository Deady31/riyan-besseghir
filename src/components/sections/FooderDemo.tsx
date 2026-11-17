import { Link } from 'react-router'
import { ArrowUpRight } from 'lucide-react'
import { LIVE } from '../../data/live'
import { phoneStage } from '../../lib/phoneStage'
import { TitleParts, useT } from '../../i18n/useT'
import { SectionHeading } from '../ui/SectionHeading'
import { Anchor } from '../three/Anchor'
import { PhoneStage } from '../project/PhoneStage'

/**
 * Juste avant Méca-Riyan (section IA) : la vraie appli FOODER, jouable dans le téléphone 3D.
 */
export function FooderDemo() {
  const t = useT()
  const live = LIVE.fooder
  return (
    <section id="demo" className="relative isolate px-[var(--gutter)] py-24 md:py-36" aria-label={t.demo.label}>
      <PhoneStage url={live.url} title="FOODER" closeLabel={t.project.closePhone} />
      <div className="grid items-center gap-12 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
        <div>
          <SectionHeading index="★" label={t.demo.label} title={<TitleParts parts={t.demo.title} />} className="!mb-10" />
          <p className="max-w-xl text-[clamp(1.1rem,0.95rem+0.5vw,1.4rem)] leading-relaxed text-paper">{t.demo.intro}</p>
          <ul className="mt-8 flex flex-wrap gap-3">
            {t.demo.points.map((p, i) => (
              <li key={p} className={i === 0 ? 'sticker bg-lemon' : i === 1 ? 'sticker bg-vermilion' : 'sticker bg-chrome'}>
                {p}
              </li>
            ))}
          </ul>
          <div className="mt-10 flex flex-wrap gap-3">
            <button type="button" onClick={() => phoneStage.setOpen(true)} className="pop inline-flex items-center gap-2 bg-signal px-7 py-3.5 text-sm font-bold text-ink">
              {t.demo.play}
            </button>
            <Link to="/projets/fooder" className="pop inline-flex items-center gap-2 bg-ink px-7 py-3.5 text-sm font-bold text-paper">
              {t.demo.cta}
              <ArrowUpRight className="size-4" aria-hidden="true" />
            </Link>
          </div>
        </div>
        <div className="mx-auto w-full max-w-[460px]">
          <button
            type="button"
            onClick={() => phoneStage.setOpen(true)}
            onPointerEnter={() => phoneStage.setHover(true)}
            onPointerLeave={() => phoneStage.setHover(false)}
            onFocus={() => phoneStage.setHover(true)}
            onBlur={() => phoneStage.setHover(false)}
            aria-label={`${t.project.tapPhone} : FOODER`}
            data-cursor="tap"
            className="relative block aspect-[4/5] w-full cursor-pointer rounded-[48px] lg:aspect-square"
          >
            <Anchor kind="phone" layer="front" screen={live.screen} className="inset-0 w-full" par={0} />
          </button>
          {/* L'étiquette est HORS de la zone du téléphone : la 3D est dessinée par-dessus la page et la masquerait. */}
          <button type="button" onClick={() => phoneStage.setOpen(true)} data-cursor="tap" className="sticker pop mx-auto mt-3 block rotate-[-2deg] bg-lemon text-paper">
            {t.project.tapPhone}
          </button>
        </div>
      </div>
    </section>
  )
}
