import { useEffect, useRef, useState } from 'react'
import { Send, ShieldCheck, UserRound, RotateCcw, Type } from 'lucide-react'
import { useLang } from '../../i18n/LangProvider'
import { maskSensitive, route, type Intent } from '../../lib/bankDemo'

type Action = 'block' | 'claim' | 'code' | 'human'
type Msg =
  | { k: 'user'; text: string; masked: string[] }
  | { k: 'bot'; text: string; trace?: string[]; sources?: string[] }
  | { k: 'choices'; options: { label: string; value: string }[]; used?: boolean }
  | { k: 'confirm'; action: Action; title: string; text: string; cta: string; done?: boolean }

const COPY = {
  fr: {
    title: 'Banque Exemple · Assistant',
    persona: 'Karim B. · client fictif · carte Visa Classic •••• 4417',
    notice: 'Démo simulée : banque, client et tarifs inventés, aucune IA ni action réelle. Prototype étudiant non officiel.',
    hello: 'Bonjour Karim. Dites-moi ce dont vous avez besoin, avec vos mots. Je ne vous demanderai jamais votre code secret.',
    chips: ['J’ai perdu ma carte', 'Quels sont les frais sur ma carte ?', 'Je veux faire une réclamation', 'J’ai oublié mon code'],
    placeholder: 'Écrivez votre question…',
    send: 'Envoyer',
    big: 'Grand texte',
    reset: 'Recommencer',
    human: 'Parler à un conseiller',
    masked: (l: string[]) => `Masqué avant le modèle : ${l.join(', ')}`,
    lost: 'Je suis désolé, je m’en occupe. Je peux bloquer votre carte Visa Classic •••• 4417 tout de suite. Rien n’est fait sans votre accord.',
    lostCard: { title: 'Bloquer la carte •••• 4417', text: 'La carte ne pourra plus être utilisée. Vous pourrez en commander une nouvelle juste après.', cta: 'Bloquer la carte (simulé)' },
    lostDone: 'C’est fait (simulation) : carte bloquée. Une nouvelle carte arriverait sous 5 jours ouvrés. Voulez-vous parler à un conseiller ?',
    feesTrace: ['Je lis votre carte : Visa Classic', 'Je lis le tarif de cette carte'],
    fees: 'Votre carte Visa Classic coûte 34,00 € par an (tarif de démonstration, pas un vrai tarif). Les retraits dans la zone euro sont inclus dans cet exemple.',
    feesSources: ['Votre carte (données fictives)', 'Tarifs fictifs'],
    claim: 'Je comprends. Sur quoi porte votre réclamation ?',
    claimOptions: [
      { label: 'Un prélèvement', value: 'un prélèvement' },
      { label: 'Des frais', value: 'des frais' },
      { label: 'Autre chose', value: 'autre chose' },
    ],
    claimCard: (v: string) => ({ title: 'Réclamation prête', text: `Objet : ${v}. Je transmets votre demande avec votre contexte, vous n’avez rien à répéter.`, cta: 'Envoyer la réclamation (simulé)' }),
    claimDone: 'Réclamation enregistrée (simulation). Réponse sous 10 jours ouvrés dans cet exemple.',
    code: 'Je ne peux pas voir ni vous dire votre code. Je peux en demander un nouveau, envoyé par courrier.',
    codeCard: { title: 'Nouveau code secret', text: 'Un nouveau code est envoyé par courrier sécurisé. L’ancien reste actif jusqu’à réception.', cta: 'Demander un nouveau code (simulé)' },
    codeDone: 'Demande enregistrée (simulation). Le courrier arriverait sous 3 à 5 jours.',
    humanReply: 'Bien sûr. Un conseiller peut vous rappeler, et il verra déjà votre demande.',
    humanCard: { title: 'Être rappelé', text: 'Un conseiller vous rappelle au numéro de votre dossier.', cta: 'Demander un rappel (simulé)' },
    humanDone: 'Rappel demandé (simulation). Un conseiller vous contacte aujourd’hui dans cet exemple.',
    unknown: 'Je n’ai pas de fiche qui correspond à votre question. Je préfère ne pas deviner : je vous propose un conseiller.',
  },
  en: {
    title: 'Example Bank · Assistant',
    persona: 'Karim B. · fictional customer · Visa Classic card •••• 4417',
    notice: 'Simulated demo: made-up bank, customer and prices, no AI and no real action. Unofficial student prototype.',
    hello: 'Hello Karim. Tell me what you need, in your own words. I will never ask for your secret code.',
    chips: ['I lost my card', 'What are the fees on my card?', 'I want to file a complaint', 'I forgot my code'],
    placeholder: 'Type your question…',
    send: 'Send',
    big: 'Large text',
    reset: 'Start over',
    human: 'Talk to an advisor',
    masked: (l: string[]) => `Masked before the model: ${l.join(', ')}`,
    lost: 'I’m sorry, I’m on it. I can block your Visa Classic card •••• 4417 right now. Nothing happens without your approval.',
    lostCard: { title: 'Block card •••• 4417', text: 'The card can no longer be used. You can order a new one right after.', cta: 'Block the card (simulated)' },
    lostDone: 'Done (simulation): card blocked. A new card would arrive within 5 business days. Would you like to talk to an advisor?',
    feesTrace: ['Reading your card: Visa Classic', 'Reading this card’s price'],
    fees: 'Your Visa Classic card costs €34.00 a year (demo price, not a real one). Euro-zone withdrawals are included in this example.',
    feesSources: ['Your card (fictional data)', 'Fictional price list'],
    claim: 'I understand. What is your complaint about?',
    claimOptions: [
      { label: 'A direct debit', value: 'a direct debit' },
      { label: 'Fees', value: 'fees' },
      { label: 'Something else', value: 'something else' },
    ],
    claimCard: (v: string) => ({ title: 'Complaint ready', text: `Subject: ${v}. I pass your request on with its context, so you don’t have to repeat anything.`, cta: 'Send the complaint (simulated)' }),
    claimDone: 'Complaint registered (simulation). Reply within 10 business days in this example.',
    code: 'I can’t see or tell you your code. I can request a new one, sent by mail.',
    codeCard: { title: 'New secret code', text: 'A new code is sent by secure mail. The old one stays active until it arrives.', cta: 'Request a new code (simulated)' },
    codeDone: 'Request registered (simulation). The letter would arrive within 3 to 5 days.',
    humanReply: 'Of course. An advisor can call you back, and will already see your request.',
    humanCard: { title: 'Get a call back', text: 'An advisor calls you on the number in your file.', cta: 'Request a call back (simulated)' },
    humanDone: 'Call back requested (simulation). An advisor contacts you today in this example.',
    unknown: 'I have no entry that matches your question. I’d rather not guess: I suggest an advisor.',
  },
} as const

