import { useState } from 'react'
import { IPhoneFrame } from '../ui/IPhoneFrame'
import { useLang } from '../../i18n/LangProvider'
import { useT } from '../../i18n/useT'

const LIVE_URL = 'https://riyan-cv-chatbot.vercel.app'

type Msg = { from: 'user' | 'bot'; text: string; source?: string }

const SCRIPT_EN: Msg[] = [
  { from: 'user', text: 'Tell me about your time at Shippingbo.' },
  {
    from: 'bot',
    text: '10 months as PM/PO, leading up to 3 feature teams. Four AI features shipped, including Miranda, a Claude API assistant that cut level-1 support tickets by 56% in production.',
    source: 'background.md',
  },
  { from: 'user', text: 'And outside of work?' },
  {
    from: 'bot',
    text: 'I build. An agent that found me a Toulouse–Naples flight for €155 instead of €552, a life dashboard coached by Claude, a Godot game… 35 projects in total.',
    source: 'projects.md',
  },
  { from: 'user', text: 'Why you?' },
  {
    from: 'bot',
    text: 'Because I don’t stop at scoping. At the AI for Impact hackathon, I defined the MVP, prototyped it with Claude Code and pitched it to the jury, all in 30 hours.',
    source: 'highlights.md',
  },
]

const SCRIPT_FR: Msg[] = [
  { from: 'user', text: 'Parle-moi de ton expérience chez Shippingbo.' },
  {
    from: 'bot',
    text: '10 mois comme PM/PO, jusqu’à 3 feature teams en parallèle. Quatre features IA livrées, dont Miranda, un assistant sur l’API Claude qui a fait baisser les tickets support N1 de 56 % en production.',
    source: 'parcours.md',
  },
  { from: 'user', text: 'Et en dehors du boulot ?' },
  {
    from: 'bot',
    text: 'Je construis. Un agent qui m’a trouvé un Toulouse–Naples à 155 € au lieu de 552 €, un dashboard de vie coaché par Claude, un jeu Godot… 35 projets au total.',
    source: 'projets.md',
  },
  { from: 'user', text: 'Pourquoi toi ?' },
  {
    from: 'bot',
    text: 'Parce que je ne m’arrête pas au cadrage. Au hackathon IA for Impact, j’ai défini le MVP, je l’ai prototypé avec Claude Code et je l’ai pitché devant le jury, en 30 heures.',
    source: 'hauts-faits.md',
  },
]

export function ChatDemo() {
  const { lang } = useLang()
  const t = useT()
  const CHAT_SCRIPT = lang === 'en' ? SCRIPT_EN : SCRIPT_FR
  const [live, setLive] = useState(false)
  const [loaded, setLoaded] = useState(false)

  return (
    <div className="flex flex-col items-center gap-6">
    <IPhoneFrame className="mx-auto">
      {live && (
        <div className="absolute inset-x-0 top-[5.5%] bottom-0 z-30 bg-[#0b0b0c]">
          {!loaded && (
            <div className="absolute inset-0 grid place-items-center text-[12px] text-white/50" aria-hidden="true">
              {t.chat.connecting}
            </div>
          )}
          <iframe
            src={LIVE_URL}
            title={t.chat.iframeTitle}
            onLoad={() => setLoaded(true)}
            className={`size-full border-0 transition-opacity duration-500 ${loaded ? 'opacity-100' : 'opacity-0'}`}
            data-lenis-prevent
          />
        </div>
      )}
      <div className="absolute inset-0 bg-[radial-gradient(120%_70%_at_50%_0%,#26262b_0%,#0b0b0c_60%)]" aria-hidden="true" />
      <div className="absolute inset-x-0 top-[7%] z-10 flex flex-col items-center gap-1 border-b border-white/10 pb-3 text-center">
        <span className="size-9 rounded-full bg-[radial-gradient(circle_at_35%_30%,#e2d8ff,#8b5cff_55%,#2a1a66)]" aria-hidden="true" />
        <p className="text-[13px] font-medium text-white">Méca-Riyan</p>
        <p className="text-[10px] text-white/50">{t.chat.scripted}</p>
      </div>
      <div data-chat-viewport className="absolute inset-x-0 top-[19%] bottom-[11%] overflow-hidden">
        <div data-chat-list className="flex flex-col gap-2.5 px-3.5 pt-2 pb-4">
          {CHAT_SCRIPT.map((m, i) => (
            <div
              key={i}
              data-msg
              className={
                m.from === 'user'
                  ? 'max-w-[80%] self-end rounded-[18px] rounded-br-[6px] bg-signal px-3.5 py-2 text-[12.5px] leading-snug text-white'
                  : 'max-w-[86%] self-start rounded-[18px] rounded-bl-[6px] bg-white/[0.09] px-3.5 py-2.5 text-[12.5px] leading-snug text-white/95'
              }
            >
              {m.text}
              {m.source && (
                <span className="mt-1.5 block text-[10.5px] text-white/45">
                  {t.chat.source}
                  {lang === 'en' ? ': ' : ' : '}
                  {m.source}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
      <div className="absolute inset-x-3 bottom-[4.2%] z-10 flex items-center gap-2 rounded-full bg-white/[0.08] py-2 pr-1.5 pl-4 text-[12px] text-white/40" aria-hidden="true">
        {t.chat.placeholder}
        <span className="ml-auto grid size-6 place-items-center rounded-full bg-signal text-[11px] text-white">↑</span>
      </div>
    </IPhoneFrame>
      <button
        type="button"
        onClick={() => {
          setLive((v) => !v)
          setLoaded(false)
        }}
        aria-pressed={live}
        className="group inline-flex items-center gap-3 rounded-full border border-line py-2.5 pr-5 pl-3 text-sm transition-colors hover:border-paper"
      >
        <span className="relative flex size-2.5">
          {!live && <span className="absolute inline-flex size-full animate-ping rounded-full bg-signal opacity-70 motion-reduce:hidden" />}
          <span className="relative inline-flex size-2.5 rounded-full bg-signal" />
        </span>
        {live ? t.chat.back : t.chat.tryLive}
      </button>
    </div>
  )
}
