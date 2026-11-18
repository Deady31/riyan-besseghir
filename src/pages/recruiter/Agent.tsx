import { useState } from 'react'
import { ArrowUpRight } from 'lucide-react'
import { useT } from '../../i18n/useT'
import { Page } from './Page'

const CHATBOT_URL = 'https://riyan-cv-chatbot.vercel.app'

/** Page de l'agent : questions types (copiées dans le presse-papiers, le chat n'accepte pas de question préremplie) et chat intégré. */
export default function Agent() {
  const r = useT().recruiter
  const [chat, setChat] = useState(false)
  const [toast, setToast] = useState(false)

  const copy = (q: string) => {
    navigator.clipboard?.writeText(q).catch(() => undefined)
    setChat(true)
    setToast(true)
    window.setTimeout(() => setToast(false), 2600)
  }

  return (
    <Page title={r.agentTitle}>
      <p className="max-w-2xl text-lg leading-snug text-mist">{r.agentText}</p>
      <ul className="mt-6 flex flex-wrap gap-2">
        {r.agentQuestions.map((q) => (
          <li key={q}>
            <button type="button" onClick={() => copy(q)} className="min-h-11 rounded-2xl border-2 border-[#2B0F3A] bg-[#EADFFF] px-4 py-2 text-left text-sm font-semibold">
              {q}
            </button>
          </li>
        ))}
      </ul>
      {toast && (
        <p role="status" className="mt-3 text-sm font-semibold text-signal">
          {r.agentCopied}
        </p>
      )}
      {chat ? (
        <iframe src={CHATBOT_URL} title="Méca-Riyan" allow="clipboard-read; clipboard-write" className="mt-6 h-[34rem] w-full rounded-2xl border-2 border-[#2B0F3A] bg-white" />
      ) : (
        <button type="button" onClick={() => setChat(true)} className="pop mt-6 min-h-12 bg-signal px-7 text-sm font-bold text-ink">
          {r.agentStart}
        </button>
      )}
      <p className="mt-4">
        <a href={CHATBOT_URL} target="_blank" rel="noreferrer" className="inline-flex min-h-11 items-center gap-1.5 text-sm font-semibold underline underline-offset-4">
          {r.agentOpen}
          <ArrowUpRight className="size-4" aria-hidden="true" />
        </a>
      </p>
    </Page>
  )
}
