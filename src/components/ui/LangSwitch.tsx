import { useLang } from '../../i18n/LangProvider'

export function LangSwitch() {
  const { lang, setLang } = useLang()
  return (
    <label className="rocker" title={lang === 'fr' ? 'Switch to English' : 'Passer en français'}>
      <input
        type="checkbox"
        role="switch"
        checked={lang === 'fr'}
        onChange={(e) => setLang(e.target.checked ? 'fr' : 'en')}
        aria-label={lang === 'fr' ? 'Langue : français. Basculer en anglais' : 'Language: English. Switch to French'}
      />
      <span className="switch-left" aria-hidden="true">
        FR
      </span>
      <span className="switch-right" aria-hidden="true">
        EN
      </span>
    </label>
  )
}
