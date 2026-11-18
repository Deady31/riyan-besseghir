import { useT } from '../../i18n/useT'
import { Page, Row } from './Page'

/** Compétences : une ligne par thème (langues, outils, formation…), tirées des données du portfolio. */
export default function Skills() {
  const t = useT()
  const facts = t.about.facts.filter(([k]) => !/^(Âge|Age)$/.test(k))
  return (
    <Page title={t.recruiter.skillsTitle}>
      {facts.map(([k, v]) => (
        <Row key={k} label={k}>
          <p className="text-lg font-semibold leading-snug">{v}</p>
        </Row>
      ))}
    </Page>
  )
}