/** Démo essayable de l'assistant bancaire : parcours guidés, garde-fou visible, conseiller toujours à portée, grand texte. */
export function BankDemo() {
  const { lang } = useLang()
  const c = COPY[lang]
  const [msgs, setMsgs] = useState<Msg[]>([{ k: 'bot', text: c.hello }])
  const [text, setText] = useState('')
  const [big, setBig] = useState(false)
  const [busy, setBusy] = useState(false)
  const log = useRef<HTMLDivElement>(null)
  const timers = useRef<number[]>([])

  useEffect(() => () => timers.current.forEach(window.clearTimeout), [])
  useEffect(() => {
    log.current?.scrollTo({ top: log.current.scrollHeight, behavior: 'smooth' })
  }, [msgs])
  // Changer de langue repart de zéro : les messages déjà écrits resteraient dans l'ancienne langue.
  useEffect(() => {
    setMsgs([{ k: 'bot', text: COPY[lang].hello }])
  }, [lang])

  const later = (fn: () => void, ms = 550) => {
    setBusy(true)
    const id = window.setTimeout(() => {
      fn()
      setBusy(false)
    }, ms)
    timers.current.push(id)
  }
  const push = (...m: Msg[]) => setMsgs((prev) => [...prev, ...m])

  const respond = (intent: Intent) => {
    later(() => {
      if (intent === 'lost') push({ k: 'bot', text: c.lost }, { k: 'confirm', action: 'block', ...c.lostCard })
      else if (intent === 'fees') push({ k: 'bot', text: c.fees, trace: [...c.feesTrace], sources: [...c.feesSources] })
      else if (intent === 'claim') push({ k: 'bot', text: c.claim }, { k: 'choices', options: [...c.claimOptions] })
      else if (intent === 'code') push({ k: 'bot', text: c.code }, { k: 'confirm', action: 'code', ...c.codeCard })
      else if (intent === 'human') push({ k: 'bot', text: c.humanReply }, { k: 'confirm', action: 'human', ...c.humanCard })
      else push({ k: 'bot', text: c.unknown }, { k: 'confirm', action: 'human', ...c.humanCard })
    })
  }

  const send = (raw: string) => {
    const value = raw.trim()
    if (!value || busy) return
    const m = maskSensitive(value)
    push({ k: 'user', text: m.text, masked: m.found })
    setText('')
    respond(route(m.text))
  }

  const chooseClaim = (i: number, option: { label: string; value: string }) => {
    setMsgs((prev) => prev.map((m, j) => (j === i && m.k === 'choices' ? { ...m, used: true } : m)))
    push({ k: 'user', text: option.label, masked: [] })
    later(() => push({ k: 'confirm', action: 'claim', ...c.claimCard(option.value) }))
  }

  const confirm = (i: number, action: Action) => {
    setMsgs((prev) => prev.map((m, j) => (j === i && m.k === 'confirm' ? { ...m, done: true } : m)))
    const done = { block: c.lostDone, claim: c.claimDone, code: c.codeDone, human: c.humanDone }[action]
    later(() => push({ k: 'bot', text: done }), 400)
  }

  const reset = () => {
    timers.current.forEach(window.clearTimeout)
    setBusy(false)
    setMsgs([{ k: 'bot', text: c.hello }])
  }

  const bubble = 'max-w-[88%] rounded-2xl px-4 py-2.5 leading-snug'
  return (
    <div className={`mx-auto w-full max-w-2xl overflow-hidden rounded-[28px] border-[3px] border-[#2B0F3A] bg-white text-[#2B0F3A] shadow-[var(--shadow-card)] ${big ? 'text-[1.2rem]' : 'text-[0.95rem]'}`}>
      <div className="flex items-center justify-between gap-3 bg-[#2B0F3A] px-4 py-3 text-[#FFF6E5]">
        <div className="min-w-0">
          <p className="font-bold">{c.title}</p>
          <p className="truncate text-[12px] opacity-80">{c.persona}</p>
        </div>
        <div className="flex shrink-0 gap-2">
          <button
            type="button"
            onClick={() => setBig((v) => !v)}
            aria-pressed={big}
            className={`inline-flex min-h-9 items-center gap-1.5 rounded-full border border-[#FFF6E5]/60 px-3 text-[12px] font-semibold ${big ? 'bg-[#FFF6E5] text-[#2B0F3A]' : ''}`}
          >
            <Type className="size-3.5" aria-hidden="true" />
            {c.big}
          </button>
          <button type="button" onClick={reset} aria-label={c.reset} title={c.reset} className="grid size-9 place-items-center rounded-full border border-[#FFF6E5]/60">
            <RotateCcw className="size-3.5" aria-hidden="true" />
          </button>
        </div>
      </div>
      <p className="flex items-start gap-2 bg-[#FFD83D] px-4 py-2 text-[12px] font-semibold">
        <ShieldCheck className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
        {c.notice}
      </p>

      <div ref={log} role="log" aria-live="polite" aria-label={c.title} className="flex h-[24rem] flex-col gap-3 overflow-y-auto bg-[#F7F3FF] p-4">
        {msgs.map((m, i) => {
          if (m.k === 'user')
            return (
              <div key={i} className="flex flex-col items-end gap-1">
                <p className={`${bubble} bg-[#6C2BFF] text-white`}>{m.text}</p>
                {m.masked.length > 0 && (
                  <p className="inline-flex items-center gap-1 rounded-full bg-[#FF7EC8] px-2.5 py-0.5 text-[11px] font-bold">
                    <ShieldCheck className="size-3" aria-hidden="true" />
                    {c.masked(m.masked)}
                  </p>
                )}
              </div>
            )
          if (m.k === 'bot')
            return (
              <div key={i} className="flex flex-col items-start gap-1.5">
                {m.trace && (
                  <ul className="text-[12px] text-[#2B0F3A]/70">
                    {m.trace.map((s) => (
                      <li key={s}>✓ {s}</li>
                    ))}
                  </ul>
                )}
                <p className={`${bubble} border border-[#2B0F3A]/15 bg-white`}>{m.text}</p>
                {m.sources && (
                  <p className="flex flex-wrap gap-1.5">
                    {m.sources.map((s) => (
                      <span key={s} className="rounded-full bg-[#EADFFF] px-2.5 py-0.5 text-[11px] font-semibold">
                        {s}
                      </span>
                    ))}
                  </p>
                )}
              </div>
            )
          if (m.k === 'choices')
            return (
              <div key={i} className="flex flex-wrap gap-2">
                {m.options.map((o) => (
                  <button key={o.value} type="button" disabled={m.used || busy} onClick={() => chooseClaim(i, o)} className="min-h-10 rounded-full border-2 border-[#2B0F3A] bg-white px-4 text-[13px] font-semibold disabled:opacity-50">
                    {o.label}
                  </button>
                ))}
              </div>
            )
          return (
            <div key={i} className="max-w-[92%] rounded-2xl border-2 border-[#6C2BFF] bg-white p-4">
              <p className="font-bold">{m.title}</p>
              <p className="mt-1 leading-snug">{m.text}</p>
              <button
                type="button"
                disabled={m.done || busy}
                onClick={() => confirm(i, m.action)}
                className="mt-3 min-h-11 rounded-full bg-[#6C2BFF] px-5 text-[13px] font-bold text-white disabled:bg-[#2B0F3A]/30"
              >
                {m.done ? '✓' : m.cta}
              </button>
            </div>
          )
        })}
        {busy && <p className="text-[12px] text-[#2B0F3A]/60" aria-hidden="true">…</p>}
      </div>

      <div className="border-t border-[#2B0F3A]/15 bg-white p-3">
        <div className="mb-2 flex flex-wrap gap-2">
          {c.chips.map((q) => (
            <button key={q} type="button" onClick={() => send(q)} disabled={busy} className="min-h-9 rounded-full border border-[#2B0F3A]/40 px-3 text-[12px] font-semibold disabled:opacity-50">
              {q}
            </button>
          ))}
          <button type="button" onClick={() => send(c.human)} disabled={busy} className="inline-flex min-h-9 items-center gap-1.5 rounded-full bg-[#EADFFF] px-3 text-[12px] font-bold disabled:opacity-50">
            <UserRound className="size-3.5" aria-hidden="true" />
            {c.human}
          </button>
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault()
            send(text)
          }}
          className="flex gap-2"
        >
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={c.placeholder}
            aria-label={c.placeholder}
            className="min-h-11 min-w-0 flex-1 rounded-full border-2 border-[#2B0F3A]/40 px-4 outline-none focus:border-[#6C2BFF]"
          />
          <button type="submit" disabled={busy || !text.trim()} aria-label={c.send} className="grid size-11 shrink-0 place-items-center rounded-full bg-[#6C2BFF] text-white disabled:opacity-40">
            <Send className="size-4" aria-hidden="true" />
          </button>
        </form>
      </div>
    </div>
  )
}
