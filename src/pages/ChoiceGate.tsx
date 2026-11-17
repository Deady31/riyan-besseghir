import { useNavigate } from 'react-router'
import { ArrowRight } from 'lucide-react'
import { TitleParts, useT } from '../i18n/useT'
import { setMode } from '../lib/visitorMode'
import { usePageMeta } from '../hooks/usePageMeta'
import { LangSwitch } from '../components/ui/LangSwitch'

/**
 * Premier écran : deux entrées, rien d'autre. Léger exprès (pas de 3D, pas de fond animé) : il s'affiche avant que
 * le portfolio complet ne se charge. « Je recrute » mène à la version courte ; « Je découvre » ouvre le portfolio complet.
 */
export function ChoiceGate() {
  const t = useT()
  const g = t.gate
  const navigate = useNavigate()
  usePageMeta(null, null)

  const choose = (mode: 'recruiter' | 'full') => {
    setMode(mode)
    if (mode === 'recruiter') navigate('/recruteur')
  }

  return (
    <main className="relative grid min-h-svh grid-rows-[auto_1fr_auto] bg-ink px-[var(--gutter)] py-5 text-paper">
      <header className="flex items-center justify-between">
        <span className="flex items-center gap-2 font-semibold tracking-[-0.01em]">
          <span className="grid size-9 place-items-center rounded-full border border-paper text-base font-bold" aria-hidden="true">
            R
          </span>
          riyan.world
        </span>
        <LangSwitch />
      </header>

      <div className="mx-auto flex w-full max-w-5xl flex-col justify-center py-10">
        <p className="label text-mist">{g.eyebrow}</p>
        <h1 className="display mt-4 text-[clamp(2.2rem,1.2rem+4vw,4.6rem)] text-balance">
          <TitleParts parts={g.title} />
        </h1>

        <div className="mt-10 grid gap-5 md:grid-cols-2">
          <button
            type="button"
            onClick={() => choose('recruiter')}
            autoFocus
            className="group flex min-h-[15rem] flex-col justify-between rounded-[36px] border-[3px] border-[#2B0F3A] bg-signal p-7 text-left text-ink shadow-[var(--shadow-card)] transition-transform duration-200 hover:-translate-y-1 focus-visible:-translate-y-1 md:p-9"
          >
            <span>
              <span className="sticker bg-ink text-paper">{g.recruit.tag}</span>
              <span className="display mt-6 block text-[clamp(1.7rem,1.2rem+1.6vw,2.6rem)] !text-ink">{g.recruit.title}</span>
              <span className="mt-3 block max-w-md text-[1.05rem] leading-snug">{g.recruit.text}</span>
            </span>
            <span className="mt-8 inline-flex items-center gap-2 text-sm font-bold">
              {g.recruit.cta}
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
            </span>
          </button>

          <button
            type="button"
            onClick={() => choose('full')}
            className="group flex min-h-[15rem] flex-col justify-between rounded-[36px] border-[3px] border-[#2B0F3A] bg-[#EADFFF] p-7 text-left text-paper shadow-[var(--shadow-card)] transition-transform duration-200 hover:-translate-y-1 focus-visible:-translate-y-1 md:p-9"
          >
            <span>
              <span className="sticker bg-paper text-ink">{g.discover.tag}</span>
              <span className="display mt-6 block text-[clamp(1.7rem,1.2rem+1.6vw,2.6rem)]">{g.discover.title}</span>
              <span className="mt-3 block max-w-md text-[1.05rem] leading-snug">{g.discover.text}</span>
            </span>
            <span className="mt-8 inline-flex items-center gap-2 text-sm font-bold">
              {g.discover.cta}
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
            </span>
          </button>
        </div>
      </div>

      <p className="mx-auto w-full max-w-5xl text-sm text-mist">{g.remember}</p>
    </main>
  )
}
